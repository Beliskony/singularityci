// ============ payments/IPayment.ts ============

export enum PaymentMethod {
  MOBILE_MONEY = "MOBILE_MONEY",
  CARD = "CARD",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export interface IPayment {
  id: string;
  siteId: string;
  clientId: string;
  templateId: string;
  amount: number;
  currency: "XOF";
  method: PaymentMethod;
  provider: string;
  providerTransactionRef: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}