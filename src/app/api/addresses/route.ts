import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/jwt";
import { addressSchema } from "@/schemas/address.schema";

async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return token ? verifySessionToken(token) : null;
}

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            const apiError = new ApiError(401, "Not authenticated");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const addresses = await prisma.addresses.findMany({
            where: { user_id: session.sub },
            orderBy: [{ is_default: "desc" }, { id: "asc" }],
        });

        const apiResponse = new ApiResponse(200, addresses, "Addresses fetched successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Fetching addresses failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            const apiError = new ApiError(401, "Not authenticated");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const body = await req.json();
        const parsed = addressSchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const existingCount = await prisma.addresses.count({
            where: { user_id: session.sub },
        });
        const makeDefault = parsed.data.is_default || existingCount === 0;

        if (makeDefault) {
            await prisma.addresses.updateMany({
                where: { user_id: session.sub },
                data: { is_default: false },
            });
        }

        const address = await prisma.addresses.create({
            data: {
                ...parsed.data,
                is_default: makeDefault,
                user_id: session.sub,
            },
        });

        const apiResponse = new ApiResponse(201, address, "Address saved successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Creating address failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
