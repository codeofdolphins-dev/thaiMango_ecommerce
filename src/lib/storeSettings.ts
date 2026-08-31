import { prisma } from "@/lib/prismaClient";
import {
    settingsSchema,
    DEFAULT_SETTINGS,
    SettingsValues,
    THAI_VAT_RATE,
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

/** The subset that is safe to expose to the storefront (no admin-only fields).
 *  Gateway secrets never appear here — only the publishable Stripe key, which
 *  is public by design and needed by the browser to mount the card form. */
export function toPublicSettings(settings: SettingsValues) {
    const gateways = resolveGatewayCredentials(settings);
    return {
        store_name: settings.store_name,
        support_email: settings.support_email,
        support_phone: settings.support_phone,
        store_address: settings.store_address,
        show_announcement: settings.show_announcement,
        /* Base (entry) currency — admin money formatting uses it. */
        base_currency: baseCurrencyOf(settings),
        free_shipping_above: settings.free_shipping_above,
        standard_shipping: settings.standard_shipping,
        priority_shipping: settings.priority_shipping,
        gst_rate: settings.gst_rate,
        cod_enabled: settings.cod_enabled,
        upi_enabled: settings.upi_enabled,
        intl_shipping: settings.intl_shipping,
        razorpay_enabled: gateways.razorpay.enabled,
        stripe_enabled: gateways.stripe.enabled,
        stripe_publishable_key: gateways.stripe.publishableKey,
    };
}

/** Shape served by GET /api/settings — public fields plus the visitor-resolved
 *  display currency and the base → display exchange rate. */
export type PublicSettings = ReturnType<typeof toPublicSettings> & {
    country: string | null;
    display_currency: CurrencyCode;
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
