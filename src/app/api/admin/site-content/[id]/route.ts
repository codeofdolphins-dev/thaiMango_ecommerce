import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";

const contentPatchSchema = z.object({
    content: z.string().trim().min(1, "Content cannot be empty"),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const body = await req.json();
        const parsed = contentPatchSchema.safeParse(body);
        if (!parsed.success) {
            const apiError = new ApiError(400, "Content cannot be empty");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const block = await prisma.siteContent.update({
            where: { id },
            data: { content: parsed.data.content },
        });

        const apiResponse = new ApiResponse(200, block, "Content updated successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin site content update failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
