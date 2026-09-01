"use client";

import { useEffect, useMemo, useRef } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useStore } from "@/components/public/store";
import { CURRENCIES } from "@/lib/currency";

/* A placeholder such as "pk_test_xxxxxxxxxxxx" is truthy, so Stripe.js accepts
   it here and rejects asynchronously — leaving a blank card area with nothing
   to explain it. Reject obviously-fake keys up front instead. */
const isUsableKey = (key: string | undefined): key is string =>
  !!key &&
  /^pk_(test|live)_/.test(key) &&
  !/^pk_(test|live)_x+$/i.test(key) &&
  key.length >= 30;

/* The publishable key now comes from admin Settings at runtime, so cache the
   Stripe instance per key rather than creating one at module load.
   Swallow a load failure (bad key, blocked network) so the form falls back to
   the notice below rather than throwing. */
const stripeCache = new Map<string, Promise<Stripe | null>>();

function getStripe(key: string) {
  const cached = stripeCache.get(key);
  if (cached) return cached;
  const promise = loadStripe(key).catch(() => null);
  stripeCache.set(key, promise);
  return promise;
}

export type CardPayResult = {
  ok: boolean;
  reference?: string;
  error?: string;
};
export type CardPayFn = () => Promise<CardPayResult>;

interface StripeCardFormProps {
  /** Order total in paise; keeps the Payment Element amount in sync. */
  amountPaise: number;
  /** Builds the checkout payload POSTed to /api/payments/stripe/intent. */
  buildPayload: () => unknown;
  /** Receives the pay() trigger so the page's Complete Order button can run it. */
  registerPay: (fn: CardPayFn | null) => void;
}

function InnerForm({
  buildPayload,
  registerPay,
}: Pick<StripeCardFormProps, "buildPayload" | "registerPay">) {
  const stripe = useStripe();
  const elements = useElements();

  /* Refs keep the registered pay() stable while props change each render. */
  const buildPayloadRef = useRef(buildPayload);
  useEffect(() => {
    buildPayloadRef.current = buildPayload;
  }, [buildPayload]);

  useEffect(() => {
    if (!stripe || !elements) return;

    registerPay(async () => {
      const submitResult = await elements.submit();
      if (submitResult.error) {
        return { ok: false, error: submitResult.error.message };
      }

      const res = await fetch("/api/payments/stripe/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayloadRef.current()),
      });
      const data = await res.json().catch(() => null);
      const clientSecret: string | undefined = data?.data?.clientSecret;
      if (!res.ok || !clientSecret) {
        return {
          ok: false,
          error: data?.message || "Could not start the card payment.",
        };
      }

      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: { return_url: `${window.location.origin}/checkout` },
        redirect: "if_required",
      });
      if (result.error) {
        return { ok: false, error: result.error.message };
      }
      const intent = result.paymentIntent;
      if (intent && (intent.status === "succeeded" || intent.status === "processing")) {
        return { ok: true, reference: intent.id };
      }
      return { ok: false, error: "Payment was not completed." };
    });

    return () => registerPay(null);
  }, [stripe, elements, registerPay]);

  return <PaymentElement options={{ layout: "tabs" }} />;
}

export default function StripeCardForm({
  amountPaise,
  buildPayload,
  registerPay,
}: StripeCardFormProps) {
  /* Currency and the publishable key follow admin Settings — never hardcoded. */
  const { currency, settings } = useStore();
  /* stripe_pk is the server-resolved key (saved value or .env fallback). */
  const publishableKey = settings?.stripe_pk;
  const stripePromise = useMemo(
    () => (isUsableKey(publishableKey) ? getStripe(publishableKey) : null),
    [publishableKey]
  );
  const options = useMemo(
    () => ({
      mode: "payment" as const,
      amount: Math.max(CURRENCIES[currency].minChargeMinor, amountPaise),
      currency: currency.toLowerCase(),
      appearance: {
        variables: {
          colorPrimary: "#7A1233",
          colorText: "#2d2a26",
          borderRadius: "12px",
          fontSizeBase: "14px",
        },
      },
    }),
    [amountPaise, currency]
  );

  if (!stripePromise) {
    return (
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
        <p className="text-xs font-semibold text-amber-900 mb-1">
          Stripe is not configured yet
        </p>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          {publishableKey
            ? "The saved Stripe publishable key looks like a placeholder."
            : "No Stripe publishable key has been saved."}{" "}
          Add your real key from the Stripe dashboard (Developers → API keys) in
          Admin → Settings → Payment Gateways. Meanwhile you can pay with
          Razorpay or Cash on Delivery.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <InnerForm buildPayload={buildPayload} registerPay={registerPay} />
    </Elements>
  );
}
