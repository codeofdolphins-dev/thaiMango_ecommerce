import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const [
            products,
            activeProducts,
            categories,
            customers,
            outOfStock,
            lowStock,
            orders,
            revenueAgg,
            pendingReviews,
        ] = await Promise.all([
            prisma.product.count(),
            prisma.product.count({ where: { status: "ACTIVE" } }),
            prisma.categories.count(),
            prisma.user.count({ where: { role: "CUSTOMER" } }),
            prisma.productVariant.count({ where: { stock: 0 } }),
            prisma.productVariant.count({ where: { stock: { gt: 0, lt: 50 } } }),
            prisma.order.count(),
            prisma.order.aggregate({
                _sum: { total: true },
                where: { status: { not: "CANCELLED" } },
            }),
            prisma.review.count({ where: { status: "PENDING" } }),
        ]);

        const apiResponse = new ApiResponse(
            200,
            {
                products,
                activeProducts,
                categories,
                customers,
                outOfStock,
                lowStock,
                orders,
                revenue: Number(revenueAgg._sum.total ?? 0),
                pendingReviews,
            },
            "Stats fetched successfully"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin stats fetch failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
