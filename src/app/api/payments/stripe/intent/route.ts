import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { computeOrderAmount } from "@/helper/orderAmount";
import { checkoutPayloadSchema } from "@/schemas/payment.schema";
import { CouponError } from "@/helper/coupon";
import { getStoreSettings, resolveGatewayCredentials } from "@/lib/storeSettings";
import { CURRENCIES } from "@/lib/currency";

export async function POST(req: Request) {
    try {
        /* Keys come from admin Settings, falling back to .env. */
        const settings = await getStoreSettings();
        const { stripe: stripeCreds } = resolveGatewayCredentials(settings);
        if (!stripeCreds.enabled) {
            const apiError = new ApiError(
                503,
                stripeCreds.configured
                    ? "Stripe is turned off."
                    : "Stripe is not configured."
            );
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }
        const secretKey = stripeCreds.secretKey;

        const parsed = checkoutPayloadSchema.safeParse(await req.json());
        if (!parsed.success) {
            const apiError = new ApiError(400, "Invalid checkout payload.", parsed.error.issues);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        /* Currency and amount are resolved from the visitor's location and the
           live FX rate — the same values the storefront displayed. */
        const { currency, amountMinor } = await computeOrderAmount(
            parsed.data,
            req.headers
        );
        if (amountMinor < CURRENCIES[currency].minChargeMinor) {
            const apiError = new ApiError(400, "Order total is too low to process.");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const stripe = new Stripe(secretKey);
        const intent = await stripe.paymentIntents.create({
            amount: amountMinor,
            currency: currency.toLowerCase(),
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
        if (error instanceof CouponError) {
            const apiError = new ApiError(400, error.message);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }
        console.error("Stripe intent creation failed:", error);
        const apiError = new ApiError(500, "Could not initiate card payment. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
