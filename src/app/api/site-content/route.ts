import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";

export async function GET() {
    try {
        const blocks = await prisma.siteContent.findMany({
            select: { id: true, content: true },
        });

        const apiResponse = new ApiResponse(200, blocks, "Site content fetched successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Fetching site content failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
