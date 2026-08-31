import { z } from "zod";

export const productSchema = z.object({
    slug: z
        .string()
        .trim()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and dashes"),
    category_id: z.coerce.number<number | string>().int().positive("Select a category"),
    name_en: z.string().trim().min(1, "English name is required"),
    name_th: z.string().trim().min(1, "Thai name is required"),
    description_en: z.string().trim().min(1, "English description is required"),
    description_th: z.string().trim().min(1, "Thai description is required"),
    images: z.array(z.string().trim().min(1)).default([]),
    tags: z.array(z.string().trim().min(1)).default([]),
    highlights: z.array(z.string().trim().min(1)).default([]),
    how_its_made: z.string().trim().optional(),
    storage_info: z.string().trim().optional(),
    ingredients: z.string().trim().optional(),
    status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("DRAFT"),
    variant: z.object({
        label: z.string().trim().min(1, "Variant label is required"),
        weight_grams: z.coerce.number<number | string>().int().positive("Weight must be positive"),
        sku: z.string().trim().min(1, "SKU is required"),
        price: z.coerce.number<number | string>().positive("Price must be positive"),
        compare_at_price: z.coerce.number<number | string>().nonnegative(),
        stock: z.coerce.number<number | string>().int().nonnegative(),
        is_default: z.boolean().default(true),
    }),
});

export const productUpdateSchema = productSchema.partial().extend({
    variant: productSchema.shape.variant.partial().optional(),
});

export type ProductValues = z.infer<typeof productSchema>;
export type ProductUpdateValues = z.infer<typeof productUpdateSchema>;
