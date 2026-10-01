// ============ client/IClient.ts ============

export interface IClient {
  id: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  googleId?: string;
  fullName: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OtpPurpose = "REGISTER" | "LOGIN" | "PASSWORD_RESET";

export interface IOtp {
  id: string;
  clientId: string;
  code: string; // haché
  purpose: OtpPurpose;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
}

export interface IClientAuthPayload {
  clientId: string;
}

export interface ISiteRsvpSummary {
  submissionsCount: number;      // nombre de formulaires RSVP soumis (tous statuts confondus)
  confirmedGuestsCount: number;  // somme de numberOfGuests pour les statuts ATTENDING
  absentGuestsCount: number;     // somme de numberOfGuests pour les statuts NOT_ATTENDING
}