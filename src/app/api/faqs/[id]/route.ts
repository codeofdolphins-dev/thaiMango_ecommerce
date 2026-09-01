import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import { faqPatchSchema } from "@/schemas/faq.schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const faqId = Number(id);
        if (!Number.isInteger(faqId)) {
            const apiError = new ApiError(400, "Invalid FAQ id");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const body = await req.json();
        const parsed = faqPatchSchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const faq = await prisma.faq.update({
            where: { id: faqId },
            data: parsed.data,
        });

        const apiResponse = new ApiResponse(200, faq, "FAQ updated successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("FAQ update failed:", error);
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
        const faqId = Number(id);
        if (!Number.isInteger(faqId)) {
            const apiError = new ApiError(400, "Invalid FAQ id");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        await prisma.faq.delete({ where: { id: faqId } });

        const apiResponse = new ApiResponse(200, null, "FAQ deleted successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("FAQ delete failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
