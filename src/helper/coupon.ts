import { prisma } from "@/lib/prismaClient";

/** Thrown when a posted coupon code cannot be honored. */
export class CouponError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CouponError";
    }
}

/**
 * Resolves a code against the Coupon table, enforcing the same rules the
 * admin panel promises: active, not expired, under its usage limit. Both the
 * public validate endpoint and computeOrderAmount go through here so the
 * storefront can never show a discount the server would refuse.
 */
export async function validateCoupon(code: string) {
    const normalized = code.trim().toUpperCase();
    const coupon = normalized
        ? await prisma.coupon.findUnique({ where: { code: normalized } })
        : null;

    if (!coupon || !coupon.is_active) {
        throw new CouponError("Invalid promo code.");
    }
    if (coupon.expires_at < new Date()) {
        throw new CouponError("This promo code has expired.");
    }
    if (coupon.used >= coupon.usage_limit) {
        throw new CouponError("This promo code has reached its usage limit.");
    }
    return coupon;
}
