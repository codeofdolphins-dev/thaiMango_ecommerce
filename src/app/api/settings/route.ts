import { NextResponse } from "next/server";
import { ApiResponse } from "@/helper/apiResponse";
import {
    baseCurrencyOf,
    getStoreSettings,
    resolveDisplayCurrency,
    toPublicSettings,
} from "@/lib/storeSettings";
import { getExchangeRate } from "@/lib/exchangeRates";
import { resolveCountry } from "@/lib/geo";

/* Storefront-facing settings — no auth, admin-only fields stripped.
   Includes the visitor-resolved display currency (IN → INR, TH → THB,
   otherwise the saved display currency or USD) and the base → display
   exchange rate the client multiplies prices by. */
export async function GET(req: Request) {
    const settings = await getStoreSettings();
    const country = resolveCountry(req.headers);
    const baseCurrency = baseCurrencyOf(settings);
    const displayCurrency = resolveDisplayCurrency(settings, country);
    const displayRate = await getExchangeRate(baseCurrency, displayCurrency);

    // console.log("settings", settings)

    const apiResponse = new ApiResponse(
        200,
        {
            ...toPublicSettings(settings),
            country,
            display_currency: displayCurrency,
            display_rate: displayRate,
        },
        "Settings fetched successfully"
    );
    return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
}
