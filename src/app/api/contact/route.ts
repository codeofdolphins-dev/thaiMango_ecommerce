import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import { contactInquirySchema } from "@/schemas/contact.schema";

/* Contact inquiries: the public form POSTs here, the admin portal reads the
   same resource — GET is admin-only since inquiries hold visitor PII. */

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = contactInquirySchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const inquiry = await prisma.contactInquiry.create({ data: parsed.data });

        const apiResponse = new ApiResponse(
            201,
            { id: inquiry.id },
            "Inquiry received successfully"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Contact inquiry create failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

export async function GET() {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const inquiries = await prisma.contactInquiry.findMany({
            orderBy: { created_at: "desc" },
        });

        const apiResponse = new ApiResponse(
            200,
            inquiries,
            "Inquiries fetched successfully"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Inquiries fetch failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
