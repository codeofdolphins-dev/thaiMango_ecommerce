import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;

        const product = await prisma.product.findUnique({
            where: { slug, status: "ACTIVE" },
            include: {
                category: { select: { slug: true, name_en: true, name_th: true } },
                productVariant: { orderBy: { position: "asc" } },
                reviews: {
                    where: { status: "PUBLISHED" },
                    orderBy: { created_at: "desc" },
                    select: {
                        id: true,
                        rating: true,
                        text: true,
                        created_at: true,
                        user: { select: { name: true } },
                    },
                },
            },
        });

        if (!product) {
            const apiError = new ApiError(404, "Product not found");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const ratingCount = product.reviews.length;
        const ratingAverage =
            ratingCount === 0
                ? null
                : product.reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount;

        const apiResponse = new ApiResponse(
            200,
            { ...product, ratingAverage, ratingCount },
            "Product fetched successfully"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Fetching product failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
