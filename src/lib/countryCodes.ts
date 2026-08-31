export interface CountryCode {
    /** ISO 3166-1 alpha-2 */
    iso: string;
    name: string;
    /** International dialling prefix, including the leading "+" */
    dial: string;
    flag: string;
}

/** Thai Mango's shipping markets first, then the rest of the common list. */
export const COUNTRY_CODES: CountryCode[] = [
    { iso: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
    { iso: "TH", name: "Thailand", dial: "+66", flag: "🇹🇭" },
    { iso: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
    { iso: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
    { iso: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
    { iso: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
    { iso: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
    { iso: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
    { iso: "MY", name: "Malaysia", dial: "+60", flag: "🇲🇾" },
    { iso: "ID", name: "Indonesia", dial: "+62", flag: "🇮🇩" },
    { iso: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
    { iso: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
    { iso: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
    { iso: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
    { iso: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
    { iso: "LK", name: "Sri Lanka", dial: "+94", flag: "🇱🇰" },
    { iso: "NP", name: "Nepal", dial: "+977", flag: "🇳🇵" },
    { iso: "BD", name: "Bangladesh", dial: "+880", flag: "🇧🇩" },
];

export const DEFAULT_COUNTRY_ISO = "IN";

export const countryByIso = (iso: string) =>
    COUNTRY_CODES.find((c) => c.iso === iso) ??
    COUNTRY_CODES.find((c) => c.iso === DEFAULT_COUNTRY_ISO)!;

/**
 * Splits a stored phone string such as "+91 98765 43210" into its dial code and
 * the national number. Longest dial code wins so "+1" never shadows "+91".
 */
export function parsePhone(value: string): { iso: string; number: string } {
    const trimmed = (value ?? "").trim();
    if (!trimmed) return { iso: DEFAULT_COUNTRY_ISO, number: "" };

    const match = [...COUNTRY_CODES]
        .sort((a, b) => b.dial.length - a.dial.length)
        .find((c) => trimmed.startsWith(c.dial));

    if (!match) return { iso: DEFAULT_COUNTRY_ISO, number: trimmed };
    return { iso: match.iso, number: trimmed.slice(match.dial.length).trim() };
}

/** Joins a dial code and number back into the single stored string. */
export function formatPhone(iso: string, number: string): string {
    const national = (number ?? "").trim();
    if (!national) return "";
    return `${countryByIso(iso).dial} ${national}`;
}
