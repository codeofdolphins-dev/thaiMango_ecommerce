import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signUpSchema } from "@/schemas/signup.schema";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { signSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/jwt";
import { hashPassword } from "@/helper/hashPassword";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT) || 10;


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = signUpSchema.safeParse(body);

        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { f_name, l_name, email, ph_no, password, choice } = parsed.data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            const apiError = new ApiError(409, "An account with this email already exists");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const password_hash = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name: `${f_name.trim()} ${l_name.trim()}`,
                email,
                phone: ph_no,
                password_hash,
                flavor_preference: choice ? [choice] : []
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                created_at: true,
            },
        });

        const token = signSessionToken({ sub: user.id, role: user.role });

        const response = NextResponse.json(
            new ApiResponse(201, user, "Account created successfully"),
            { status: 201 }
        );
        response.cookies.set(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: SESSION_MAX_AGE_SECONDS,
        });
        return response;
    } catch (error) {
        console.error("Sign-up failed:", error);
        return NextResponse.json(
            new ApiError(500, "Something went wrong. Please try again."),
            { status: 500 }
        );
    }
}
