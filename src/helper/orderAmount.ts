import {
    baseCurrencyOf,
    getStoreSettings,
    resolveDisplayCurrency,
} from "@/lib/storeSettings";
import { convertAmount, toMinorUnits } from "@/lib/currency";
import { getExchangeRate } from "@/lib/exchangeRates";
import { resolveCountry } from "@/lib/geo";
import { prisma } from "@/lib/prismaClient";
import type { CheckoutPayload } from "@/schemas/payment.schema";

/** Thrown when a cart line cannot be priced from the catalog. */
export class UnpricedLineError extends Error {
    constructor(public readonly line: string) {
        super(`"${line}" is no longer available at the price in your bag.`);
        this.name = "UnpricedLineError";
    }
}

/**
 * Re-prices every cart line from the database. The client sends prices only so
 * the UI can render instantly — trusting them would let anyone post their own
 * total and pay it, so the figure that reaches a gateway or an Order row is
 * always the catalog's.
 */
async function repriceItems(items: CheckoutPayload["items"]) {
    const slugs = items.map((i) => i.slug).filter(Boolean) as string[];
    const names = items.filter((i) => !i.slug).map((i) => i.name);

    const products = await prisma.product.findMany({
        where: {
            status: "ACTIVE",
            OR: [
                ...(slugs.length ? [{ slug: { in: slugs } }] : []),
                /* Carts saved before items carried a slug fall back to the name. */
                ...(names.length ? [{ name_en: { in: names } }] : []),
            ],
        },
        select: {
            slug: true,
            name_en: true,
            productVariant: {
                select: { label: true, price: true, is_default: true },
            },
        },
    });

    const bySlug = new Map(products.map((p) => [p.slug, p]));
    const byName = new Map(products.map((p) => [p.name_en, p]));

    return items.map((item) => {
        const product =
            (item.slug ? bySlug.get(item.slug) : undefined) ?? byName.get(item.name);
        if (!product) throw new UnpricedLineError(item.name);

        const variant =
            product.productVariant.find((v) => v.label === item.size) ??
            product.productVariant.find((v) => v.is_default) ??
            product.productVariant[0];
        if (!variant) throw new UnpricedLineError(item.name);

        return { ...item, price: Number(variant.price), label: variant.label };
    });
}

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

    /* All math happens in the base (entry) currency the prices are stored in,
       using catalog prices rather than whatever the client sent. */
    const pricedItems = await repriceItems(payload.items);
    const subtotal = pricedItems.reduce(
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
        /** Lines at their catalog price — what an Order row should store. */
        pricedItems,
    };
}
