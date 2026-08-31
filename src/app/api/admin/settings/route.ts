import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import {
    settingsSchema,
    DEFAULT_SETTINGS,
    SettingsValues,
    THAI_VAT_RATE,
    SECRET_SETTINGS_KEYS,
    SECRET_MASK,
} from "@/schemas/settings.schema";

/** Replaces stored secrets with a mask so they never reach the browser. */
function maskSecrets(settings: SettingsValues): SettingsValues {
    const masked = { ...settings };
    for (const key of SECRET_SETTINGS_KEYS) {
        if (masked[key]) masked[key] = SECRET_MASK;
    }
    return masked;
}

export async function GET() {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const row = await prisma.storeSettings.findUnique({ where: { id: 1 } });
        const stored = row ? settingsSchema.safeParse(row.data) : null;
        /* VAT is not admin-editable — always report the fixed value. */
        const settings = {
            ...(stored?.success ? stored.data : DEFAULT_SETTINGS),
            gst_rate: THAI_VAT_RATE,
        };

        const apiResponse = new ApiResponse(
            200,
            maskSecrets(settings),
            "Settings fetched successfully"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin settings fetch failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const body = await req.json();
        const parsed = settingsSchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        /* Ignore whatever the client sent for VAT — it is fixed. */
        const data: SettingsValues = {
            ...parsed.data,
            gst_rate: THAI_VAT_RATE,
        };

        const existingRow = await prisma.storeSettings.findUnique({ where: { id: 1 } });
        const existing = existingRow ? settingsSchema.safeParse(existingRow.data) : null;

        /* The base (entry) currency locks permanently once chosen — product
           prices are stored in it, so changing it would silently reprice the
           whole catalog. */
        if (existing?.success && existing.data.currency) {
            data.currency = existing.data.currency;
        }

        /* The form receives masked secrets; a returned mask means "unchanged",
           so keep the stored value rather than overwriting it with the mask. */
        for (const key of SECRET_SETTINGS_KEYS) {
            if (data[key] === SECRET_MASK) {
                data[key] = existing?.success ? existing.data[key] : "";
            }
        }

        await prisma.storeSettings.upsert({
            where: { id: 1 },
            update: { data },
            create: { id: 1, data },
        });

        const apiResponse = new ApiResponse(
            200,
            maskSecrets(data),
            "Settings saved successfully"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin settings save failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
