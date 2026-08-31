import { z } from "zod";

export const addressSchema = z.object({
    line1: z.string().trim().min(1, "Address line is required"),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    pincode: z.string().trim().min(4, "Enter a valid pincode"),
    is_default: z.boolean().default(false),
});

export type AddressValues = z.infer<typeof addressSchema>;
