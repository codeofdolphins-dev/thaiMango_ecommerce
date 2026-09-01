"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  currencySymbol,
  formatMoney,
} from "@/lib/currency";
import type { SettingsResponse } from "@/lib/storeSettings";

/** Store-currency-aware money formatting for admin screens. */
export function useMoney() {
  const settingsQuery = useQuery({
    queryKey: ["public-settings"],
    queryFn: async (): Promise<SettingsResponse | null> => {
      const res = await fetch("/api/settings");
      if (!res.ok) return null;
      const body = await res.json();
      return body.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  /* Admin screens always work in the base (entry) currency. */
  const currency: CurrencyCode = settingsQuery.data?.base_currency ?? DEFAULT_CURRENCY;
  const format = useCallback(
    (amount: number) => formatMoney(amount, currency),
    [currency]
  );

  return { currency, symbol: currencySymbol(currency), format };
}
