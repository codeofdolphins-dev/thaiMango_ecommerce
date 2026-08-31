import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

const reviewPatchSchema = z.object({
    status: z.enum(["PENDING", "PUBLISHED"]),
});

export async function PATCH(req: Request, { params }: Params) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const reviewId = Number(id);
        if (!Number.isInteger(reviewId)) {
            const apiError = new ApiError(400, "Invalid review id");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const body = await req.json();
        const parsed = reviewPatchSchema.safeParse(body);
        if (!parsed.success) {
            const apiError = new ApiError(400, "Invalid review status");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const review = await prisma.review.update({
            where: { id: reviewId },
            data: { status: parsed.data.status },
            include: {
                product: { select: { name_en: true, slug: true } },
                user: { select: { name: true } },
            },
        });

        const apiResponse = new ApiResponse(200, review, "Review updated successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin review update failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const reviewId = Number(id);
        if (!Number.isInteger(reviewId)) {
            const apiError = new ApiError(400, "Invalid review id");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        await prisma.review.delete({ where: { id: reviewId } });

        const apiResponse = new ApiResponse(200, null, "Review deleted successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin review delete failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
