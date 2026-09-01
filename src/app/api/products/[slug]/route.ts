import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";

const RELATED_LIMIT = 8;

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

        /* Candidates share the category, a tag, or a highlight — never the product itself. */
        const relatedCandidates = await prisma.product.findMany({
            where: {
                status: "ACTIVE",
                id: { not: product.id },
                OR: [
                    { category_id: product.category_id },
                    { tags: { hasSome: product.tags } },
                    { highlights: { hasSome: product.highlights } },
                ],
            },
            include: {
                category: { select: { slug: true, name_en: true, name_th: true } },
                productVariant: { orderBy: { position: "asc" } },
            },
            take: RELATED_LIMIT * 3,
        });

        /* Rank: same category first, then by how many tags/highlights overlap. */
        const overlap = (a: string[], b: string[]) => a.filter((v) => b.includes(v)).length;
        const relatedProducts = relatedCandidates
            .map((candidate) => ({
                candidate,
                score:
                    (candidate.category_id === product.category_id ? 100 : 0) +
                    overlap(candidate.tags, product.tags) * 2 +
                    overlap(candidate.highlights, product.highlights),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, RELATED_LIMIT)
            .map((entry) => entry.candidate);

        const ratingCount = product.reviews.length;
        const ratingAverage =
            ratingCount === 0
                ? null
                : product.reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount;

        const apiResponse = new ApiResponse(
            200,
            { ...product, ratingAverage, ratingCount, relatedProducts },
            "Product fetched successfully"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Fetching product failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
