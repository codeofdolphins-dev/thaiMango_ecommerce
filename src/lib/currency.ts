export type CurrencyCode = "INR" | "USD" | "THB";

interface CurrencyMeta {
  symbol: string;
  locale: string;
  label: string;
  /** Display rounding — 0 for ₹/฿ street prices, 2 for USD. */
  decimals: number;
  /** Gateway minimum charge in minor units (Stripe's per-currency floor). */
  minChargeMinor: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  INR: {
    symbol: "₹",
    locale: "en-IN",
    label: "INR — Indian Rupee (₹)",
    decimals: 0,
    minChargeMinor: 50,
  },
  USD: {
    symbol: "$",
    locale: "en-US",
    label: "USD — US Dollar ($)",
    decimals: 2,
    minChargeMinor: 50,
  },
  THB: {
    symbol: "฿",
    locale: "th-TH",
    label: "THB — Thai Baht (฿)",
    decimals: 0,
    minChargeMinor: 1000,
  },
};

/** Fallback base (entry) currency until the admin picks one in Settings. */
export const DEFAULT_CURRENCY: CurrencyCode = "THB";

/** Shoppers outside IN/TH with no display currency saved see prices in this. */
export const DEFAULT_DISPLAY_CURRENCY: CurrencyCode = "USD";

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === "string" && value in CURRENCIES;
}

/**
 * Product amounts are stored in the base currency; multiply by the exchange
 * rate BEFORE formatting when showing another currency.
 */
export function formatMoney(
  amount: number,
  currency: CurrencyCode = DEFAULT_CURRENCY
) {
  const meta = CURRENCIES[currency] ?? CURRENCIES[DEFAULT_CURRENCY];
  return `${meta.symbol}${Number(amount).toLocaleString(meta.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: meta.decimals,
  })}`;
}

export const currencySymbol = (currency: CurrencyCode = DEFAULT_CURRENCY) =>
  (CURRENCIES[currency] ?? CURRENCIES[DEFAULT_CURRENCY]).symbol;

/** Converts and rounds to the target currency's display precision. */
export function convertAmount(
  amount: number,
  rate: number,
  to: CurrencyCode
) {
  const factor = 10 ** CURRENCIES[to].decimals;
  return Math.round(amount * rate * factor) / factor;
}

/** Razorpay and Stripe both bill in the currency's minor unit (paise/cents/satang). */
export const toMinorUnits = (amount: number) => Math.round(amount * 100);
