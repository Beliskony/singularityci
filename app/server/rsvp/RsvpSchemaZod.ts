// ============ rsvp/RsvpSchemaZod.ts ============
import { z } from "zod";

export const submitRsvpSchema = z.object({
  siteId: z.string().uuid(),
  guestName: z.string().min(2).max(100),
  guestPhone: z.string().optional(),
  guestEmail: z.string().email().optional(),
  numberOfGuests: z.number().int().min(1).max(20),
  status: z.enum(["ATTENDING", "NOT_ATTENDING", "PENDING"]),
  message: z.string().max(300).optional(),
});

export type SubmitRsvpInput = z.infer<typeof submitRsvpSchema>;