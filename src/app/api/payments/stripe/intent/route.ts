import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { computeOrderAmount } from "@/helper/orderAmount";
import { checkoutPayloadSchema } from "@/schemas/payment.schema";

export async function POST(req: Request) {
    try {
        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey) {
            const apiError = new ApiError(503, "Stripe is not configured.");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const parsed = checkoutPayloadSchema.safeParse(await req.json());
        if (!parsed.success) {
            const apiError = new ApiError(400, "Invalid checkout payload.", parsed.error.issues);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { amountPaise } = computeOrderAmount(parsed.data);
        // Stripe's minimum charge for INR is ₹0.50 (50 paise).
        if (amountPaise < 50) {
            const apiError = new ApiError(400, "Order total is too low to process.");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const stripe = new Stripe(secretKey);
        const intent = await stripe.paymentIntents.create({
            amount: amountPaise,
            currency: "inr",
            automatic_payment_methods: { enabled: true },
            description: "Thai Mango order",
            receipt_email: parsed.data.customer?.email,
            metadata: {
                customer_name: parsed.data.customer?.name ?? "",
                item_count: String(parsed.data.items.length),
            },
        });

        const apiResponse = new ApiResponse(
            200,
            { clientSecret: intent.client_secret },
            "Payment intent created"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Stripe intent creation failed:", error);
        const apiError = new ApiError(500, "Could not initiate card payment. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
