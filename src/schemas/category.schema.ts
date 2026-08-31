import { z } from "zod";

export const categorySchema = z.object({
    slug: z
        .string()
        .trim()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and dashes"),
    name_en: z.string().trim().min(1, "English name is required"),
    name_th: z.string().trim().min(1, "Thai name is required"),
    cat_id: z.number().int().positive().nullable().optional(),
});

export type CategoryValues = z.infer<typeof categorySchema>;
