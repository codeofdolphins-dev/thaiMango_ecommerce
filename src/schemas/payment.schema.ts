import { z } from "zod";

/** Cart payload sent by the checkout page to the payment routes. */
export const checkoutPayloadSchema = z.object({
    items: z
        .array(
            z.object({
                name: z.string().min(1),
                price: z.number().positive(),
                quantity: z.number().int().min(1).max(50),
                size: z.string().optional(),
            })
        )
        .min(1),
    shippingMethod: z.enum(["standard", "priority"]),
    couponDiscount: z.number().min(0).max(0.5).default(0),
    customer: z
        .object({
            name: z.string().optional(),
            email: z.email().optional(),
            phone: z.string().optional(),
        })
        .optional(),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;

export const razorpayVerifySchema = z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
});
