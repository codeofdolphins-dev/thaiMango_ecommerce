import { formatMoney } from "@/lib/currency";

/** @deprecated static fallback — components should use useMoney() from
 *  "./useMoney" so the symbol follows the store currency setting. */
export const formatINR = (n: number) => formatMoney(Number(n));
