// ============ client/Client.repository.ts ============
import { randomUUID } from "crypto";
import { sql } from "kysely";
import { db } from "../config/Connection";
import { IClient, IOtp, OtpPurpose } from "./IClient";

// =========================================================
// CLIENTS
// =========================================================

function mapRowToClient(row: any): IClient {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone ?? undefined,
    passwordHash: row.password_hash ?? undefined,
    googleId: row.google_id ?? undefined,
    fullName: row.full_name,
    isEmailVerified: !!row.is_email_verified,
    isPhoneVerified: !!row.is_phone_verified,
    failedLoginAttempts: row.failed_login_attempts,
    lockedUntil: row.locked_until ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ClientRepositoryImpl {
  async findByEmail(email: string): Promise<IClient | null> {
    const row = await db
      .selectFrom("clients")
      .selectAll()
      .where("email", "=", email)
      .where("deleted_at", "is", null)
      .executeTakeFirst();
    return row ? mapRowToClient(row) : null;
  }

  async findByPhone(phone: string): Promise<IClient | null> {
    const row = await db
      .selectFrom("clients")
      .selectAll()
      .where("phone", "=", phone)
      .where("deleted_at", "is", null)
      .executeTakeFirst();
    return row ? mapRowToClient(row) : null;
  }

  async findByGoogleId(googleId: string): Promise<IClient | null> {
    const row = await db
      .selectFrom("clients")
      .selectAll()
      .where("google_id", "=", googleId)
      .where("deleted_at", "is", null)
      .executeTakeFirst();
    return row ? mapRowToClient(row) : null;
  }

  async findById(id: string): Promise<IClient | null> {
    const row = await db
      .selectFrom("clients")
      .selectAll()
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst();
    return row ? mapRowToClient(row) : null;
  }

  async create(data: Partial<IClient>): Promise<IClient> {
    const id = randomUUID();

    await db
      .insertInto("clients")
      .values({
        id,
        email: data.email!,
        phone: data.phone ?? null,
        password_hash: data.passwordHash ?? null,
        google_id: data.googleId ?? null,
        full_name: data.fullName!,
        is_email_verified: data.isEmailVerified ?? false,
        is_phone_verified: data.isPhoneVerified ?? false,
      })
      .execute();

    const created = await this.findById(id);
    if (!created) throw new Error("CLIENT_CREATION_FAILED");
    return created;
  }

  async linkGoogleId(id: string, googleId: string): Promise<void> {
    await db
      .updateTable("clients")
      .set({ google_id: googleId, is_email_verified: true })
      .where("id", "=", id)
      .execute();
  }

  async updateProfile(
    id: string,
    data: Partial<Pick<IClient, "fullName" | "phone">>
  ): Promise<IClient> {
    await db
      .updateTable("clients")
      .set({
        full_name: data.fullName,
        phone: data.phone,
      })
      .where("id", "=", id)
      .execute();

    const updated = await this.findById(id);
    if (!updated) throw new Error("CLIENT_NOT_FOUND_AFTER_UPDATE");
    return updated;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await db.updateTable("clients").set({ password_hash: passwordHash }).where("id", "=", id).execute();
  }

  async markVerified(id: string, field: "email" | "phone"): Promise<void> {
    await db
      .updateTable("clients")
      .set(field === "email" ? { is_email_verified: true } : { is_phone_verified: true })
      .where("id", "=", id)
      .execute();
  }

  async updateLastLogin(id: string): Promise<void> {
    // Pas de colonne last_login_at sur clients — no-op pour l'instant.
  }

  async incrementFailedAttempts(id: string): Promise<number> {
    await db
      .updateTable("clients")
      .set({ failed_login_attempts: sql`failed_login_attempts + 1` })
      .where("id", "=", id)
      .execute();

    const row = await db
      .selectFrom("clients")
      .select("failed_login_attempts")
      .where("id", "=", id)
      .executeTakeFirst();

    return row?.failed_login_attempts ?? 0;
  }

  async resetFailedAttempts(id: string): Promise<void> {
    await db
      .updateTable("clients")
      .set({ failed_login_attempts: 0, locked_until: null })
      .where("id", "=", id)
      .execute();
  }

  async lockUntil(id: string, until: Date): Promise<void> {
    await db.updateTable("clients").set({ locked_until: until }).where("id", "=", id).execute();
  }

  async softDelete(id: string): Promise<void> {
    await db.updateTable("clients").set({ deleted_at: new Date() }).where("id", "=", id).execute();
  }
}

// =========================================================
// OTP
// =========================================================

function mapRowToOtp(row: any): IOtp {
  return {
    id: row.id,
    clientId: row.client_id,
    code: row.code_hash,
    purpose: row.purpose,
    expiresAt: row.expires_at,
    consumedAt: row.consumed_at ?? undefined,
    createdAt: row.created_at,
  };
}

export class OtpRepositoryImpl {
  async create(data: Partial<IOtp>): Promise<IOtp> {
    const id = randomUUID();

    await db
      .insertInto("otps")
      .values({
        id,
        client_id: data.clientId!,
        code_hash: data.code!,
        purpose: data.purpose! as OtpPurpose,
        expires_at: data.expiresAt!,
      })
      .execute();

    const row = await db.selectFrom("otps").selectAll().where("id", "=", id).executeTakeFirst();
    if (!row) throw new Error("OTP_CREATION_FAILED");
    return mapRowToOtp(row);
  }

  async findLatestValid(clientId: string, purpose: OtpPurpose): Promise<IOtp | null> {
    const row = await db
      .selectFrom("otps")
      .selectAll()
      .where("client_id", "=", clientId)
      .where("purpose", "=", purpose)
      .where("consumed_at", "is", null)
      .orderBy("created_at", "desc")
      .executeTakeFirst();

    return row ? mapRowToOtp(row) : null;
  }

  async markConsumed(otpId: string): Promise<void> {
    await db.updateTable("otps").set({ consumed_at: new Date() }).where("id", "=", otpId).execute();
  }
}