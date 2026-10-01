// ============ authClient/infra/GoogleAuthVerifier.ts ============
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
}

export class GoogleAuthVerifierImpl {
  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      throw new Error("INVALID_GOOGLE_TOKEN");
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      fullName: payload.name ?? payload.email,
      emailVerified: !!payload.email_verified,
    };
  }
}