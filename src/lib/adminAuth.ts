import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME, SessionPayload } from "@/lib/jwt";

/**
 * Reads the session cookie and returns the session payload only when the
 * caller is an authenticated ADMIN. Returns null otherwise.
 */
export async function requireAdmin(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = verifySessionToken(token);
    if (!session || session.role !== "ADMIN") return null;

    return session;
}
