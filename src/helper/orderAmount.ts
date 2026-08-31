import {
    baseCurrencyOf,
    getStoreSettings,
    resolveDisplayCurrency,
} from "@/lib/storeSettings";
import { convertAmount, toMinorUnits } from "@/lib/currency";
import { getExchangeRate } from "@/lib/exchangeRates";
import { resolveCountry } from "@/lib/geo";
import type { CheckoutPayload } from "@/schemas/payment.schema";

/**
 * Recomputes the order total server-side, mirroring the storefront math in
 * src/app/(public)/checkout/page.tsx so the charged amount never comes
 * straight from a client-supplied total.
 *
 * Shipping thresholds and rates are read from admin Settings — the same source
 * the checkout page displays — so the two can never disagree.
 *
 * TODO: once cart items carry product/variant ids, re-price each line from
 * the DB instead of trusting client line prices, and validate the coupon
 * code against the Coupon table.
 */
export async function computeOrderAmount(
    payload: CheckoutPayload,
    /** Request headers — used to resolve the visitor's charge currency. */
    headers?: Headers
) {
    const settings = await getStoreSettings();

    /* All math happens in the base (entry) currency the prices are stored in. */
    const subtotal = payload.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const standardCost =
        subtotal >= settings.free_shipping_above ? 0 : settings.standard_shipping;
    const shipping =
        payload.shippingMethod === "priority"
            ? settings.priority_shipping
            : standardCost;
    const discount = Math.round(subtotal * (payload.couponDiscount ?? 0));
    const total = Math.max(0, subtotal - discount + (subtotal > 0 ? shipping : 0));

    /* Charge in what the visitor was shown: IN → INR, TH → THB, otherwise the
       display currency setting (or USD) — converted at the live rate. */
    const baseCurrency = baseCurrencyOf(settings);
    const country = headers ? resolveCountry(headers) : null;
    const currency = resolveDisplayCurrency(settings, country);
    const rate = await getExchangeRate(baseCurrency, currency);
    const chargeTotal = convertAmount(total, rate, currency);

    return {
        subtotal,
        shipping,
        discount,
        total,
        baseCurrency,
        currency,
        rate,
        chargeTotal,
        /** Gateways charge in the currency's minor unit (paise/cents/satang). */
        amountMinor: toMinorUnits(chargeTotal),
    };
}
