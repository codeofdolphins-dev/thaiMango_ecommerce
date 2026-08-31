import crypto from "crypto";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { razorpayVerifySchema } from "@/schemas/payment.schema";

export async function POST(req: Request) {
    try {
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            const apiError = new ApiError(503, "Razorpay is not configured.");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const parsed = razorpayVerifySchema.safeParse(await req.json());
        if (!parsed.success) {
            const apiError = new ApiError(400, "Invalid verification payload.", parsed.error.issues);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
        const expected = crypto
            .createHmac("sha256", keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const expectedBuf = Buffer.from(expected, "hex");
        const givenBuf = Buffer.from(razorpay_signature, "hex");
        const valid =
            expectedBuf.length === givenBuf.length &&
            crypto.timingSafeEqual(expectedBuf, givenBuf);

        if (!valid) {
            const apiError = new ApiError(400, "Payment signature verification failed.");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        // TODO: persist the order here (or hand off to the orders API) once the
        // public order-creation flow lands.
        const apiResponse = new ApiResponse(
            200,
            { verified: true, paymentId: razorpay_payment_id },
            "Payment verified"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Razorpay verification failed:", error);
        const apiError = new ApiError(500, "Could not verify payment.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
