import { prisma } from "@/lib/prismaClient";
import {
    settingsSchema,
    DEFAULT_SETTINGS,
    SettingsValues,
    THAI_VAT_RATE,
    SECRET_SETTINGS_KEYS,
    SECRET_MASK,
} from "@/schemas/settings.schema";
import {
    CurrencyCode,
    DEFAULT_CURRENCY,
    DEFAULT_DISPLAY_CURRENCY,
    isCurrencyCode,
} from "@/lib/currency";

/** Reads the single StoreSettings row, falling back to defaults if unset/invalid. */
export async function getStoreSettings(): Promise<SettingsValues> {
    try {
        const row = await prisma.storeSettings.findUnique({ where: { id: 1 } });
        const parsed = row ? settingsSchema.safeParse(row.data) : null;
        /* VAT is fixed, never taken from storage. */
        return {
            ...(parsed?.success ? parsed.data : DEFAULT_SETTINGS),
            gst_rate: THAI_VAT_RATE,
        };
    } catch (error) {
        console.error("Store settings read failed, using defaults:", error);
        return DEFAULT_SETTINGS;
    }
}

/** Base (entry) currency — the one product prices are stored in. */
export function baseCurrencyOf(settings: SettingsValues): CurrencyCode {
    return isCurrencyCode(settings.currency) ? settings.currency : DEFAULT_CURRENCY;
}

/**
 * What a given visitor should see (and be charged in):
 * India → INR, Thailand → THB; everyone else gets the admin's display
 * currency, or USD when none is saved.
 */
export function resolveDisplayCurrency(
    settings: SettingsValues,
    country: string | null
): CurrencyCode {
    if (country === "IN") return "INR";
    if (country === "TH") return "THB";
    return isCurrencyCode(settings.display_currency)
        ? settings.display_currency
        : DEFAULT_DISPLAY_CURRENCY;
}

/** Replaces stored secrets with a mask so they never leave the server —
 *  the admin form sends the mask back to mean "keep the saved value". */
export function maskSecrets(settings: SettingsValues): SettingsValues {
    const masked = { ...settings };
    for (const key of SECRET_SETTINGS_KEYS) {
        if (masked[key]) masked[key] = SECRET_MASK;
    }
    return masked;
}

/** The ONE settings shape served to both portals: every admin-editable field
 *  (secrets masked) plus derived read-only fields. The admin form binds the
 *  raw fields; the storefront reads the derived ones — raw razorpay_enabled
 *  is the admin's toggle, razorpay_ready is toggle AND credentials present. */
export function toSettingsResponse(settings: SettingsValues) {
    const gateways = resolveGatewayCredentials(settings);
    return {
        ...maskSecrets(settings),
        /* Derived, read-only — recomputed on save, ignored by PUT. */
        base_currency: baseCurrencyOf(settings),
        razorpay_ready: gateways.razorpay.enabled,
        stripe_ready: gateways.stripe.enabled,
        /* Resolved publishable key (saved value or .env fallback) — public by
           design; the browser needs it to mount the Stripe card form. */
        stripe_pk: gateways.stripe.publishableKey,
    };
}

/** Shape served by GET /api/settings — the unified settings plus the
 *  visitor-resolved currency and the base → display exchange rate. */
export type SettingsResponse = ReturnType<typeof toSettingsResponse> & {
    country: string | null;
    visitor_currency: CurrencyCode;
    display_rate: number;
};

/* ------------------------------------------------------------------ */
/* Gateway credentials                                                 */
/* ------------------------------------------------------------------ */

const trimmed = (value: string | undefined) => (value ?? "").trim();

/**
 * Admin-entered keys win; a blank field falls back to the matching .env value,
 * so an existing deployment keeps working before anything is saved.
 * A gateway counts as configured only when it has a full credential pair.
 */
export function resolveGatewayCredentials(settings: SettingsValues) {
    const razorpayKeyId =
        trimmed(settings.razorpay_key_id) || trimmed(process.env.RAZORPAY_KEY_ID);
    const razorpayKeySecret =
        trimmed(settings.razorpay_key_secret) ||
        trimmed(process.env.RAZORPAY_KEY_SECRET);
    const stripePublishableKey =
        trimmed(settings.stripe_publishable_key) ||
        trimmed(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    const stripeSecretKey =
        trimmed(settings.stripe_secret_key) || trimmed(process.env.STRIPE_SECRET_KEY);

    return {
        razorpay: {
            keyId: razorpayKeyId,
            keySecret: razorpayKeySecret,
            configured: Boolean(razorpayKeyId && razorpayKeySecret),
            enabled:
                settings.razorpay_enabled && Boolean(razorpayKeyId && razorpayKeySecret),
        },
        stripe: {
            publishableKey: stripePublishableKey,
            secretKey: stripeSecretKey,
            configured: Boolean(stripePublishableKey && stripeSecretKey),
            enabled:
                settings.stripe_enabled &&
                Boolean(stripePublishableKey && stripeSecretKey),
        },
    };
}
