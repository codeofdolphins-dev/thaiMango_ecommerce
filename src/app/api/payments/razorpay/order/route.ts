import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { computeOrderAmount } from "@/helper/orderAmount";
import { checkoutPayloadSchema } from "@/schemas/payment.schema";

export async function POST(req: Request) {
    try {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
            const apiError = new ApiError(503, "Razorpay is not configured.");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const parsed = checkoutPayloadSchema.safeParse(await req.json());
        if (!parsed.success) {
            const apiError = new ApiError(400, "Invalid checkout payload.", parsed.error.issues);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { amountPaise } = computeOrderAmount(parsed.data);
        if (amountPaise < 100) {
            const apiError = new ApiError(400, "Order total is too low to process.");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const order = await razorpay.orders.create({
            amount: amountPaise,
            currency: "INR",
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
        console.error("Razorpay order creation failed:", error);
        const apiError = new ApiError(500, "Could not initiate payment. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
