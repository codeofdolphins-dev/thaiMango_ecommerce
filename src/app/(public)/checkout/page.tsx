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
  Banknote,
} from "lucide-react";
import Select from "react-select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  GooglePayIcon,
  PaytmIcon,
  PhonePeIcon,
  RazorpayIcon,
  StripeIcon,
} from "@/components/public/BrandIcons";
import PhoneField from "@/components/common/PhoneField";
import {
  publicSelectStyles,
  type PublicSelectOption,
} from "@/components/public/selectStyles";
import { useStore } from "@/components/public/store";
import { DEFAULT_SETTINGS } from "@/schemas/settings.schema";
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
} from "@/lib/site-data";

import StripeCardForm, {
  type CardPayFn,
} from "@/components/public/StripeCardForm";
import CheckoutAddressBook, {
  isAddressComplete,
  type CheckoutAddress,
  type SavedAddress,
} from "@/components/public/CheckoutAddressBook";

type ShippingMethod = "standard" | "priority";
type PaymentMethod = "cod" | "razorpay" | "stripe";

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

/* Tabs are the payment gateway, not the instrument: Razorpay's own window
   covers UPI / cards / net banking, Stripe handles cards inline. */
interface PaymentTab {
  id: PaymentMethod;
  label: string;
  hint: string;
  Icon: React.ComponentType<{ className?: string }>;
  /* Razorpay settles domestic INR payments, so it is offered in India only. */
  indiaOnly?: boolean;
}

const PAYMENT_TABS: PaymentTab[] = [
  { id: "cod", label: "Cash / COD", hint: "Pay on delivery", Icon: Banknote },
  {
    id: "razorpay",
    label: "Razorpay",
    hint: "UPI, cards & net banking",
    Icon: RazorpayIcon,
    indiaOnly: true,
  },
  { id: "stripe", label: "Stripe", hint: "International cards", Icon: StripeIcon },
];

const COUNTRIES = ["India", "United States", "Thailand", "Singapore", "United Kingdom"];

const countrySelectStyles = publicSelectStyles<PublicSelectOption>();

export default function CheckoutPage() {
  const {
    cart,
    subtotal,
    user,
    clearCart,
    showToast,
    mounted,
    formatPrice,
    currency,
    displayRate,
    settings,
  } = useStore();

  const cartItems = useMemo(() => (mounted ? cart : []), [mounted, cart]);
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  /* Signed-in shoppers pick from their saved address book; guests fill the
     form in place, since there is no account to save it against. */
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [guestAddress, setGuestAddress] = useState<CheckoutAddress>({
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(
    "standard"
  );
  const [country, setCountry] = useState("India");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("cod");

  const isIndia = country === "India";
  /* Admin Settings decide which gateways exist at all; the country then decides
     whether the India-only ones apply. */
  const codEnabled = settings?.cod_enabled ?? true;
  const upiEnabled = settings?.upi_enabled ?? true;
  const intlShipping = settings?.intl_shipping ?? false;
  /* A gateway is offered only when it is enabled *and* has keys saved —
     the *_ready fields are resolved server-side. */
  const razorpayReady = settings?.razorpay_ready ?? false;
  const stripeReady = settings?.stripe_ready ?? false;

  const countryOptions = useMemo(
    () => (intlShipping ? COUNTRIES : ["India"]),
    [intlShipping]
  );
  const countrySelectOptions = useMemo<PublicSelectOption[]>(
    () => countryOptions.map((c) => ({ value: c, label: c })),
    [countryOptions]
  );

  /* Turning international shipping off strands anyone who picked another
     country — pull them back to India. */
  useEffect(() => {
    if (!countryOptions.includes(country)) setCountry("India");
  }, [countryOptions, country]);

  const availableTabs = useMemo(
    () =>
      PAYMENT_TABS.filter((tab) => {
        if (tab.indiaOnly && !isIndia) return false;
        if (tab.id === "cod" && !codEnabled) return false;
        /* A gateway needs both its Settings toggle and saved keys. */
        if (tab.id === "razorpay" && !(upiEnabled && razorpayReady)) return false;
        if (tab.id === "stripe" && !stripeReady) return false;
        return true;
      }),
    [isIndia, codEnabled, upiEnabled, razorpayReady, stripeReady]
  );

  /* Whenever the offered set changes, make sure the selection still points at
     something that is actually available. */
  useEffect(() => {
    if (availableTabs.length === 0) return;
    if (!availableTabs.some((tab) => tab.id === selectedPayment)) {
      setSelectedPayment(availableTabs[0].id);
    }
  }, [availableTabs, selectedPayment]);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState("");

  /* Prefill contact/address fields from an existing session, without
     overwriting anything the shopper has already typed. */
  useEffect(() => {
    if (mounted && user?.isLoggedIn) {
      setEmail((v) => v || user.email || "");
      /* Never invent a number — an unset phone must stay empty so the shopper
         fills in one the courier can actually call. */
      setPhone((v) => v || user.phone || "");
      setFirstName((v) => v || user.firstName || "");
      setLastName((v) => v || user.lastName || "");
    }
  }, [mounted, user]);

  /* Pick up a coupon applied on the cart page (the CODE is shared via
     localStorage) and re-validate it against the API — the displayed discount
     always comes from the Coupon table, so it matches what the server will
     charge. A code that no longer passes is dropped before payment starts. */
  useEffect(() => {
    if (!mounted) return;
    let savedCode = "";
    try {
      savedCode = localStorage.getItem("bm_coupon_code") || "";
    } catch {}
    if (!savedCode) return;
    axios
      .post("/api/coupons/validate", { code: savedCode })
      .then((res) => {
        setCouponCode(res.data.data.code);
        setCouponDiscount(res.data.data.discount_pct / 100);
      })
      .catch(() => {
        setCouponCode("");
        setCouponDiscount(0);
        try {
          localStorage.removeItem("bm_coupon_code");
          localStorage.removeItem("bm_coupon_discount");
        } catch {}
      });
  }, [mounted]);

  /* A coupon is spent with the order it discounted — don't carry it over. */
  const clearAppliedCoupon = useCallback(() => {
    setCouponCode("");
    setCouponDiscount(0);
    try {
      localStorage.removeItem("bm_coupon_code");
      localStorage.removeItem("bm_coupon_discount");
    } catch {}
  }, []);

  useEffect(() => {
    document.body.style.overflow = showSuccessModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSuccessModal]);

  /* Shipping thresholds and VAT come from admin Settings, falling back to the
     site defaults until the settings request resolves. */
  const freeShippingAbove =
    settings?.free_shipping_above ?? FREE_SHIPPING_THRESHOLD;
  const standardShipping = settings?.standard_shipping ?? STANDARD_SHIPPING;
  const priorityShipping = settings?.priority_shipping ?? 199;
  const vatRatePct = settings?.gst_rate ?? 0;
  const vatRate = vatRatePct / 100;

  const standardCost = subtotal >= freeShippingAbove ? 0 : standardShipping;
  const shippingCost =
    shippingMethod === "priority" ? priorityShipping : standardCost;
  const discountAmount = Math.round(subtotal * couponDiscount);
  const total = Math.max(
    0,
    subtotal - discountAmount + (subtotal > 0 ? shippingCost : 0)
  );
  const gstAmount = Math.round(subtotal * vatRate);

  const cardPayRef = useRef<CardPayFn | null>(null);
  const registerCardPay = useCallback((fn: CardPayFn | null) => {
    cardPayRef.current = fn;
  }, []);

  const customerName = `${firstName} ${lastName}`.trim();

  const isSignedIn = Boolean(mounted && user?.isLoggedIn);

  /* The address book already holds this list under ["my-addresses"]; querying
     the same key here shares that cache entry instead of refetching. */
  const savedAddressesQuery = useQuery({
    queryKey: ["my-addresses"],
    enabled: isSignedIn,
    queryFn: async (): Promise<SavedAddress[]> => {
      const res = await axios.get("/api/addresses");
      return res.data.data;
    },
  });

  /* Null until step 2 is answered: a picked saved address wins, otherwise a
     fully filled form (the guest form, or a signed-in shopper's add-new panel)
     counts immediately — no separate "save the address first" step. */
  const shippingAddress: CheckoutAddress | null = useMemo(() => {
    const saved = isSignedIn
      ? savedAddressesQuery.data?.find((a) => a.id === selectedAddressId)
      : undefined;
    if (saved) return saved;
    return isAddressComplete(guestAddress) ? guestAddress : null;
  }, [isSignedIn, guestAddress, savedAddressesQuery.data, selectedAddressId]);

  /* Every payment path funnels through here, so an order can never be placed
     without a delivery address. */
  const blockingIssue = useCallback((): string | null => {
    if (cartItems.length === 0) return "Your bag is empty.";
    if (!shippingAddress) return "Add a shipping address to continue.";
    /* Persisted orders need a number the courier can call; it's prefilled
       from the profile, so this only fires when that is empty too. */
    if (isSignedIn && !phone.trim()) return "Add a contact number for the courier.";
    return null;
  }, [cartItems.length, shippingAddress, isSignedIn, phone]);

  const buildPayload = useCallback(
    () => ({
      items: cartItems.map((item) => ({
        slug: item.slug,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
      })),
      shippingMethod,
      couponCode: couponCode || undefined,
      customer: {
        name: customerName || undefined,
        email: email || undefined,
        phone: phone || undefined,
      },
    }),
    [cartItems, shippingMethod, couponCode, customerName, email, phone]
  );

  /* Persist the order, then show the confirmation. The order number the API
     assigns is the reference the shopper sees, so it matches My Orders. */
  const completeCheckout = useCallback(
    async (paymentRef?: string) => {
      if (!shippingAddress) {
        showToast("Add a shipping address to continue.");
        setIsSubmitting(false);
        return;
      }

      /* Guests keep the original flow: confirmation without a saved record,
         since there is no account for the order to live under. */
      if (!isSignedIn) {
        const reference =
          paymentRef ??
          `#TM-${new Date().getFullYear()}-${Math.floor(
            10000 + Math.random() * 90000
          )}`;
        setOrderId(reference);
        clearCart();
        clearAppliedCoupon();
        setShowSuccessModal(true);
        showToast(`Order Placed! Reference: ${reference}`);
        setIsSubmitting(false);
        return;
      }

      try {
        const res = await axios.post("/api/orders", {
          ...buildPayload(),
          payment: selectedPayment === "cod" ? "COD" : "PREPAID",
          paymentRef,
          shipping: {
            name: customerName,
            phone,
            line1: shippingAddress.line1,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            country,
          },
        });
        const order = res.data.data;
        const reference = `#TM-${String(order.order_no).padStart(5, "0")}`;
        setOrderId(reference);
        clearCart();
        clearAppliedCoupon();
        /* My Orders is now stale — drop it so the new order shows up. */
        queryClient.invalidateQueries({ queryKey: ["my-orders"] });
        setShowSuccessModal(true);
        showToast(`Order Placed! Reference: ${reference}`);

        /* The order shipped to a typed-in address that isn't in the book yet —
           keep it for next time. Best-effort: the order already succeeded. */
        if (selectedAddressId === null) {
          axios
            .post("/api/addresses", {
              line1: shippingAddress.line1,
              city: shippingAddress.city,
              state: shippingAddress.state,
              pincode: shippingAddress.pincode,
            })
            .then(() =>
              queryClient.invalidateQueries({ queryKey: ["my-addresses"] })
            )
            .catch(() => {});
        }
      } catch (error) {
        /* The payment may already have gone through, so never imply it didn't. */
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : null;
        showToast(
          paymentRef
            ? "Payment succeeded but saving the order failed — contact support with reference " +
              paymentRef
            : message || "Could not place the order. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      shippingAddress,
      isSignedIn,
      selectedAddressId,
      buildPayload,
      selectedPayment,
      customerName,
      phone,
      country,
      clearCart,
      clearAppliedCoupon,
      showToast,
      queryClient,
    ]
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

      let data: {
        data?: { orderId: string; amount: number; currency: string; keyId: string };
        message?: string;
      } | null = null;
      try {
        const res = await axios.post(
          "/api/payments/razorpay/order",
          buildPayload()
        );
        data = res.data ?? null;
      } catch (error) {
        /* A non-2xx reply still carries the API's message; anything without a
           response (network failure) belongs to the outer catch. */
        if (!axios.isAxiosError(error) || !error.response) throw error;
        data = (error.response.data as typeof data) ?? null;
      }
      if (!data?.data?.orderId) {
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
        name: "Bangkok Mango",
        description: "Sun-dried mango order",
        prefill: {
          name: customerName || undefined,
          email: email || undefined,
          contact: phone || undefined,
        },
        theme: { color: "#7A1233" },
        handler: async (response) => {
          try {
            await axios.post("/api/payments/razorpay/verify", response);
            completeCheckout(response.razorpay_payment_id);
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
    const issue = blockingIssue();
    if (issue) {
      showToast(issue);
      return;
    }
    showToast(`Opening Razorpay for ${provider}...`);
    void payWithRazorpay();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const issue = blockingIssue();
    if (issue) {
      showToast(issue);
      return;
    }

    if (selectedPayment === "cod") {
      setIsSubmitting(true);
      setTimeout(() => completeCheckout(), 800);
      return;
    }

    if (selectedPayment === "stripe") {
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

    /* Razorpay Checkout covers UPI, cards and net banking in its own window. */
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
              {/* Quick Express Checkout — UPI via Razorpay: India only, and
                  only while UPI payments are enabled in admin Settings. */}
              <div
                className={`p-6 rounded-3xl bg-white border border-cream shadow-sm ${
                  settings && isIndia && upiEnabled ? "" : "hidden"
                }`}
              >
                <span className="text-[10px] uppercase tracking-widest text-muted font-bold block text-center mb-3">
                  Express 1-Click Checkout
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Each provider carries its own brand mark and wordmark
                      colour on a neutral tile, per their brand guidelines. */}
                  <button
                    type="button"
                    onClick={() => handleExpressPay("Google Pay")}
                    className="group py-3.5 px-4 rounded-2xl bg-linear-to-b from-white to-[#f7f5f2] border border-charcoal/10 flex items-center justify-center gap-2.5 shadow-[0_1px_2px_rgba(22,22,22,0.05)] hover:shadow-[0_6px_18px_rgba(22,22,22,0.10)] hover:border-charcoal/20 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <GooglePayIcon className="w-4.5 h-4.5 shrink-0" />
                    <span className="text-sm font-semibold tracking-tight text-[#3c4043]">
                      Pay
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExpressPay("PhonePe / UPI")}
                    className="group py-3.5 px-4 rounded-2xl bg-linear-to-b from-white to-[#f7f5f2] border border-charcoal/10 flex items-center justify-center gap-2.5 shadow-[0_1px_2px_rgba(22,22,22,0.05)] hover:shadow-[0_6px_18px_rgba(95,37,159,0.18)] hover:border-[#5f259f]/30 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <PhonePeIcon className="w-4.5 h-4.5 shrink-0" />
                    <span className="text-sm font-semibold tracking-tight text-[#5f259f]">
                      PhonePe
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExpressPay("Paytm")}
                    className="group py-3.5 px-4 rounded-2xl bg-linear-to-b from-white to-[#f7f5f2] border border-charcoal/10 flex items-center justify-center gap-2.5 shadow-[0_1px_2px_rgba(22,22,22,0.05)] hover:shadow-[0_6px_18px_rgba(0,186,242,0.20)] hover:border-[#00baf2]/40 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <PaytmIcon className="w-4.5 h-4.5 shrink-0" />
                    <span className="text-sm font-semibold tracking-tight">
                      <span className="text-[#002970]">Pay</span>
                      <span className="text-[#00baf2]">tm</span>
                    </span>
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
                      <PhoneField
                        id="co-phone"
                        required
                        value={phone}
                        onChange={setPhone}
                        inputClassName="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/40 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
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

                    <CheckoutAddressBook
                      isLoggedIn={Boolean(mounted && user?.isLoggedIn)}
                      recipientName={`${firstName} ${lastName}`.trim()}
                      recipientPhone={phone}
                      selectedAddressId={selectedAddressId}
                      onSelectAddress={setSelectedAddressId}
                      draftAddress={guestAddress}
                      onDraftAddressChange={setGuestAddress}
                    />

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                        Country
                      </label>
                      <Select<PublicSelectOption>
                        instanceId="co-country"
                        options={countrySelectOptions}
                        value={
                          countrySelectOptions.find((o) => o.value === country) ??
                          null
                        }
                        onChange={(opt) => setCountry(opt?.value ?? "India")}
                        isSearchable={countrySelectOptions.length > 6}
                        isDisabled={countrySelectOptions.length === 1}
                        styles={countrySelectStyles}
                        menuPortalTarget={
                          typeof document !== "undefined" ? document.body : undefined
                        }
                        aria-label="Shipping country"
                      />
                      {!intlShipping && (
                        <p className="text-[11px] text-muted mt-1.5">
                          We currently ship within India only.
                        </p>
                      )}
                      {intlShipping && !isIndia && (
                        <p className="text-[11px] text-muted mt-1.5">
                          Razorpay settles domestic Indian payments only — pay by
                          card via Stripe for this destination.
                        </p>
                      )}
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
                            Complimentary on orders above{" "}
                            {formatPrice(freeShippingAbove)}, packed fresh for
                            shipping.
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
                        {formatPrice(priorityShipping)}
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
                  {availableTabs.length === 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6">
                      <p className="text-xs font-semibold text-amber-900 mb-1">
                        No payment method is available
                      </p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Every payment option has been switched off for this
                        destination. Please contact us to complete your order.
                      </p>
                    </div>
                  )}
                  <div
                    className={`grid grid-cols-1 gap-2 mb-6 ${
                      availableTabs.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
                    }`}
                  >
                    {availableTabs.map(({ id, label, hint, Icon }) => {
                      const active = selectedPayment === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setSelectedPayment(id)}
                          className={`pay-tab-btn flex items-center gap-3 py-3 px-4 rounded-2xl border text-left transition ${
                            active
                              ? "active border-charcoal bg-charcoal text-white"
                              : "border-cream bg-ivory/50 text-charcoal hover:border-accent"
                          }`}
                        >
                          <Icon className="w-6 h-6 shrink-0" />
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold truncate">
                              {label}
                            </span>
                            <span
                              className={`block text-[10px] truncate ${
                                active ? "text-white/70" : "text-muted"
                              }`}
                            >
                              {hint}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Razorpay Tab Content */}
                  <div
                    className={`pay-tab-content space-y-4 ${
                      selectedPayment === "razorpay" ? "" : "hidden"
                    }`}
                  >
                    <div className="p-4 rounded-2xl bg-cream/40 border border-cream">
                      <p className="text-xs font-semibold text-charcoal mb-1">
                        UPI, Cards &amp; Net Banking via Razorpay
                      </p>
                      <p className="text-[11px] text-muted leading-relaxed">
                        Google Pay, PhonePe, Paytm, BHIM, any UPI ID / QR scan,
                        debit &amp; credit cards, plus HDFC, ICICI, SBI, Axis,
                        Kotak and all major Indian banks. Clicking Complete
                        Order opens the secure Razorpay window where you choose
                        how to pay.
                      </p>
                    </div>
                  </div>

                  {/* Stripe Tab Content */}
                  <div
                    className={`pay-tab-content space-y-4 ${
                      selectedPayment === "stripe" ? "" : "hidden"
                    }`}
                  >
                    {selectedPayment === "stripe" && (
                      <StripeCardForm
                        amountPaise={Math.round(total * displayRate * 100)}
                        buildPayload={buildPayload}
                        registerPay={registerCardPay}
                      />
                    )}
                    <p className="text-[11px] text-muted">
                      International cards processed securely by Stripe — details
                      never touch our servers.
                    </p>
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
                            <h4 className="font-semibold text-charcoal truncate max-w-37.5 sm:max-w-45">
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
                    <span>VAT ({vatRatePct}% included)</span>
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
                    <span>
                      Customer Support:{" "}
                      {settings?.support_email || DEFAULT_SETTINGS.support_email}
                    </span>
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
