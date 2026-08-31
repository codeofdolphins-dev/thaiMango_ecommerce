import { z } from "zod";

export const settingsSchema = z.object({
    store_name: z.string().trim().min(1, "Store name is required"),
    support_email: z.email("Enter a valid email"),
    support_phone: z.string().trim().min(7, "Enter a valid phone number"),
    store_address: z.string().trim().min(1, "Address is required"),
    free_shipping_above: z.coerce.number<number | string>().nonnegative(),
    standard_shipping: z.coerce.number<number | string>().nonnegative(),
    gst_rate: z.coerce.number<number | string>().min(0).max(100),
    currency: z.enum(["INR", "USD", "THB"]),
    cod_enabled: z.boolean(),
    upi_enabled: z.boolean(),
    intl_shipping: z.boolean(),
    notif_new_order: z.boolean(),
    notif_low_stock: z.boolean(),
    notif_weekly: z.boolean(),
    maintenance_mode: z.boolean(),
    show_announcement: z.boolean(),
});

export type SettingsValues = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: SettingsValues = {
    store_name: "Thai Mango",
    support_email: "care@thaimango.com",
    support_phone: "+91 98765 43210",
    store_address: "Bangkok Orchard House, MG Road, Bengaluru, KA 560001",
    free_shipping_above: 1500,
    standard_shipping: 99,
    gst_rate: 5,
    currency: "INR",
    cod_enabled: true,
    upi_enabled: true,
    intl_shipping: false,
    notif_new_order: true,
    notif_low_stock: true,
    notif_weekly: false,
    maintenance_mode: false,
    show_announcement: true,
};
