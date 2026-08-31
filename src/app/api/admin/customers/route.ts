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

        const customers = await prisma.user.findMany({
            where: { role: "CUSTOMER" },
            orderBy: { created_at: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                flavor_preference: true,
                created_at: true,
            },
        });

        const apiResponse = new ApiResponse(200, customers, "Customers fetched successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin customers fetch failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
