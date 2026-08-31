"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  Lock,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Headphones,
  Check,
} from "lucide-react";
import { useStore } from "@/components/public/store";
import {
  formatPrice,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
} from "@/lib/site-data";
import StripeCardForm, {
  type CardPayFn,
} from "@/components/public/StripeCardForm";

type ShippingMethod = "standard" | "priority";
type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

/* ── Razorpay Checkout (loaded on demand from checkout.razorpay.com) ── */

interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const PAYMENT_TABS: { id: PaymentMethod; label: string }[] = [
  { id: "upi", label: "UPI & QR" },
  { id: "card", label: "Cards" },
  { id: "netbanking", label: "Net Banking" },
  { id: "cod", label: "Cash / COD" },
];

export default function CheckoutPage() {
  const { cart, subtotal, user, clearCart, showToast, mounted } = useStore();

  const cartItems = useMemo(() => (mounted ? cart : []), [mounted, cart]);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(
    "standard"
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("upi");
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState("");

  /* Prefill contact/address fields from an existing session, without
     overwriting anything the shopper has already typed. */
  useEffect(() => {
    if (mounted && user?.isLoggedIn) {
      setEmail((v) => v || user.email || "");
      setPhone((v) => v || user.phone || "+91 98765 43210");
      setFirstName((v) => v || user.firstName || "");
      setLastName((v) => v || user.lastName || "");
    }
  }, [mounted, user]);

  /* Pick up a coupon applied on the cart page (shared via localStorage,
     mirroring the static site's module-level coupon state). */
  useEffect(() => {
    if (!mounted) return;
    try {
      const saved = parseFloat(
        localStorage.getItem("bm_coupon_discount") || "0"
      );
      if (saved > 0) setCouponDiscount(saved);
    } catch {}
  }, [mounted]);

  useEffect(() => {
    document.body.style.overflow = showSuccessModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSuccessModal]);

  const standardCost =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const shippingCost = shippingMethod === "priority" ? 199 : standardCost;
  const discountAmount = Math.round(subtotal * couponDiscount);
  const total = Math.max(
    0,
    subtotal - discountAmount + (subtotal > 0 ? shippingCost : 0)
  );
  const gstAmount = Math.round(subtotal * 0.18);

  /* On a real payment the gateway's payment id becomes the order reference;
     COD falls back to a locally generated one. */
  const completeCheckout = useCallback(
    (reference?: string) => {
      const newOrderId =
        reference ??
        `#TM-${new Date().getFullYear()}-${Math.floor(
          10000 + Math.random() * 90000
        )}`;
      setOrderId(newOrderId);
      clearCart();
      setShowSuccessModal(true);
      showToast(`Order Placed! Reference: ${newOrderId}`);
      setIsSubmitting(false);
    },
    [clearCart, showToast]
  );

  const cardPayRef = useRef<CardPayFn | null>(null);
  const registerCardPay = useCallback((fn: CardPayFn | null) => {
    cardPayRef.current = fn;
  }, []);

  const customerName = `${firstName} ${lastName}`.trim();

  const buildPayload = useCallback(
    () => ({
      items: cartItems.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
      })),
      shippingMethod,
      couponDiscount,
      customer: {
        name: customerName || undefined,
        email: email || undefined,
        phone: phone || undefined,
      },
    }),
    [cartItems, shippingMethod, couponDiscount, customerName, email, phone]
  );

  const payWithRazorpay = async () => {
    setIsSubmitting(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        showToast("Could not load Razorpay. Check your connection.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.data?.orderId) {
        showToast(data?.message || "Could not initiate payment.");
        setIsSubmitting(false);
        return;
      }

      const { orderId: rzpOrderId, amount, currency, keyId } = data.data;
      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: rzpOrderId,
        name: "Thai Mango",
        description: "Sun-dried mango order",
        prefill: {
          name: customerName || undefined,
          email: email || undefined,
          contact: phone || undefined,
        },
        theme: { color: "#7A1233" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            if (verifyRes.ok) {
              completeCheckout(response.razorpay_payment_id);
            } else {
              showToast("Payment verification failed. Contact support.");
              setIsSubmitting(false);
            }
          } catch {
            showToast("Payment verification failed. Contact support.");
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            showToast("Payment cancelled.");
            setIsSubmitting(false);
          },
        },
      });
      razorpay.open();
    } catch {
      showToast("Could not start the payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleExpressPay = (provider: string) => {
    if (cartItems.length === 0) {
      showToast("Your bag is empty.");
      return;
    }
    showToast(`Opening Razorpay for ${provider}...`);
    void payWithRazorpay();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      showToast("Your bag is empty.");
      return;
    }

    if (selectedPayment === "cod") {
      setIsSubmitting(true);
      setTimeout(() => completeCheckout(), 800);
      return;
    }

    if (selectedPayment === "card") {
      if (!cardPayRef.current) {
        showToast("The card form is still loading — one moment.");
        return;
      }
      setIsSubmitting(true);
      const result = await cardPayRef.current();
      if (result.ok) {
        completeCheckout(result.reference);
      } else {
        showToast(result.error || "Card payment failed.");
        setIsSubmitting(false);
      }
      return;
    }

    /* UPI & Net Banking both route through Razorpay Checkout. */
    await payWithRazorpay();
  };

  return (
    <>
      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-muted uppercase tracking-widest mb-8">
            <Link href="/" className="hover:text-charcoal transition">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/cart" className="hover:text-charcoal transition">
              Shopping Bag
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-charcoal font-semibold">
              Express Checkout
            </span>
          </nav>

          {/* Checkout Container Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Checkout Form Steps */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              {/* Quick Express Checkout Buttons */}
              <div className="p-6 rounded-3xl bg-white border border-cream shadow-sm">
                <span className="text-[10px] uppercase tracking-widest text-muted font-bold block text-center mb-3">
                  Express 1-Click Checkout
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleExpressPay("Google Pay")}
                    className="py-3 px-4 rounded-2xl bg-charcoal text-white flex items-center justify-center gap-2 hover:bg-black transition shadow-sm"
                  >
                    <span className="text-xs font-semibold">GPay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExpressPay("PhonePe / UPI")}
                    className="py-3 px-4 rounded-2xl bg-[#5f259f] text-white flex items-center justify-center gap-2 hover:opacity-90 transition shadow-sm"
                  >
                    <span className="text-xs font-semibold">PhonePe / UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExpressPay("Paytm")}
                    className="py-3 px-4 rounded-2xl bg-[#002e6e] text-white flex items-center justify-center gap-2 hover:opacity-90 transition shadow-sm"
                  >
                    <span className="text-xs font-semibold">Paytm</span>
                  </button>
                </div>
              </div>

              <form
                id="checkout-main-form"
                className="space-y-8"
                onSubmit={handleSubmit}
              >
                {/* Step 1: Contact Information */}
                <div className="p-6 md:p-8 rounded-3xl bg-white border border-cream shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold font-serif">
                        1
                      </span>
                      <h3 className="font-serif text-xl md:text-2xl text-charcoal">
                        Contact Details
                      </h3>
                    </div>
                    <span className="text-xs text-muted">
                      {mounted && user?.isLoggedIn ? (
                        <span className="text-accent font-semibold">
                          Logged In ({user.firstName})
                        </span>
                      ) : (
                        "Guest Checkout"
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                        Email for Dispatch Updates *
                      </label>
                      <input
                        type="email"
                        id="co-email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/40 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                        Phone Number (For Courier Tracking) *
                      </label>
                      <input
                        type="tel"
                        id="co-phone"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/40 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2: Delivery Address */}
                <div className="p-6 md:p-8 rounded-3xl bg-white border border-cream shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold font-serif">
                      2
                    </span>
                    <h3 className="font-serif text-xl md:text-2xl text-charcoal">
                      Shipping Address
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="co-firstname"
                          required
                          placeholder="e.g. Aarav"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/40 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="co-lastname"
                          required
                          placeholder="e.g. Sharma"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/40 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                        Street Address, House/Flat No. *
                      </label>
                      <input
                        type="text"
                        id="co-address"
                        required
                        placeholder="Flat 402, Lotus Pavilion, Palm Avenue"
                        className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/40 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          id="co-city"
                          required
                          placeholder="Mumbai"
                          className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/40 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          id="co-state"
                          required
                          placeholder="Maharashtra"
                          className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/40 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                          PIN / Postal Code *
                        </label>
                        <input
                          type="text"
                          id="co-pincode"
                          required
                          placeholder="400001"
                          maxLength={6}
                          className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/40 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        defaultValue="India"
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-cream bg-cream/30 text-sm text-charcoal font-semibold cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3: Shipping Method */}
                <div className="p-6 md:p-8 rounded-3xl bg-white border border-cream shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold font-serif">
                      3
                    </span>
                    <h3 className="font-serif text-xl md:text-2xl text-charcoal">
                      Delivery Method
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <label
                      className={`shipping-option flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                        shippingMethod === "standard"
                          ? "border-charcoal bg-ivory/60"
                          : "border-cream bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping-method"
                          value="standard"
                          checked={shippingMethod === "standard"}
                          onChange={() => setShippingMethod("standard")}
                          className="w-4 h-4 text-accent accent-accent"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                            Standard Mango Express (2–4 Days)
                          </h4>
                          <p className="text-[11px] text-muted">
                            Complimentary on orders above ₹1,500, packed fresh
                            for shipping.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-charcoal">
                        {standardCost === 0
                          ? "FREE"
                          : formatPrice(standardCost)}
                      </span>
                    </label>

                    <label
                      className={`shipping-option flex items-center justify-between p-4 rounded-2xl border hover:border-charcoal cursor-pointer transition ${
                        shippingMethod === "priority"
                          ? "border-charcoal bg-ivory/60"
                          : "border-cream bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping-method"
                          value="priority"
                          checked={shippingMethod === "priority"}
                          onChange={() => setShippingMethod("priority")}
                          className="w-4 h-4 text-accent accent-accent"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                            Priority Same-Day / Next-Day Delivery (1–2 Days)
                          </h4>
                          <p className="text-[11px] text-muted">
                            Expedited air dispatch directly from our Mumbai /
                            Bangkok hubs.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-charcoal">
                        ₹199
                      </span>
                    </label>
                  </div>
                </div>

                {/* Step 4: Payment Selection */}
                <div className="p-6 md:p-8 rounded-3xl bg-white border border-cream shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold font-serif">
                      4
                    </span>
                    <h3 className="font-serif text-xl md:text-2xl text-charcoal">
                      Payment Selection
                    </h3>
                  </div>

                  {/* Payment Method Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                    {PAYMENT_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedPayment(tab.id)}
                        className={`pay-tab-btn py-3 px-2 rounded-2xl border text-xs font-semibold text-center transition ${
                          selectedPayment === tab.id
                            ? "active border-charcoal bg-charcoal text-white"
                            : "border-cream bg-ivory/50 text-charcoal hover:border-accent"
                        }`}
                      >
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* UPI Tab Content */}
                  <div
                    className={`pay-tab-content space-y-4 ${
                      selectedPayment === "upi" ? "" : "hidden"
                    }`}
                  >
                    <div className="p-4 rounded-2xl bg-cream/40 border border-cream">
                      <p className="text-xs font-semibold text-charcoal mb-1">
                        Pay with any UPI app via Razorpay
                      </p>
                      <p className="text-[11px] text-muted leading-relaxed">
                        Google Pay, PhonePe, Paytm, BHIM, or any UPI ID / QR
                        scan. Clicking Complete Order opens the secure Razorpay
                        window to finish the payment.
                      </p>
                    </div>
                  </div>

                  {/* Card Tab Content */}
                  <div
                    className={`pay-tab-content space-y-4 ${
                      selectedPayment === "card" ? "" : "hidden"
                    }`}
                  >
                    {selectedPayment === "card" && (
                      <StripeCardForm
                        amountPaise={Math.round(total * 100)}
                        buildPayload={buildPayload}
                        registerPay={registerCardPay}
                      />
                    )}
                    <p className="text-[11px] text-muted">
                      Cards are processed securely by Stripe — details never
                      touch our servers.
                    </p>
                  </div>

                  {/* Net Banking Content */}
                  <div
                    className={`pay-tab-content space-y-4 ${
                      selectedPayment === "netbanking" ? "" : "hidden"
                    }`}
                  >
                    <div className="p-4 rounded-2xl bg-cream/40 border border-cream">
                      <p className="text-xs font-semibold text-charcoal mb-1">
                        Net Banking via Razorpay
                      </p>
                      <p className="text-[11px] text-muted leading-relaxed">
                        HDFC, ICICI, SBI, Axis, Kotak and all major Indian
                        banks are supported. You&apos;ll pick your bank in the
                        secure Razorpay window after clicking Complete Order.
                      </p>
                    </div>
                  </div>

                  {/* Cash on Delivery Content */}
                  <div
                    className={`pay-tab-content ${
                      selectedPayment === "cod" ? "" : "hidden"
                    }`}
                  >
                    <div className="p-4 rounded-2xl bg-cream/40 border border-cream text-xs text-charcoal leading-relaxed">
                      <p className="font-semibold mb-1">
                        Cash on Delivery (COD) Selected
                      </p>
                      <p className="text-muted">
                        Pay comfortably in cash or via QR code upon delivery at
                        your doorstep. Please ensure exact change if possible.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  id="complete-order-btn"
                  disabled={isSubmitting}
                  className="w-full py-4 px-8 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all duration-300 shadow-xl flex items-center justify-center text-center gap-3 group"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center justify-center gap-2.5 mx-auto">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Securing Your Order...</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2.5 mx-auto">
                      <Lock className="w-4 h-4 text-emerald-400 inline-block shrink-0" />
                      <span>
                        Complete Order •{" "}
                        <span id="co-btn-total">{formatPrice(total)}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform inline-block shrink-0" />
                    </span>
                  )}
                </button>

                <p className="text-[10px] text-center uppercase tracking-widest text-muted/70">
                  By placing your order, you agree to our{" "}
                  <Link href="/terms" className="underline hover:text-accent">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    className="underline hover:text-accent"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            </div>

            {/* Right Column: Sticky Order Summary */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-28 space-y-6">
              <div className="p-6 md:p-8 rounded-3xl bg-white border border-cream shadow-lg space-y-6">
                <div className="flex justify-between items-center border-b border-cream pb-4">
                  <h3 className="font-serif text-2xl text-charcoal">
                    In Your Bag
                  </h3>
                  <Link
                    href="/cart"
                    className="text-xs uppercase tracking-wider font-semibold text-accent hover:underline"
                  >
                    Edit Bag
                  </Link>
                </div>

                {/* Checkout Items List */}
                <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar">
                  {cartItems.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted">
                      <p className="mb-2">Your bag is empty.</p>
                      <Link
                        href="/shop"
                        className="text-accent underline font-semibold"
                      >
                        Shop Products
                      </Link>
                    </div>
                  ) : (
                    cartItems.map((item, index) => (
                      <div
                        key={`${item.name}-${item.size}-${index}`}
                        className="flex items-center justify-between gap-3 text-xs py-2 border-b border-cream/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover bg-cream border border-cream"
                            />
                            <span className="absolute -top-1.5 -right-1.5 bg-charcoal text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-charcoal truncate max-w-[150px] sm:max-w-[180px]">
                              {item.name}
                            </h4>
                            <span className="text-[10px] text-muted">
                              {item.size || "Standard 100g"}
                            </span>
                          </div>
                        </div>
                        <span className="font-serif text-sm font-semibold text-charcoal shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Price Calculations */}
                <div className="space-y-3 text-sm text-muted pt-4 border-t border-cream">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="font-semibold text-charcoal">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between items-center text-emerald-600 ${
                      discountAmount > 0 ? "" : "hidden"
                    }`}
                  >
                    <span>Discount</span>
                    <span className="font-bold">
                      -{formatPrice(discountAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping</span>
                    <span className="font-semibold text-charcoal">
                      {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted/70">
                    <span>GST (18% Included)</span>
                    <span>{formatPrice(gstAmount)}</span>
                  </div>
                </div>

                {/* Final Total */}
                <div className="pt-4 border-t border-charcoal/10 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs uppercase tracking-widest font-bold text-charcoal block">
                      Total Due
                    </span>
                    <span className="text-[10px] text-muted">
                      All duties &amp; taxes included
                    </span>
                  </div>
                  <span className="font-serif text-3xl text-charcoal font-bold">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Security Assurance */}
                <div className="pt-4 border-t border-cream space-y-3 text-xs text-muted">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                    <span>256-Bit SSL Encrypted Transaction</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <PackageCheck className="w-4 h-4 text-accent shrink-0" />
                    <span>Packed Fresh for Shipping</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Headphones className="w-4 h-4 text-accent shrink-0" />
                    <span>Customer Support: hello@thaimango.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Order Success Modal */}
      <div
        id="order-success-modal"
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
          showSuccessModal ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-charcoal/70 backdrop-blur-md" />
        <div
          className={`relative bg-white w-full max-w-lg rounded-3xl p-8 md:p-10 shadow-2xl z-10 text-center transform transition-transform duration-300 border border-cream ${
            showSuccessModal ? "scale-100" : "scale-95"
          }`}
        >
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Check className="w-10 h-10 stroke-[2.5]" />
          </div>
          <span className="text-[10px] tracking-[0.25em] uppercase text-accent font-bold mb-2 block">
            Order Placed Successfully
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">
            Thank You for Your Order
          </h2>
          <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-4">
            Order ID:{" "}
            <span id="confirmed-order-id" className="text-accent">
              {orderId || "#TM-2026-89420"}
            </span>
          </p>
          <p className="text-sm text-muted leading-relaxed mb-6">
            A confirmation email has been dispatched with tracking details.
            Your mangoes are being packed fresh for shipping.
          </p>
          <div className="p-4 rounded-2xl bg-cream/40 border border-cream mb-8 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted">Estimated Delivery:</span>
              <span className="font-bold text-charcoal">
                3–4 Business Days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Payment Status:</span>
              <span className="font-bold text-emerald-600">
                Confirmed / Paid
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 py-3.5 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition shadow-sm text-center"
            >
              View My Orders
            </Link>
            <Link
              href="/shop"
              className="flex-1 py-3.5 bg-cream text-charcoal rounded-full text-xs uppercase tracking-widest font-bold hover:bg-charcoal hover:text-white transition text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
