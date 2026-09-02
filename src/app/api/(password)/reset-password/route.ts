import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/jwt";
import crypto from "crypto";
import {
    resetPasswordSchema,
    resetWithTokenSchema,
} from "@/schemas/password.schema";
import { hashPassword, verifyPassword } from "@/helper/hashPassword";


/* Forgot-password completion: exchanges an emailed token for a new password.
   No session required — the token IS the proof. Customers only. */
export async function POST(req: Request) {
    try {
        const parsed = resetWithTokenSchema.safeParse(await req.json());
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            return NextResponse.json(new ApiError(400, "Validation error", errors), {
                status: 400,
            });
        }

        const token_hash = crypto
            .createHash("sha256")
            .update(parsed.data.token)
            .digest("hex");

        const record = await prisma.passwordResetToken.findUnique({
            where: { token_hash },
            include: { user: true },
        });

        const invalid = new ApiError(
            400,
            "This reset link is invalid or has expired. Request a new one."
        );
        if (
            !record ||
            record.expires_at < new Date() ||
            record.user.role !== "CUSTOMER"
        ) {
            return NextResponse.json(invalid, { status: invalid.statusCode });
        }

        const password_hash = await hashPassword(parsed.data.new_password);
        /* The token is single-use: spend it (and any siblings) with the update. */
        await prisma.$transaction([
            prisma.user.update({
                where: { id: record.user_id },
                data: { password_hash },
            }),
            prisma.passwordResetToken.deleteMany({
                where: { user_id: record.user_id },
            }),
        ]);

        const apiResponse = new ApiResponse(
            200,
            {},
            "Password reset successfully. You can sign in now."
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Token password reset failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

export async function PATCH(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        const session = token ? verifySessionToken(token) : null;
        if (!session) {
            const apiError = new ApiError(401, "Not authenticated");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const body = await req.json();
        const parsed = resetPasswordSchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            return NextResponse.json(
                new ApiError(400, "Validation error", errors),
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: session.sub }
        });
        if (!user) return NextResponse.json(new ApiError(404, "User not found"), { status: 404 });

        const isOldPasswordMatched = await verifyPassword(user.password_hash, parsed.data.old_password)
        if (!isOldPasswordMatched) return NextResponse.json(new ApiError(404, "Old pasword is not matched"), { status: 404 });

        const hash_newPassword = await hashPassword(parsed.data.new_password);
        await prisma.user.update({
            where: { id: user.id },
            data: { password_hash: hash_newPassword }
        })

        const apiResponse = new ApiResponse(
            200,
            {},
            "Password updated successfully"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Settings save failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
