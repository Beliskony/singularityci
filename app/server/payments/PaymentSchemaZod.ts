// ============ payments/PaymentSchemaZod.ts ============
import { z } from "zod";
import { PaymentMethod } from "./IPayment";

export const initiatePaymentSchema = z.object({
  siteId: z.string().uuid(),
  method: z.nativeEnum(PaymentMethod),
});

// Payload générique reçu du webhook provider avant mapping vers ton format interne
export const paymentWebhookSchema = z.object({
  providerTransactionRef: z.string().min(1),
  status: z.enum(["SUCCESS", "FAILED"]),
  amount: z.number().int().positive(),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;