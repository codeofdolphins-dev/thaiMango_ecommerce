import { prisma } from "@/lib/prismaClient";
import { loginSchema } from "@/schemas/login.schema";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { signSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/jwt";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            const apiError = new ApiError(404, "User not found");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
            const apiError = new ApiError(401, "Invalid email or password");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { password_hash, ...safeUser } = user;

        const token = signSessionToken({ sub: user.id, role: user.role });

        const apiResponse = new ApiResponse(200, safeUser, "Login successful");
        const response = NextResponse.json(apiResponse, { status: apiResponse.statusCode });
        response.cookies.set(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: SESSION_MAX_AGE_SECONDS,
        });
        return response;
    } catch (error) {
        console.error("Log-in failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
