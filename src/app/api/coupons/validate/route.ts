import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { validateCoupon, CouponError } from "@/helper/coupon";

const validateSchema = z.object({
    code: z.string().trim().min(1, "Enter a promo code"),
});

/** Public storefront check — tells the cart whether a code is worth applying.
 *  The order routes re-validate on their own, so this grants nothing. */
export async function POST(req: Request) {
    try {
        const parsed = validateSchema.safeParse(await req.json());
        if (!parsed.success) {
            const apiError = new ApiError(400, "Enter a promo code");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const coupon = await validateCoupon(parsed.data.code);

        const apiResponse = new ApiResponse(
            200,
            {
                code: coupon.code,
                discount_pct: coupon.discount_pct,
                description: coupon.description,
            },
            "Coupon is valid"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        if (error instanceof CouponError) {
            const apiError = new ApiError(400, error.message);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }
        console.error("Coupon validation failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
