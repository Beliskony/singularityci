// ============ authClient/infra/RecaptchaVerifier.ts ============

export interface RecaptchaResult {
  success: boolean;
  score: number;
}

interface RecaptchaVerifier {
  verify(token: string, expectedAction: string): Promise<RecaptchaResult>;
}

export class RecaptchaVerifierImpl implements RecaptchaVerifier {
  async verify(token: string, expectedAction: string): Promise<RecaptchaResult> {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY!,
        response: token,
      }),
    });

    const data = await response.json();

    return {
      success: data.success === true && data.action === expectedAction,
      score: data.score ?? 0,
    };
  }
}