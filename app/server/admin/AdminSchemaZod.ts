// ============ admin/AdminSchemaZod.ts ============
import { z } from "zod";
import { AdminRole, AdminPermission } from "./IAdmin";

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const adminChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(8, "8 caractères minimum")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
});

export const adminRequestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const adminResetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string()
    .min(8)
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
});

export const createModeratorSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  password: z.string()
    .min(8, "8 caractères minimum")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
  permissions: z.array(z.nativeEnum(AdminPermission))
    .refine((perms) => !perms.includes(AdminPermission.MANAGE_ADMINS), {
      message: "Un modérateur ne peut pas recevoir la permission MANAGE_ADMINS",
    }),
});

export const updateAdminPermissionsSchema = z.object({
  adminId: z.string().uuid(),
  permissions: z.array(z.nativeEnum(AdminPermission)),
});

export const adminRoleSchema = z.nativeEnum(AdminRole);

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminChangePasswordInput = z.infer<typeof adminChangePasswordSchema>;
export type CreateModeratorInput = z.infer<typeof createModeratorSchema>;