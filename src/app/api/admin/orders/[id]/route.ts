import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";

const orderPatchSchema = z.object({
    status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
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
        const parsed = orderPatchSchema.safeParse(body);
        if (!parsed.success) {
            const apiError = new ApiError(400, "Invalid order status");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status: parsed.data.status },
            include: {
                user: { select: { name: true, email: true } },
                _count: { select: { items: true } },
            },
        });

        const apiResponse = new ApiResponse(200, order, "Order updated successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin order update failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
