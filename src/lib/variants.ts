/** Shape shared by every consumer that renders a product's variant list. */
export interface VariantLike {
    is_default: boolean;
    price: string | number;
    stock: number;
}

/** The variant a product card / row should show: the default, else the first. */
export function defaultVariant<T extends VariantLike>(variants: T[] | null | undefined): T | null {
    if (!variants || variants.length === 0) return null;
    return variants.find((v) => v.is_default) ?? variants[0];
}

/** Lowest price across variants — used for "from <price>" pricing. */
export function minPrice(variants: VariantLike[] | null | undefined): number | null {
    if (!variants || variants.length === 0) return null;
    return Math.min(...variants.map((v) => Number(v.price)));
}

/** Combined stock across every variant of a product. */
export function totalStock(variants: VariantLike[] | null | undefined): number {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((sum, v) => sum + v.stock, 0);
}
