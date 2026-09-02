import { z } from "zod";

export const forgetPasswordSchema = z.object({
    email: z.email("Enter a valid email address"),
});

/** Reset via an emailed token (forgot-password flow, customers only). */
export const resetWithTokenSchema = z
    .object({
        token: z.string().min(1, "Reset token is missing"),
        new_password: z.string().min(8, "Password must be at least 8 characters"),
        confirm_password: z.string(),
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"],
    });

export const resetPasswordSchema = z
    .object({
        old_password: z.string().min(8, "Password must be at least 8 characters"),
        new_password: z.string().min(8, "Password must be at least 8 characters"),
        confirm_password: z.string(),
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"],
    });