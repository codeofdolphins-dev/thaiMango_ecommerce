/** Neutral square placeholder shown when a product has no photos yet. */
export const PRODUCT_PLACEHOLDER = "/images/placeholder-product.png";

/** Local paths saved without a leading slash ("images/x.png") resolve against
 *  the current route and 404 on nested pages; absolute URLs and data URIs
 *  pass through untouched. */
export function normalizeImagePath(src: string): string {
    const s = src.trim();
    if (!s || s.startsWith("/") || /^(https?:)?\/\//i.test(s) || s.startsWith("data:")) {
        return s;
    }
    return `/${s}`;
}

/** Product image at `index`, normalized, falling back to the placeholder. */
export function productImage(images: string[] | null | undefined, index = 0): string {
    const src = images?.[index];
    return src ? normalizeImagePath(src) : PRODUCT_PLACEHOLDER;
}
