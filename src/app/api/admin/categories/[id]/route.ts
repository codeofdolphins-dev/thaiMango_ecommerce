import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import { categorySchema } from "@/schemas/category.schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const categoryId = Number(id);
        if (!Number.isInteger(categoryId)) {
            const apiError = new ApiError(400, "Invalid category id");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const body = await req.json();
        const parsed = categorySchema.partial().safeParse(body);
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const category = await prisma.categories.update({
            where: { id: categoryId },
            data: parsed.data,
        });

        const apiResponse = new ApiResponse(200, category, "Category updated successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin category update failed:", error);
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
        const categoryId = Number(id);
        if (!Number.isInteger(categoryId)) {
            const apiError = new ApiError(400, "Invalid category id");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const productCount = await prisma.product.count({ where: { category_id: categoryId } });
        if (productCount > 0) {
            const apiError = new ApiError(
                409,
                `Cannot delete: ${productCount} product${productCount === 1 ? "" : "s"} still use this category`
            );
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        await prisma.categories.delete({ where: { id: categoryId } });

        const apiResponse = new ApiResponse(200, null, "Category deleted successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin category delete failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
