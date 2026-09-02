import axios, { type AxiosResponse } from "axios";

/** The JSON envelope every API route wraps its payload in (ApiResponse). */
interface ApiEnvelope<T> {
    data: T;
    message?: string;
}

/**
 * The message the API actually sent, regardless of how the request failed —
 * mirrors the old `body.errors?.[0] || body.message` unwrapping the fetch
 * helpers did, so toasts keep showing server-side validation text.
 */
export function apiMessage(
    error: unknown,
    fallback = "Something went wrong"
): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as
            | { errors?: unknown[]; message?: string }
            | null
            | undefined;
        const first = data?.errors?.[0];
        if (typeof first === "string" && first) return first;
        if (typeof data?.message === "string" && data.message) return data.message;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

/**
 * Awaits an axios request against an ApiResponse route and returns the
 * unwrapped `data` payload. Failures are rethrown as plain `Error`s carrying
 * the API's message, so existing `onError: (e) => showToast(e.message)`
 * handlers keep working unchanged.
 */
export async function unwrap<T>(
    request: Promise<AxiosResponse<ApiEnvelope<T>>>
): Promise<T> {
    try {
        const res = await request;
        return res.data.data;
    } catch (error) {
        throw new Error(apiMessage(error));
    }
}
