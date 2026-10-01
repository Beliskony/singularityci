// ============ authAdmin/authAdmin.service.ts ============
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { IAdmin, IAdminAuthPayload } from "../admin/IAdmin";
import {
  AdminLoginInput,
  AdminChangePasswordInput,
} from "../admin/AdminSchemaZod";

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_TOKEN_TTL = "12h";
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const RESET_TOKEN_TTL_MINUTES = 30;

// ---- Contrats des repositories ----

interface AdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
  findById(id: string): Promise<IAdmin | null>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
  updateLastLogin(id: string): Promise<void>;
  incrementFailedAttempts(id: string): Promise<number>; // retourne le nouveau compteur
  resetFailedAttempts(id: string): Promise<void>;
  lockUntil(id: string, until: Date): Promise<void>;
}

interface PasswordResetRepository {
  create(adminId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  findValidByTokenHash(tokenHash: string): Promise<{ adminId: string; expiresAt: Date } | null>;
  consume(tokenHash: string): Promise<void>;
}

interface ResetEmailSender {
  sendPasswordResetLink(email: string, rawToken: string): Promise<void>;
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

export class AccountInactiveError extends Error {
  constructor() {
    super("ACCOUNT_INACTIVE");
    this.name = "AccountInactiveError";
  }
}

export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

export class AuthAdminService {
  constructor(
    private adminRepo: AdminRepository,
    private resetRepo: PasswordResetRepository,
    private resetSender: ResetEmailSender
  ) {}

  // =========================================================
  // LOGIN
  // =========================================================

  async login(input: AdminLoginInput): Promise<{ token: string; admin: IAdmin }> {
    const admin = await this.adminRepo.findByEmail(input.email);

    // Même erreur générique que l'admin existe ou non : pas d'énumération de comptes
    if (!admin) throw new InvalidCredentialsError();

    if (admin.lockedUntil && admin.lockedUntil.getTime() > Date.now()) {
      throw new AccountLockedError(admin.lockedUntil);
    }

    if (!admin.isActive) throw new AccountInactiveError();

    const valid = await bcrypt.compare(input.password, admin.passwordHash);
    if (!valid) {
      await this.handleFailedLogin(admin);
      throw new InvalidCredentialsError();
    }

    await this.adminRepo.resetFailedAttempts(admin.id);
    await this.adminRepo.updateLastLogin(admin.id);

    const token = this.issueToken(admin);
    return { token, admin };
  }

  private async handleFailedLogin(admin: IAdmin): Promise<void> {
    const attempts = await this.adminRepo.incrementFailedAttempts(admin.id);

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const until = new Date(Date.now() + LOCK_DURATION_MINUTES * 60_000);
      await this.adminRepo.lockUntil(admin.id, until);
    }
  }

  // =========================================================
  // CHANGEMENT DE MOT DE PASSE (self-service, connecté)
  // =========================================================

  async changePassword(adminId: string, input: AdminChangePasswordInput): Promise<void> {
    const admin = await this.adminRepo.findById(adminId);
    if (!admin) throw new InvalidCredentialsError();

    const valid = await bcrypt.compare(input.currentPassword, admin.passwordHash);
    if (!valid) throw new BusinessRuleError("CURRENT_PASSWORD_INVALID");

    const sameAsBefore = await bcrypt.compare(input.newPassword, admin.passwordHash);
    if (sameAsBefore) throw new BusinessRuleError("NEW_PASSWORD_MUST_DIFFER");

    const passwordHash = await bcrypt.hash(input.newPassword, 12);
    await this.adminRepo.updatePasswordHash(adminId, passwordHash);
  }

  // =========================================================
  // MOT DE PASSE OUBLIÉ (par email, token à usage unique)
  // =========================================================

  async requestPasswordReset(email: string): Promise<void> {
    const admin = await this.adminRepo.findByEmail(email);
    if (!admin) return; // ne jamais révéler si l'email existe

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000);

    await this.resetRepo.create(admin.id, tokenHash, expiresAt);
    await this.resetSender.sendPasswordResetLink(admin.email, rawToken);
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    const record = await this.resetRepo.findValidByTokenHash(tokenHash);

    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new BusinessRuleError("RESET_TOKEN_INVALID_OR_EXPIRED");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.adminRepo.updatePasswordHash(record.adminId, passwordHash);
    await this.adminRepo.resetFailedAttempts(record.adminId); // au cas où le compte était verrouillé
    await this.resetRepo.consume(tokenHash);
  }

  // =========================================================
  // HELPERS PRIVÉS
  // =========================================================

  private issueToken(admin: IAdmin): string {
    const payload: IAdminAuthPayload = {
      adminId: admin.id,
      role: admin.role,
      permissions: admin.permissions,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ADMIN_TOKEN_TTL });
  }

  // Le token brut part par email, seul son hash SHA-256 est stocké en DB
  // (contrairement au password, pas besoin de bcrypt ici : le token est déjà
  // aléatoire à haute entropie, pas un mot de passe choisi par un humain)
  private hashToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }
}