import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import { categorySchema } from "@/schemas/category.schema";

export async function GET() {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const categories = await prisma.categories.findMany({
            orderBy: { name_en: "asc" },
            include: { _count: { select: { products: true } } },
        });

        const apiResponse = new ApiResponse(200, categories, "Categories fetched successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin categories fetch failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

export async function POST(req: Request) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const body = await req.json();
        const parsed = categorySchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const existing = await prisma.categories.findUnique({ where: { slug: parsed.data.slug } });
        if (existing) {
            const apiError = new ApiError(409, "A category with this slug already exists");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const category = await prisma.categories.create({
            data: {
                slug: parsed.data.slug,
                name_en: parsed.data.name_en,
                name_th: parsed.data.name_th,
                cat_id: parsed.data.cat_id ?? null,
            },
        });

        const apiResponse = new ApiResponse(201, category, "Category created successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin category create failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
