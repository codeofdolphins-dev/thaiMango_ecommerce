import { z } from "zod";

export const signUpSchema = z
    .object({
        f_name: z.string().trim().min(1, "First name is required"),
        l_name: z.string().trim().min(1, "Last name is required"),
        email: z.email("Enter a valid email address"),
        ph_no: z.string().trim().min(7, "Enter a valid phone number"),
        choice: z.enum(["Classic", "Spicy", "Sweet & Glazed", "Fusion"]),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirm_password: z.string(),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"],
    });