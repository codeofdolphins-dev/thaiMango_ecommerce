import crypto from "crypto";
import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { forgetPasswordSchema } from "@/schemas/password.schema";
import { sendPasswordResetEmail } from "@/helper/mailer";

const TOKEN_TTL_MS = 30 * 60 * 1000;

/* Customer-only forgot-password. Always answers with the same message whether
   or not the email exists, so the endpoint can't be used to probe accounts. */
export async function POST(req: Request) {
    try {
        const parsed = forgetPasswordSchema.safeParse(await req.json());
        if (!parsed.success) {
            const apiError = new ApiError(400, "Enter a valid email address");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }
        const email = parsed.data.email;

        const user = await prisma.user.findUnique({ where: { email } });

        /* Admin accounts deliberately never get a reset link — admins recover
           access out-of-band. Response stays generic either way. */
        if (user && user.role === "CUSTOMER") {
            const token = crypto.randomBytes(32).toString("hex");
            const token_hash = crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

            /* One live link per account — a new request voids older ones. */
            await prisma.$transaction([
                prisma.passwordResetToken.deleteMany({ where: { user_id: user.id } }),
                prisma.passwordResetToken.create({
                    data: {
                        user_id: user.id,
                        token_hash,
                        expires_at: new Date(Date.now() + TOKEN_TTL_MS),
                    },
                }),
            ]);

            const origin =
                req.headers.get("origin") ?? new URL(req.url).origin;
            const link = `${origin}/reset-password?token=${token}`;

            try {
                await sendPasswordResetEmail(email, link);
            } catch (error) {
                /* A mail outage must not reveal whether the account exists. */
                console.error("Password reset email failed:", error);
            }
        }

        const apiResponse = new ApiResponse(
            200,
            {},
            "If an account exists for that email, a reset link has been sent."
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Forgot password failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
