import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/jwt";

const USER_SELECT = {
    id: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    flavor_preference: true,
    created_at: true,
} as const;

async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
}

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            const apiError = new ApiError(401, "Not authenticated");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.sub },
            select: USER_SELECT,
        });

        if (!user) {
            const apiError = new ApiError(401, "Not authenticated");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const apiResponse = new ApiResponse(200, user, "Session valid");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Fetching session failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

const profileSchema = z.object({
    f_name: z.string().trim().min(1, "First name is required"),
    l_name: z.string().trim().min(1, "Last name is required"),
    email: z.email("Enter a valid email address"),
    ph_no: z.string().trim().min(7, "Enter a valid phone number"),
});

export async function PATCH(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            const apiError = new ApiError(401, "Not authenticated");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const body = await req.json();
        const parsed = profileSchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { f_name, l_name, email, ph_no } = parsed.data;

        const emailTaken = await prisma.user.findFirst({
            where: { email, id: { not: session.sub } },
        });
        if (emailTaken) {
            const apiError = new ApiError(409, "An account with this email already exists");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const user = await prisma.user.update({
            where: { id: session.sub },
            data: {
                name: `${f_name} ${l_name}`.trim(),
                email,
                phone: ph_no,
            },
            select: USER_SELECT,
        });

        const apiResponse = new ApiResponse(200, user, "Profile updated successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Profile update failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
