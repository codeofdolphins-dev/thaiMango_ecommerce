import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/jwt";
import { placeOrderSchema } from "@/schemas/payment.schema";
import { computeOrderAmount, UnpricedLineError } from "@/helper/orderAmount";
import { CouponError } from "@/helper/coupon";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        const session = token ? verifySessionToken(token) : null;
        if (!session) {
            const apiError = new ApiError(401, "Not authenticated");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const orders = await prisma.order.findMany({
            where: { user_id: session.sub },
            orderBy: { created_at: "desc" },
            include: {
                items: {
                    include: {
                        product: { select: { slug: true, images: true } },
                    },
                },
            },
        });

        const apiResponse = new ApiResponse(200, orders, "Orders fetched successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Fetching orders failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        const session = token ? verifySessionToken(token) : null;
        if (!session) {
            const apiError = new ApiError(401, "Sign in to place an order.");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const parsed = placeOrderSchema.safeParse(await req.json());
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { shipping, payment, paymentRef } = parsed.data;

        /* Totals AND line prices come from the catalog via the same helper the
           payment routes use, so nothing a client posts can set what is owed. */
        let total: number;
        let currency: string;
        let chargeTotal: number;
        let coupon: Awaited<ReturnType<typeof computeOrderAmount>>["coupon"];
        let items: Awaited<ReturnType<typeof computeOrderAmount>>["pricedItems"];
        try {
            const computed = await computeOrderAmount(parsed.data, req.headers);
            ({ total, currency, chargeTotal, coupon } = computed);
            items = computed.pricedItems;
        } catch (error) {
            if (error instanceof UnpricedLineError) {
                const apiError = new ApiError(409, error.message);
                return NextResponse.json(apiError, { status: apiError.statusCode });
            }
            if (error instanceof CouponError) {
                const apiError = new ApiError(400, error.message);
                return NextResponse.json(apiError, { status: apiError.statusCode });
            }
            throw error;
        }

        /* Resolve slugs to product ids in one query so each line can point at
           a real product; a line whose product has since gone keeps its name. */
        const slugs = [...new Set(items.map((i) => i.slug).filter(Boolean))] as string[];
        const products = slugs.length
            ? await prisma.product.findMany({
                where: { slug: { in: slugs } },
                select: { id: true, slug: true },
            })
            : [];
        const idBySlug = new Map(products.map((p) => [p.slug, p.id]));

        const order = await prisma.order.create({
            data: {
                user_id: session.sub,
                payment,
                payment_ref: paymentRef,
                total,
                charge_currency: currency,
                charge_total: chargeTotal,
                ship_name: shipping.name,
                ship_phone: shipping.phone,
                ship_line1: shipping.line1,
                ship_city: shipping.city,
                ship_state: shipping.state,
                ship_pincode: shipping.pincode,
                ship_country: shipping.country,
                items: {
                    create: items.map((item) => ({
                        product_id: item.slug ? idBySlug.get(item.slug) ?? null : null,
                        name: item.name,
                        /* The variant actually priced, not the label posted. */
                        variant_label: item.label,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                },
            },
            include: {
                items: {
                    include: { product: { select: { slug: true, images: true } } },
                },
            },
        });

        /* Count the redemption only once an order actually exists. */
        if (coupon) {
            await prisma.coupon.update({
                where: { id: coupon.id },
                data: { used: { increment: 1 } },
            });
        }

        const apiResponse = new ApiResponse(201, order, "Order placed successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Creating order failed:", error);
        const apiError = new ApiError(500, "Could not place the order. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
