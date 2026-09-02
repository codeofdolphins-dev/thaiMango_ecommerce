import { z } from "zod";

/** Cart payload sent by the checkout page to the payment routes. */
export const checkoutPayloadSchema = z.object({
    items: z
        .array(
            z.object({
                /** Product slug, when the line came from a catalog page. */
                slug: z.string().optional(),
                name: z.string().min(1),
                price: z.number().positive(),
                quantity: z.number().int().min(1).max(50),
                size: z.string().optional(),
            })
        )
        .min(1),
    shippingMethod: z.enum(["standard", "priority"]),
    /** Coupon CODE only — the discount itself always comes from the Coupon
     *  table server-side, never from the client. */
    couponCode: z.string().trim().toUpperCase().max(32).optional(),
    customer: z
        .object({
            name: z.string().optional(),
            email: z.email().optional(),
            phone: z.string().optional(),
        })
        .optional(),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;

/** Everything POST /api/orders needs on top of the cart itself. */
export const placeOrderSchema = checkoutPayloadSchema.extend({
    payment: z.enum(["PREPAID", "COD"]),
    /** Gateway payment id — absent for cash on delivery. */
    paymentRef: z.string().min(1).optional(),
    shipping: z.object({
        name: z.string().trim().min(1, "Recipient name is required"),
        phone: z.string().trim().min(7, "A contact number is required"),
        line1: z.string().trim().min(1, "Address line is required"),
        city: z.string().trim().min(1, "City is required"),
        state: z.string().trim().min(1, "State is required"),
        pincode: z.string().trim().min(4, "Enter a valid pincode"),
        country: z.string().trim().min(1).default("India"),
    }),
});

export type PlaceOrderPayload = z.infer<typeof placeOrderSchema>;

export const razorpayVerifySchema = z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
});
