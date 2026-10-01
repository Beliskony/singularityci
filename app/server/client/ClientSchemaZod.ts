// ============ client/ClientSchemaZod.ts ============
import { z } from "zod";

// Format téléphone CI : +225 suivi de 10 chiffres (à ajuster si tu gères d'autres pays)
const ivorianPhoneRegex = /^\+225[0-9]{10}$/;

export const loginClientSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const requestOtpSchema = z.object({
  clientId: z.string().uuid(),
  purpose: z.enum(["REGISTER", "LOGIN", "PASSWORD_RESET"]),
});

export const verifyOtpSchema = z.object({
  clientId: z.string().uuid(),
  code: z.string().length(6),
  purpose: z.enum(["REGISTER", "LOGIN", "PASSWORD_RESET"]),
});

export const resetPasswordSchema = z.object({
  clientId: z.string().uuid(),
  otpCode: z.string().length(6),
  newPassword: z.string()
    .min(8)
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
});

export const updateClientProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(ivorianPhoneRegex, "Numéro invalide (format +225XXXXXXXXXX)").optional(),
});

export const changeClientPasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(8, "8 caractères minimum")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
});
// ============ client/ClientSchemaZod.ts (registerClientSchema mis à jour) ============

export const registerClientSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(ivorianPhoneRegex, "Numéro invalide (format +225XXXXXXXXXX)"),
  fullName: z.string().min(2).max(100),
  password: z.string()
    .min(8, "8 caractères minimum")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
  recaptchaToken: z.string().min(1, "Vérification anti-robot manquante"),
  website: z.string().max(0, "Champ invalide").optional(), // honeypot : doit rester vide, "website" trompe les bots qui remplissent tout
});



export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type RegisterClientInput = z.infer<typeof registerClientSchema>;
export type LoginClientInput = z.infer<typeof loginClientSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type UpdateClientProfileInput = z.infer<typeof updateClientProfileSchema>;
export type ChangeClientPasswordInput = z.infer<typeof changeClientPasswordSchema>;