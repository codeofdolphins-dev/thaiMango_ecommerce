import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import { getStoreSettings, resolveGatewayCredentials } from "@/lib/storeSettings";
import { gatewayTestSchema, SECRET_MASK } from "@/schemas/settings.schema";

const TIMEOUT_MS = 10_000;

interface TestResult {
    ok: boolean;
    message: string;
}

const modeOf = (key: string) => (key.includes("_live_") ? "live" : "test");

/** Hits an authenticated read-only endpoint — the cheapest proof the pair works. */
async function testRazorpay(keyId: string, keySecret: string): Promise<TestResult> {
    if (!keyId || !keySecret) {
        return { ok: false, message: "Enter both the Key ID and Key Secret first." };
    }
    if (!/^rzp_(test|live)_/.test(keyId)) {
        return { ok: false, message: "Key ID should start with rzp_test_ or rzp_live_." };
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    try {
        const res = await fetch("https://api.razorpay.com/v1/payments?count=1", {
            headers: { Authorization: `Basic ${auth}` },
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (res.ok) {
            return {
                ok: true,
                message: `Connected — ${modeOf(keyId)} mode credentials are valid.`,
            };
        }
        if (res.status === 401) {
            return { ok: false, message: "Razorpay rejected these credentials (401)." };
        }
        const body = await res.json().catch(() => null);
        return {
            ok: false,
            message:
                body?.error?.description ?? `Razorpay responded with HTTP ${res.status}.`,
        };
    } catch (error) {
        console.error("Razorpay connection test failed:", error);
        return {
            ok: false,
            message: "Could not reach Razorpay — check the network and try again.",
        };
    }
}

/** Verifies the secret against the API, then checks the publishable key matches. */
async function testStripe(
    secretKey: string,
    publishableKey: string
): Promise<TestResult> {
    if (!secretKey) {
        return { ok: false, message: "Enter the Secret Key first." };
    }
    if (!/^sk_(test|live)_/.test(secretKey)) {
        return { ok: false, message: "Secret Key should start with sk_test_ or sk_live_." };
    }

    try {
        const stripe = new Stripe(secretKey, {
            maxNetworkRetries: 0,
            timeout: TIMEOUT_MS,
        });
        const balance = await stripe.balance.retrieve();
        const secretMode = balance.livemode ? "live" : "test";

        /* The publishable key can't be verified by an API call, but a wrong
           prefix or a mode mismatch would break the card form at checkout. */
        if (publishableKey) {
            if (!/^pk_(test|live)_/.test(publishableKey)) {
                return {
                    ok: false,
                    message:
                        "Secret Key works, but the Publishable Key should start with pk_test_ or pk_live_.",
                };
            }
            if (modeOf(publishableKey) !== secretMode) {
                return {
                    ok: false,
                    message: `Secret Key works (${secretMode} mode), but the Publishable Key is a ${modeOf(
                        publishableKey
                    )} mode key — both must match.`,
                };
            }
        }

        return {
            ok: true,
            message: publishableKey
                ? `Connected — ${secretMode} mode keys are valid.`
                : `Secret Key valid (${secretMode} mode). Add the Publishable Key to enable the card form.`,
        };
    } catch (error) {
        if (error instanceof Stripe.errors.StripeAuthenticationError) {
            return { ok: false, message: "Stripe rejected this Secret Key." };
        }
        if (error instanceof Stripe.errors.StripeConnectionError) {
            return {
                ok: false,
                message: "Could not reach Stripe — check the network and try again.",
            };
        }
        console.error("Stripe connection test failed:", error);
        const message =
            error instanceof Stripe.errors.StripeError
                ? error.message
                : "Stripe connection test failed.";
        return { ok: false, message };
    }
}

export async function POST(req: Request) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const parsed = gatewayTestSchema.safeParse(await req.json());
        if (!parsed.success) {
            const apiError = new ApiError(400, "Invalid test request.", parsed.error.issues);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        /* Test what is typed in the form; a blank or still-masked secret falls
           back to the saved (or .env) value, so keys can be checked without
           re-entering them. */
        const saved = resolveGatewayCredentials(await getStoreSettings());
        const pickKey = (typed: string | undefined, fallback: string) =>
            typed && typed !== SECRET_MASK ? typed : fallback;

        const result =
            parsed.data.gateway === "razorpay"
                ? await testRazorpay(
                      pickKey(parsed.data.key_id, saved.razorpay.keyId),
                      pickKey(parsed.data.key_secret, saved.razorpay.keySecret)
                  )
                : await testStripe(
                      pickKey(parsed.data.secret_key, saved.stripe.secretKey),
                      pickKey(parsed.data.publishable_key, saved.stripe.publishableKey)
                  );

        const apiResponse = new ApiResponse(200, result, result.message);
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Gateway connection test failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
