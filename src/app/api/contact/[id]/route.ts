import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import { inquiryPatchSchema } from "@/schemas/contact.schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const inquiryId = Number(id);
        if (!Number.isInteger(inquiryId)) {
            const apiError = new ApiError(400, "Invalid inquiry id");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const body = await req.json();
        const parsed = inquiryPatchSchema.safeParse(body);
        if (!parsed.success) {
            const apiError = new ApiError(400, "Invalid inquiry status");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const inquiry = await prisma.contactInquiry.update({
            where: { id: inquiryId },
            data: { status: parsed.data.status },
        });

        const apiResponse = new ApiResponse(200, inquiry, "Inquiry updated successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Inquiry update failed:", error);
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
        const inquiryId = Number(id);
        if (!Number.isInteger(inquiryId)) {
            const apiError = new ApiError(400, "Invalid inquiry id");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        await prisma.contactInquiry.delete({ where: { id: inquiryId } });

        const apiResponse = new ApiResponse(200, null, "Inquiry deleted successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Inquiry delete failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
