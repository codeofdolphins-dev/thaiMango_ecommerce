import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";

export async function GET() {
    try {
        const categories = await prisma.categories.findMany({
            orderBy: { name_en: "asc" },
            select: {
                id: true,
                slug: true,
                name_en: true,
                name_th: true,
                cat_id: true,
            },
        });

        const apiResponse = new ApiResponse(200, categories, "Categories fetched successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Fetching categories failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
