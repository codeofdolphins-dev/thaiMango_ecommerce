import { z } from "zod";

export const couponSchema = z.object({
    code: z
        .string()
        .trim()
        .min(3, "Code must be at least 3 characters")
        .regex(/^[A-Z0-9]+$/, "Uppercase letters and numbers only"),
    description: z.string().trim().min(1, "Description is required"),
    discount_pct: z.coerce.number<number | string>().int().min(1, "Min 1%").max(100, "Max 100%"),
    usage_limit: z.coerce.number<number | string>().int().positive("Limit must be positive"),
    expires_at: z.coerce.date<Date | string>(),
    is_active: z.boolean().default(true),
});

export type CouponValues = z.infer<typeof couponSchema>;
