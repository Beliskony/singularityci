// ============ authClient/authClient.service.ts ============
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomInt } from "crypto";
import { IClient, IOtp, IClientAuthPayload, OtpPurpose } from "../client/IClient";
import { RegisterClientInput, LoginClientInput } from "../client/ClientSchemaZod";

const JWT_SECRET = process.env.JWT_SECRET!;
const CLIENT_TOKEN_TTL = "7d";
const OTP_TTL_MINUTES = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

// ---- Contrats des repositories ----

interface ClientRepository {
  findByEmail(email: string): Promise<IClient | null>;
  findByPhone(phone: string): Promise<IClient | null>;
  findByGoogleId(googleId: string): Promise<IClient | null>;
  findById(id: string): Promise<IClient | null>;
  create(data: Partial<IClient>): Promise<IClient>;
  linkGoogleId(id: string, googleId: string): Promise<void>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
  markVerified(id: string, field: "email" | "phone"): Promise<void>;
  updateLastLogin(id: string): Promise<void>;
  incrementFailedAttempts(id: string): Promise<number>;
  resetFailedAttempts(id: string): Promise<void>;
  lockUntil(id: string, until: Date): Promise<void>;
}

interface OtpRepository {
  create(data: Partial<IOtp>): Promise<IOtp>;
  findLatestValid(clientId: string, purpose: OtpPurpose): Promise<IOtp | null>;
  markConsumed(otpId: string): Promise<void>;
}

interface OtpSender {
  sendSms(phone: string, code: string): Promise<void>;
}

interface GoogleAuthVerifier {
  verifyIdToken(idToken: string): Promise<{
    googleId: string;
    email: string;
    fullName: string;
    emailVerified: boolean;
  }>;
}

// ---- Erreurs métier typées ----

export class InvalidCredentialsError extends Error {
  constructor() {
    super("INVALID_CREDENTIALS");
    this.name = "InvalidCredentialsError";
  }
}

export class AccountLockedError extends Error {
  constructor(until: Date) {
    super(`ACCOUNT_LOCKED_UNTIL:${until.toISOString()}`);
    this.name = "AccountLockedError";
  }
}

export class AccountUsesGoogleLoginError extends Error {
  constructor() {
    super("ACCOUNT_USES_GOOGLE_LOGIN");
    this.name = "AccountUsesGoogleLoginError";
  }
}

export class OtpError extends Error {
  constructor(reason: "NOT_FOUND" | "EXPIRED" | "INVALID") {
    super(`OTP_${reason}`);
    this.name = "OtpError";
  }
}

export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

const RECAPTCHA_MIN_SCORE = 0.5; // 0 = très probablement un bot, 1 = très probablement humain

interface RecaptchaVerifier {
  verify(token: string, expectedAction: string): Promise<{ success: boolean; score: number }>;
}

export class AuthClientService {
  constructor(
    private clientRepo: ClientRepository,
    private otpRepo: OtpRepository,
    private otpSender: OtpSender,
    private googleVerifier: GoogleAuthVerifier,
    private recaptchaVerifier: RecaptchaVerifier
  ) {}

  // =========================================================
  // INSCRIPTION CLASSIQUE
  // =========================================================

  async register(input: RegisterClientInput): Promise<{ clientId: string }> {
     // Honeypot : un humain ne voit jamais ce champ, un bot qui remplit tout le formulaire si.
    // Vérifié en tout premier, avant même d'appeler Google — inutile de payer le coût
    // d'un appel réseau à reCAPTCHA si le honeypot suffit déjà à disqualifier.
    if (input.website) {
      throw new BusinessRuleError("REGISTRATION_REJECTED");
    }

    const { success, score } = await this.recaptchaVerifier.verify(input.recaptchaToken, "register");
    if (!success || score < RECAPTCHA_MIN_SCORE) {
      throw new BusinessRuleError("RECAPTCHA_FAILED");
    }
    
    const [existingEmail, existingPhone] = await Promise.all([
      this.clientRepo.findByEmail(input.email),
      this.clientRepo.findByPhone(input.phone),
    ]);
    if (existingEmail) throw new BusinessRuleError("EMAIL_ALREADY_USED");
    if (existingPhone) throw new BusinessRuleError("PHONE_ALREADY_USED");

    const passwordHash = await bcrypt.hash(input.password, 12);
    const client = await this.clientRepo.create({
      email: input.email,
      phone: input.phone,
      fullName: input.fullName,
      passwordHash,
      isEmailVerified: false,
      isPhoneVerified: false,
    });

    // input.phone est garanti (champ requis du schéma), contrairement à client.phone
    // qui reste typé optionnel côté IClient — donc on repart de la valeur d'entrée.
    await this.sendOtp(client.id, input.phone, "REGISTER");
    return { clientId: client.id };
  }

  // =========================================================
  // LOGIN CLASSIQUE (avec verrouillage progressif)
  // =========================================================

  async login(input: LoginClientInput): Promise<{ token: string; client: IClient }> {
    const client = await this.clientRepo.findByEmail(input.email);
    if (!client) throw new InvalidCredentialsError();

    if (client.lockedUntil && client.lockedUntil.getTime() > Date.now()) {
      throw new AccountLockedError(client.lockedUntil);
    }

    if (!client.passwordHash) {
      // Compte créé via Google, jamais de mot de passe défini
      throw new AccountUsesGoogleLoginError();
    }

    const valid = await bcrypt.compare(input.password, client.passwordHash);
    if (!valid) {
      await this.handleFailedLogin(client);
      throw new InvalidCredentialsError();
    }

    await this.clientRepo.resetFailedAttempts(client.id);
    await this.clientRepo.updateLastLogin(client.id);

    const token = this.issueToken(client.id);
    return { token, client };
  }

  private async handleFailedLogin(client: IClient): Promise<void> {
    const attempts = await this.clientRepo.incrementFailedAttempts(client.id);
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const until = new Date(Date.now() + LOCK_DURATION_MINUTES * 60_000);
      await this.clientRepo.lockUntil(client.id, until);
    }
  }

  // =========================================================
  // GOOGLE (connexion ou inscription en un seul appel)
  // =========================================================

  async loginOrRegisterWithGoogle(
    idToken: string
  ): Promise<{ token: string; client: IClient; isNewAccount: boolean }> {
    const profile = await this.googleVerifier.verifyIdToken(idToken);

    if (!profile.emailVerified) {
      throw new BusinessRuleError("GOOGLE_EMAIL_NOT_VERIFIED");
    }

    const existingByGoogleId = await this.clientRepo.findByGoogleId(profile.googleId);
    if (existingByGoogleId) {
      const token = this.issueToken(existingByGoogleId.id);
      return { token, client: existingByGoogleId, isNewAccount: false };
    }

    const existingByEmail = await this.clientRepo.findByEmail(profile.email);
    if (existingByEmail) {
      await this.clientRepo.linkGoogleId(existingByEmail.id, profile.googleId);
      const token = this.issueToken(existingByEmail.id);
      return { token, client: existingByEmail, isNewAccount: false };
    }

    const created = await this.clientRepo.create({
      email: profile.email,
      fullName: profile.fullName,
      googleId: profile.googleId,
      isEmailVerified: true,
      isPhoneVerified: false,
    });

    const token = this.issueToken(created.id);
    return { token, client: created, isNewAccount: true };
  }

  // =========================================================
  // OTP (registre, vérification téléphone, base du reset password)
  // =========================================================

  async sendOtp(clientId: string, phone: string, purpose: OtpPurpose): Promise<void> {
    const code = randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);

    await this.otpRepo.create({
      clientId,
      code: codeHash,
      purpose,
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000),
    });

    await this.otpSender.sendSms(phone, code);
  }

  async verifyOtp(clientId: string, code: string, purpose: OtpPurpose): Promise<void> {
    const otp = await this.otpRepo.findLatestValid(clientId, purpose);
    if (!otp) throw new OtpError("NOT_FOUND");
    if (otp.expiresAt.getTime() < Date.now()) throw new OtpError("EXPIRED");

    const valid = await bcrypt.compare(code, otp.code);
    if (!valid) throw new OtpError("INVALID");

    await this.otpRepo.markConsumed(otp.id);

    if (purpose === "REGISTER") {
      await this.clientRepo.markVerified(clientId, "phone");
    }
  }

  // =========================================================
  // MOT DE PASSE OUBLIÉ (via OTP SMS)
  // =========================================================

  async requestPasswordReset(email: string): Promise<void> {
    const client = await this.clientRepo.findByEmail(email);
    if (!client) return; // ne jamais révéler si l'email existe

    if (!client.phone) {
      // Compte Google sans téléphone renseigné : pas de canal SMS disponible.
      // On l'assume comme un cas distinct plutôt qu'un no-op silencieux, cohérent
      // avec le fait qu'on distingue déjà les comptes Google dans login().
      throw new BusinessRuleError("NO_PHONE_ON_FILE_FOR_RESET");
    }

    await this.sendOtp(client.id, client.phone, "PASSWORD_RESET");
  }

  async resetPassword(clientId: string, otpCode: string, newPassword: string): Promise<void> {
    await this.verifyOtp(clientId, otpCode, "PASSWORD_RESET");

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.clientRepo.updatePasswordHash(clientId, passwordHash);
    await this.clientRepo.resetFailedAttempts(clientId);
  }

  // =========================================================
  // HELPER PRIVÉ
  // =========================================================

  private issueToken(clientId: string): string {
    const payload: IClientAuthPayload = { clientId };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: CLIENT_TOKEN_TTL });
  }
}