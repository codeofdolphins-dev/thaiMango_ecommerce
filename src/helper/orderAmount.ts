import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/site-data";
import type { CheckoutPayload } from "@/schemas/payment.schema";

export const PRIORITY_SHIPPING = 199;

/**
 * Recomputes the order total server-side, mirroring the storefront math in
 * src/app/(public)/checkout/page.tsx so the charged amount never comes
 * straight from a client-supplied total.
 *
 * TODO: once cart items carry product/variant ids, re-price each line from
 * the DB instead of trusting client line prices, and validate the coupon
 * code against the Coupon table.
 */
export function computeOrderAmount(payload: CheckoutPayload) {
    const subtotal = payload.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const standardCost =
        subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
    const shipping =
        payload.shippingMethod === "priority" ? PRIORITY_SHIPPING : standardCost;
    const discount = Math.round(subtotal * (payload.couponDiscount ?? 0));
    const total = Math.max(0, subtotal - discount + (subtotal > 0 ? shipping : 0));

    return {
        subtotal,
        shipping,
        discount,
        total,
        /** Both Razorpay and Stripe take the amount in paise. */
        amountPaise: Math.round(total * 100),
    };
}
