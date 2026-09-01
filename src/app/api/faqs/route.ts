import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import { faqSchema } from "@/schemas/faq.schema";

/* FAQs: admin fills them, the public /faq page displays them — one resource,
   one shape. GET is open; visitors receive only active rows, an admin session
   receives every row (the admin page needs hidden ones too). */

export async function GET() {
    try {
        const isAdmin = Boolean(await requireAdmin().catch(() => null));
        const faqs = await prisma.faq.findMany({
            where: isAdmin ? {} : { is_active: true },
            orderBy: [{ category: "asc" }, { position: "asc" }, { id: "asc" }],
        });

        const apiResponse = new ApiResponse(200, faqs, "FAQs fetched successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("FAQs fetch failed:", error);
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
        const parsed = faqSchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const faq = await prisma.faq.create({ data: parsed.data });

        const apiResponse = new ApiResponse(201, faq, "FAQ created successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("FAQ create failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
