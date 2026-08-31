"use client";

import { useEffect, useMemo, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

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
  const options = useMemo(
    () => ({
      mode: "payment" as const,
      amount: Math.max(50, amountPaise),
      currency: "inr",
      appearance: {
        variables: {
          colorPrimary: "#7A1233",
          colorText: "#2d2a26",
          borderRadius: "12px",
          fontSizeBase: "14px",
        },
      },
    }),
    [amountPaise]
  );

  if (!stripePromise) {
    return (
      <p className="text-xs text-muted p-4 rounded-2xl bg-cream/40 border border-cream">
        Card payments are unavailable — NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is
        not configured.
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <InnerForm buildPayload={buildPayload} registerPay={registerPay} />
    </Elements>
  );
}
