import { z } from "zod";

/** Thailand's standard VAT rate — fixed by law, so the field is not editable. */
export const THAI_VAT_RATE = 7;

/** "" = not chosen yet. */
const currencyOrEmpty = z.enum(["", "INR", "USD", "THB"]);

export const settingsSchema = z.object({
    store_name: z.string().trim().min(1, "Store name is required"),
    support_email: z.email("Enter a valid email"),
    support_phone: z.string().trim().min(7, "Enter a valid phone number"),
    store_address: z.string().trim().min(1, "Address is required"),
    free_shipping_above: z.coerce.number<number | string>().nonnegative(),
    standard_shipping: z.coerce.number<number | string>().nonnegative(),
    priority_shipping: z.coerce.number<number | string>().nonnegative().default(199),
    /* Thai VAT — always THAI_VAT_RATE; kept in the schema so stored rows stay valid. */
    gst_rate: z.coerce.number<number | string>().min(0).max(100),
    /* Base (entry) currency — product prices are stored in it. Starts empty;
       the admin API locks it permanently after the first non-empty save. */
    currency: currencyOrEmpty.default(""),
    /* What shoppers outside IN/TH see (converted). May stay empty → USD. */
    display_currency: currencyOrEmpty.default(""),
    cod_enabled: z.boolean(),
    upi_enabled: z.boolean(),
    intl_shipping: z.boolean(),
    notif_new_order: z.boolean(),
    notif_low_stock: z.boolean(),
    notif_weekly: z.boolean(),
    maintenance_mode: z.boolean(),
    show_announcement: z.boolean(),
    /* ── Payment gateways ──
       Keys are managed here; blank falls back to the matching .env value.
       Secrets are never returned to the browser — see SECRET_SETTINGS_KEYS. */
    razorpay_enabled: z.boolean(),
    razorpay_key_id: z.string().trim().default(""),
    razorpay_key_secret: z.string().trim().default(""),
    stripe_enabled: z.boolean(),
    stripe_publishable_key: z.string().trim().default(""),
    stripe_secret_key: z.string().trim().default(""),
});

/** Never leaves the server: masked in admin GET, stripped from public GET. */
export const SECRET_SETTINGS_KEYS = [
    "razorpay_key_secret",
    "stripe_secret_key",
] as const;

/** Sent back by the admin API in place of a stored secret. */
export const SECRET_MASK = "__saved__";

/** Connection test — keys are optional so the saved/env ones can be tested. */
export const gatewayTestSchema = z.object({
    gateway: z.enum(["razorpay", "stripe"]),
    key_id: z.string().trim().optional(),
    key_secret: z.string().trim().optional(),
    publishable_key: z.string().trim().optional(),
    secret_key: z.string().trim().optional(),
});

export type GatewayTestValues = z.infer<typeof gatewayTestSchema>;

/** Per-gateway "Save Keys" — merges only these fields into stored settings. */
export const gatewaySaveSchema = gatewayTestSchema.extend({
    enabled: z.boolean(),
});

export type GatewaySaveValues = z.infer<typeof gatewaySaveSchema>;

export type SettingsValues = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: SettingsValues = {
    store_name: "Thai Mango",
    support_email: "care@thaimango.com",
    support_phone: "+91 98765 43210",
    store_address: "Bangkok Orchard House, MG Road, Bengaluru, KA 560001",
    free_shipping_above: 1500,
    standard_shipping: 99,
    priority_shipping: 199,
    gst_rate: THAI_VAT_RATE,
    currency: "",
    display_currency: "",
    cod_enabled: true,
    upi_enabled: true,
    intl_shipping: false,
    notif_new_order: true,
    notif_low_stock: true,
    notif_weekly: false,
    maintenance_mode: false,
    show_announcement: true,
    razorpay_enabled: true,
    razorpay_key_id: "",
    razorpay_key_secret: "",
    stripe_enabled: true,
    stripe_publishable_key: "",
    stripe_secret_key: "",
};
