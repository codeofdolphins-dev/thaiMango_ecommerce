import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { ApiResponse, ApiError } from "@/helper/apiResponse";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const categorySlug = searchParams.get("category") ?? undefined;
        const search = searchParams.get("search")?.trim() || undefined;
        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const limit = Math.min(MAX_LIMIT, Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT));

        const where: Prisma.ProductWhereInput = {
            status: "ACTIVE",
            ...(categorySlug ? { category: { slug: categorySlug } } : {}),
            ...(search
                ? {
                    OR: [
                        { name_en: { contains: search, mode: "insensitive" } },
                        { name_th: { contains: search, mode: "insensitive" } },
                        { tags: { has: search } },
                    ],
                }
                : {}),
        };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { created_at: "desc" },
                include: {
                    category: { select: { slug: true, name_en: true, name_th: true } },
                    productVariant: true,
                },
            }),
            prisma.product.count({ where }),
        ]);

        const apiResponse = new ApiResponse(
            200,
            {
                products,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            },
            "Products fetched successfully"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Fetching products failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
