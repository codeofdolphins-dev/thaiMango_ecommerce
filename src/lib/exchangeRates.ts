import { CurrencyCode } from "@/lib/currency";

/**
 * Free, keyless FX source: https://open.er-api.com (ExchangeRate-API open
 * endpoint, refreshed daily, no signup). One request fetches every rate with
 * USD as base; cross rates are derived from it, so a single cached response
 * serves all currency pairs.
 */
const RATES_URL = "https://open.er-api.com/v6/latest/USD";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h — the source updates daily
const FETCH_TIMEOUT_MS = 5_000;

/* Last-resort rates (USD base) so prices still render if the API and the
   cache are both unavailable. Refreshed whenever this file is touched. */
const STATIC_FALLBACK: Record<CurrencyCode, number> = {
  USD: 1,
  INR: 88,
  THB: 32,
};

interface RatesCache {
  fetchedAt: number;
  rates: Record<string, number>;
}

/* Module-level cache survives across requests within a server instance. */
let cache: RatesCache | null = null;
let inflight: Promise<RatesCache | null> | null = null;

async function fetchRates(): Promise<RatesCache | null> {
  try {
    const res = await fetch(RATES_URL, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      /* Route handlers run per request — rely on our own TTL, not Next's. */
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = await res.json();
    if (body?.result !== "success" || typeof body?.rates !== "object") {
      return null;
    }
    return { fetchedAt: Date.now(), rates: body.rates };
  } catch (error) {
    console.error("Exchange-rate fetch failed:", error);
    return null;
  }
}

async function getUsdRates(): Promise<Record<string, number>> {
  const fresh = cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS;
  if (cache && fresh) return cache.rates;

  /* De-duplicate concurrent refreshes. */
  inflight ??= fetchRates().finally(() => {
    inflight = null;
  });
  const result = await inflight;
  if (result) cache = result;

  /* Stale cache beats static numbers; static numbers beat nothing. */
  return cache?.rates ?? STATIC_FALLBACK;
}

/** Multiplier that converts an amount in `from` into `to`. */
export async function getExchangeRate(
  from: CurrencyCode,
  to: CurrencyCode
): Promise<number> {
  if (from === to) return 1;
  const rates = await getUsdRates();
  const fromRate = rates[from] ?? STATIC_FALLBACK[from];
  const toRate = rates[to] ?? STATIC_FALLBACK[to];
  if (!fromRate || !toRate) return 1;
  return toRate / fromRate;
}
