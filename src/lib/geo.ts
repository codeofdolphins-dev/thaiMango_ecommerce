/**
 * Best-effort visitor country (ISO 3166-1 alpha-2, uppercase) from request
 * headers. Hosting CDNs stamp the country in (Vercel/Cloudflare); locally
 * nothing does, so TM_COUNTRY in .env forces one for testing, and the
 * Accept-Language region ("en-IN", "th-TH") is the last hint.
 */
export function resolveCountry(headers: Headers): string | null {
  const override = process.env.TM_COUNTRY?.trim();
  if (override) return override.toUpperCase();

  const headerCountry =
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country-code");
  if (headerCountry && /^[A-Za-z]{2}$/.test(headerCountry)) {
    const code = headerCountry.toUpperCase();
    if (code !== "XX" && code !== "T1") return code; // Cloudflare unknowns
  }

  const acceptLanguage = headers.get("accept-language") ?? "";
  const region = acceptLanguage.match(/^[a-z]{2,3}-([A-Za-z]{2})\b/)?.[1];
  if (region) return region.toUpperCase();

  return null;
}
