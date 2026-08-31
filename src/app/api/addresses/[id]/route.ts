import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/jwt";

type Params = { params: Promise<{ id: string }> };

async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return token ? verifySessionToken(token) : null;
}

export async function PATCH(_req: Request, { params }: Params) {
    try {
        const session = await getSession();
        if (!session) {
            const apiError = new ApiError(401, "Not authenticated");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const addressId = Number(id);
        if (!Number.isInteger(addressId)) {
            const apiError = new ApiError(400, "Invalid address id");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const address = await prisma.addresses.findFirst({
            where: { id: addressId, user_id: session.sub },
        });
        if (!address) {
            const apiError = new ApiError(404, "Address not found");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        /* only supported update: make this address the default */
        await prisma.addresses.updateMany({
            where: { user_id: session.sub },
            data: { is_default: false },
        });
        const updated = await prisma.addresses.update({
            where: { id: addressId },
            data: { is_default: true },
        });

        const apiResponse = new ApiResponse(200, updated, "Default address updated");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Updating address failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    try {
        const session = await getSession();
        if (!session) {
            const apiError = new ApiError(401, "Not authenticated");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const addressId = Number(id);
        if (!Number.isInteger(addressId)) {
            const apiError = new ApiError(400, "Invalid address id");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const address = await prisma.addresses.findFirst({
            where: { id: addressId, user_id: session.sub },
        });
        if (!address) {
            const apiError = new ApiError(404, "Address not found");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        await prisma.addresses.delete({ where: { id: addressId } });

        const apiResponse = new ApiResponse(200, null, "Address deleted successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Deleting address failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
