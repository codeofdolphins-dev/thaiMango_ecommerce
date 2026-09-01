import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import {
    settingsSchema,
    SettingsValues,
    THAI_VAT_RATE,
    SECRET_SETTINGS_KEYS,
    SECRET_MASK,
} from "@/schemas/settings.schema";
import {
    baseCurrencyOf,
    getStoreSettings,
    resolveDisplayCurrency,
    toSettingsResponse,
} from "@/lib/storeSettings";
import { getExchangeRate } from "@/lib/exchangeRates";
import { resolveCountry } from "@/lib/geo";

/* The ONE store-settings API. The admin portal fills it (PUT, admin session
   required), every portal reads it (GET, no auth) — same shape for both.
   Gateway secrets never leave the server: they are masked in GET and a
   returned mask on PUT means "keep the saved value". */

export async function GET(req: Request) {
    const settings = await getStoreSettings();
    const country = resolveCountry(req.headers);
    const baseCurrency = baseCurrencyOf(settings);
    const visitorCurrency = resolveDisplayCurrency(settings, country);
    const displayRate = await getExchangeRate(baseCurrency, visitorCurrency);

    const apiResponse = new ApiResponse(
        200,
        {
            ...toSettingsResponse(settings),
            /* Visitor-resolved (IN → INR, TH → THB, else the saved display
               currency or USD) and the base → display rate prices are
               multiplied by on the storefront. */
            country,
            visitor_currency: visitorCurrency,
            display_rate: displayRate,
        },
        "Settings fetched successfully"
    );
    return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
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
            toSettingsResponse(data),
            "Settings saved successfully"
        );
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Settings save failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
