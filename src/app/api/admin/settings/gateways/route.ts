import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import {
    settingsSchema,
    DEFAULT_SETTINGS,
    SettingsValues,
    gatewaySaveSchema,
    SECRET_MASK,
} from "@/schemas/settings.schema";

/**
 * Saves ONE gateway's toggle + keys without touching any other setting, so the
 * dedicated "Save Keys" button can't clobber unrelated unsaved form edits.
 * A blank or still-masked secret means "keep the stored one".
 */
export async function PATCH(req: Request) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const parsed = gatewaySaveSchema.safeParse(await req.json());
        if (!parsed.success) {
            const apiError = new ApiError(400, "Invalid gateway payload.", parsed.error.issues);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const row = await prisma.storeSettings.findUnique({ where: { id: 1 } });
        const stored = row ? settingsSchema.safeParse(row.data) : null;
        const data: SettingsValues = stored?.success
            ? { ...stored.data }
            : { ...DEFAULT_SETTINGS };

        const keepSecret = (typed: string | undefined, current: string) =>
            typed && typed !== SECRET_MASK ? typed : current;

        const p = parsed.data;
        if (p.gateway === "razorpay") {
            data.razorpay_enabled = p.enabled;
            data.razorpay_key_id = p.key_id ?? data.razorpay_key_id;
            data.razorpay_key_secret = keepSecret(p.key_secret, data.razorpay_key_secret);
        } else {
            data.stripe_enabled = p.enabled;
            data.stripe_publishable_key =
                p.publishable_key ?? data.stripe_publishable_key;
            data.stripe_secret_key = keepSecret(p.secret_key, data.stripe_secret_key);
        }

        await prisma.storeSettings.upsert({
            where: { id: 1 },
            update: { data },
            create: { id: 1, data },
        });

        const apiResponse = new ApiResponse(
            200,
            { gateway: p.gateway, enabled: p.enabled },
            `${p.gateway === "razorpay" ? "Razorpay" : "Stripe"} keys saved`
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Gateway keys save failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
