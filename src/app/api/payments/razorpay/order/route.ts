import { NextResponse } from "next/server";
import Razorpay from "razorpay";
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
        const { razorpay: razorpayCreds } = resolveGatewayCredentials(settings);
        if (!razorpayCreds.enabled) {
            const apiError = new ApiError(
                503,
                razorpayCreds.configured
                    ? "Razorpay is turned off."
                    : "Razorpay is not configured."
            );
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }
        const { keyId, keySecret } = razorpayCreds;

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

        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const order = await razorpay.orders.create({
            amount: amountMinor,
            currency,
            receipt: `tm_${Date.now()}`,
            notes: {
                customer_email: parsed.data.customer?.email ?? "",
                customer_name: parsed.data.customer?.name ?? "",
            },
        });

        const apiResponse = new ApiResponse(
            200,
            { orderId: order.id, amount: order.amount, currency: order.currency, keyId },
            "Razorpay order created"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        if (error instanceof CouponError) {
            const apiError = new ApiError(400, error.message);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }
        console.error("Razorpay order creation failed:", error);
        const apiError = new ApiError(500, "Could not initiate payment. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
