// ============ authClient/infra/NotImplementedOtpSender.ts ============
export class NotImplementedOtpSender {
  async sendSms(phone: string, code: string): Promise<void> {
    throw new Error("OtpSender non configuré — choisis un fournisseur SMS (Twilio, agrégateur local...)");
  }
}