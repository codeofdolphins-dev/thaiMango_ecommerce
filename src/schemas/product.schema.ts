import { z } from "zod";
import { normalizeImagePath } from "@/lib/images";

export const variantSchema = z.object({
    id: z.coerce.number<number | string>().int().positive().optional(),
    label: z.string().trim().min(1, "Variant label is required"),
    weight_grams: z.coerce.number<number | string>().int().positive("Weight must be positive"),
    sku: z.string().trim().min(1, "SKU is required"),
    price: z.coerce.number<number | string>().positive("Price must be positive"),
    compare_at_price: z.coerce.number<number | string>().nonnegative(),
    stock: z.coerce.number<number | string>().int().nonnegative(),
    is_default: z.boolean().default(false),
});

/* At least one variant, with SKUs and labels unique within the product. */
const variantsSchema = z
    .array(variantSchema)
    .min(1, "Add at least one variant")
    .superRefine((variants, ctx) => {
        const seenSku = new Map<string, number>();
        const seenLabel = new Map<string, number>();
        variants.forEach((v, i) => {
            const sku = v.sku.toLowerCase();
            const label = v.label.toLowerCase();
            if (seenSku.has(sku)) {
                ctx.addIssue({
                    code: "custom",
                    path: [i, "sku"],
                    message: "Duplicate SKU in this product",
                });
            }
            if (seenLabel.has(label)) {
                ctx.addIssue({
                    code: "custom",
                    path: [i, "label"],
                    message: "Duplicate variant label in this product",
                });
            }
            seenSku.set(sku, i);
            seenLabel.set(label, i);
        });
    });

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
    images: z.array(z.string().trim().min(1).transform(normalizeImagePath)).default([]),
    tags: z.array(z.string().trim().min(1)).default([]),
    highlights: z.array(z.string().trim().min(1)).default([]),
    how_its_made: z.string().trim().optional(),
    storage_info: z.string().trim().optional(),
    ingredients: z.string().trim().optional(),
    status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("DRAFT"),
    variants: variantsSchema,
});

export const productUpdateSchema = productSchema.partial().extend({
    variants: variantsSchema.optional(),
});

export type VariantValues = z.infer<typeof variantSchema>;
export type ProductValues = z.infer<typeof productSchema>;
export type ProductUpdateValues = z.infer<typeof productUpdateSchema>;

/** Exactly one variant carries is_default; falls back to the first. */
export function normalizeVariants<T extends { is_default: boolean }>(variants: T[]): T[] {
    const defaultIndex = variants.findIndex((v) => v.is_default);
    const chosen = defaultIndex === -1 ? 0 : defaultIndex;
    return variants.map((v, i) => ({ ...v, is_default: i === chosen }));
}
