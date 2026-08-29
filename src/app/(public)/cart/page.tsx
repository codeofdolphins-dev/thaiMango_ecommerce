"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  ShoppingBag,
  Truck,
  Sparkles,
  ArrowLeft,
  Trash2,
  ShieldCheck,
  Zap,
  RefreshCw,
  Tag,
  Lock,
  ArrowRight,
  X,
} from "lucide-react";
import { useStore } from "@/components/public/store";
import {
  formatPrice,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
} from "@/lib/site-data";

type PromoMessage = { text: string; type: "success" | "error" };

export default function CartPage() {
  const {
    cart,
    updateQty,
    removeFromCart,
    clearCart,
    subtotal,
    totalItems,
    showToast,
    mounted,
  } = useStore();
  const router = useRouter();

  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<PromoMessage | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");

  const hasItems = mounted && cart.length > 0;

  /* Restore a coupon applied earlier in this session (shared via
     localStorage, mirroring the static site's module-level coupon state
     so it also carries over to the checkout page). */
  useEffect(() => {
    if (!mounted) return;
    try {
      const savedDiscount = parseFloat(
        localStorage.getItem("bm_coupon_discount") || "0"
      );
      const savedCode = localStorage.getItem("bm_coupon_code") || "";
      if (savedDiscount > 0) {
        setCouponDiscount(savedDiscount);
        setCouponCode(savedCode);
      }
    } catch {}
  }, [mounted]);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const percent = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );
  const shippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0
      ? 0
      : STANDARD_SHIPPING;
  const discountAmount = Math.round(subtotal * couponDiscount);
  const total = Math.max(
    0,
    subtotal - discountAmount + (subtotal > 0 ? shippingCost : 0)
  );
  const gstAmount = Math.round(subtotal * 0.18);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === "MANGO15" || code === "WELCOME15" || code === "FIRST15") {
      setCouponDiscount(0.15);
      setCouponCode(code);
      try {
        localStorage.setItem("bm_coupon_discount", "0.15");
        localStorage.setItem("bm_coupon_code", code);
      } catch {}
      setPromoMessage({
        text: "🎉 15% Welcome Privilege discount applied!",
        type: "success",
      });
      showToast("15% discount applied!");
    } else if (code === "MANGO10" || code === "WELCOME10") {
      setCouponDiscount(0.1);
      setCouponCode(code);
      try {
        localStorage.setItem("bm_coupon_discount", "0.10");
        localStorage.setItem("bm_coupon_code", code);
      } catch {}
      setPromoMessage({
        text: "🎉 10% Mango Lovers discount applied!",
        type: "success",
      });
      showToast("10% discount applied!");
    } else {
      setPromoMessage({
        text: "Invalid promo code. Try MANGO15 for 15% off.",
        type: "error",
      });
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm("Are you sure you want to remove all items from your bag?")
    ) {
      clearCart();
      showToast("Bag cleared");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast("Your bag is empty! Add products first.");
      return;
    }
    router.push("/checkout");
  };

  return (
    <main className="flex-1 py-10 md:py-16">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-muted uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-charcoal transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-charcoal transition">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-charcoal font-semibold">Shopping Bag</span>
        </nav>

        {/* Page Title & Item Count */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-cream pb-6 mb-10">
          <div>
            <span className="text-[11px] tracking-[0.25em] uppercase text-accent font-bold mb-1 block">
              Your Mango Selection
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-charcoal">
              Shopping Bag
            </h1>
          </div>
          <p className="text-xs uppercase tracking-widest text-muted">
            <span className="font-bold text-charcoal">
              {mounted ? totalItems : 0}
            </span>{" "}
            Items in Bag
          </p>
        </div>

        {hasItems ? (
          /* Populated Cart View Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Items List & Threshold */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* Free Shipping Progress Tracker */}
              <div className="p-5 md:p-6 rounded-3xl bg-cream/60 border border-cream shadow-sm">
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-charcoal">
                    {remaining === 0 ? (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">
                          Congratulations! You have unlocked{" "}
                          <strong>FREE Express Shipping</strong>!
                        </span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-4 h-4 text-accent" />
                        <span>
                          Add{" "}
                          <strong className="text-accent">
                            {formatPrice(remaining)}
                          </strong>{" "}
                          more to unlock <strong>FREE Express Shipping</strong>!
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-xs font-bold text-accent">
                    {percent}%
                  </span>
                </div>
                <div className="w-full h-2 bg-charcoal/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-500 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Cart Items Table Header (Desktop) */}
              <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-cream text-[10px] tracking-widest uppercase font-semibold text-muted">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {/* Dynamic Item List Container */}
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={`${item.name}-${item.size}-${index}`}
                    className="p-5 md:p-6 rounded-3xl bg-white border border-cream shadow-sm hover:border-[#E5B869]/40 transition group"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover bg-cream shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase tracking-wider text-accent font-bold">
                            Thai Mango
                          </span>
                          <h3 className="font-serif text-base md:text-lg text-charcoal font-semibold line-clamp-1 mt-0.5">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted">
                              {item.size || "Standard 100g"}
                            </span>
                          </div>
                          <button
                            className="text-xs text-muted hover:text-rose-600 font-medium transition flex items-center gap-1 mt-2 md:hidden"
                            onClick={() => removeFromCart(index)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-2 text-left md:text-center">
                        <span className="text-xs text-muted md:hidden font-semibold">
                          Unit Price:{" "}
                        </span>
                        <span className="font-semibold text-charcoal text-sm">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      <div className="col-span-1 md:col-span-2 flex items-center md:justify-center">
                        <div className="flex items-center border border-charcoal/15 bg-ivory rounded-full px-3 py-1 shadow-sm">
                          <button
                            className="px-2 text-sm text-charcoal hover:text-accent font-bold"
                            onClick={() => updateQty(index, "minus")}
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-charcoal px-3">
                            {item.quantity}
                          </span>
                          <button
                            className="px-2 text-sm text-charcoal hover:text-accent font-bold"
                            onClick={() => updateQty(index, "plus")}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end gap-3">
                        <span className="text-xs text-muted md:hidden font-semibold">
                          Total:{" "}
                        </span>
                        <span className="font-serif text-lg md:text-xl text-charcoal font-bold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          className="hidden md:flex p-2 text-muted hover:text-rose-600 transition"
                          title="Remove Item"
                          onClick={() => removeFromCart(index)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Cart Action Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-cream">
                <Link
                  href="/shop"
                  className="text-xs uppercase tracking-widest font-semibold text-charcoal hover:text-accent flex items-center gap-2 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Link>
                <button
                  className="text-xs uppercase tracking-widest font-semibold text-muted hover:text-rose-600 transition flex items-center gap-1.5"
                  onClick={handleClearAll}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Items</span>
                </button>
              </div>

              {/* Trust Guarantee Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
                <div className="p-4 rounded-2xl bg-white border border-cream flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cream/70 text-accent flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                      100% Authentic
                    </h4>
                    <p className="text-[11px] text-muted">
                      Naturally Sun-Dried in Thailand
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-cream flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cream/70 text-accent flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                      Fast Dispatch
                    </h4>
                    <p className="text-[11px] text-muted">Same-Day Processing</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-cream flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cream/70 text-accent flex items-center justify-center shrink-0">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                      Easy Returns
                    </h4>
                    <p className="text-[11px] text-muted">30-Day Guarantee</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-28 space-y-6">
              <div className="p-6 md:p-8 rounded-3xl bg-white border border-cream shadow-lg space-y-6">
                <h3 className="font-serif text-2xl text-charcoal border-b border-cream pb-4">
                  Order Summary
                </h3>

                {/* Coupon Code Input */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-muted mb-2">
                    Promo or Privilege Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="e.g. MANGO15"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-cream uppercase text-xs font-semibold focus:outline-none focus:border-accent bg-ivory/40"
                    />
                    <button
                      className="px-5 py-2.5 bg-charcoal text-white rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-accent transition shadow-sm"
                      onClick={handleApplyPromo}
                    >
                      Apply
                    </button>
                  </div>
                  <p
                    className={`text-[11px] mt-1.5 font-semibold ${
                      promoMessage
                        ? promoMessage.type === "success"
                          ? "text-emerald-600 block"
                          : "text-rose-600 block"
                        : "hidden"
                    }`}
                  >
                    {promoMessage?.text}
                  </p>
                </div>

                {/* Price Calculations */}
                <div className="space-y-3.5 text-sm text-muted pt-2 border-t border-cream">
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
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Privilege Discount</span>
                    </span>
                    <span className="font-bold">
                      -{formatPrice(discountAmount)} ({couponCode || "15%"})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <span>Estimated Shipping</span>
                      <span className="text-[10px] text-muted/60">
                        (Express)
                      </span>
                    </span>
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
                      Total Amount
                    </span>
                    <span className="text-[10px] text-muted">
                      Includes all taxes &amp; fees
                    </span>
                  </div>
                  <span className="font-serif text-3xl text-charcoal font-bold">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Proceed to Checkout CTA */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full py-4 px-8 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all duration-300 shadow-md flex items-center justify-center text-center gap-2.5 group"
                >
                  <span className="inline-flex items-center justify-center gap-2.5 mx-auto">
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform inline-block shrink-0" />
                  </span>
                </button>

                {/* Security & Badges */}
                <div className="pt-2 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted/80 mb-3 flex items-center justify-center gap-1.5">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>Guaranteed Safe &amp; Secure Checkout</span>
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <svg
                      viewBox="0 0 48 32"
                      className="w-9 h-6 rounded shadow-sm"
                      aria-label="Visa"
                    >
                      <rect width="48" height="32" rx="4" fill="#1A1F71" />
                      <text
                        x="24"
                        y="21"
                        textAnchor="middle"
                        fontFamily="Inter, sans-serif"
                        fontStyle="italic"
                        fontWeight="bold"
                        fontSize="12"
                        fill="#ffffff"
                      >
                        VISA
                      </text>
                    </svg>
                    <svg
                      viewBox="0 0 48 32"
                      className="w-9 h-6 rounded shadow-sm"
                      aria-label="Mastercard"
                    >
                      <rect width="48" height="32" rx="4" fill="#F3F3F3" />
                      <circle cx="20" cy="16" r="9" fill="#EB001B" />
                      <circle
                        cx="28"
                        cy="16"
                        r="9"
                        fill="#F79E1B"
                        fillOpacity="0.85"
                      />
                    </svg>
                    <svg
                      viewBox="0 0 48 32"
                      className="w-9 h-6 rounded shadow-sm"
                      aria-label="RuPay"
                    >
                      <rect width="48" height="32" rx="4" fill="#FFFFFF" />
                      <text
                        x="24"
                        y="19"
                        textAnchor="middle"
                        fontFamily="Inter, sans-serif"
                        fontWeight="bold"
                        fontSize="9.5"
                        fill="#0A3577"
                      >
                        Ru<tspan fill="#F58220">Pay</tspan>
                      </text>
                      <rect x="4" y="23" width="40" height="3" rx="1.5" fill="#0AA84F" />
                    </svg>
                    <svg
                      viewBox="0 0 48 32"
                      className="w-9 h-6 rounded shadow-sm"
                      aria-label="UPI"
                    >
                      <rect width="48" height="32" rx="4" fill="#FFFFFF" />
                      <text
                        x="24"
                        y="20"
                        textAnchor="middle"
                        fontFamily="Inter, sans-serif"
                        fontWeight="bold"
                        fontSize="11"
                        fill="#4B2E83"
                      >
                        UPI
                      </text>
                    </svg>
                    <span className="flex items-center gap-1 h-6 px-2 rounded bg-charcoal/5 border border-charcoal/15 text-charcoal text-[8px] font-bold uppercase">
                      COD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="text-center py-20 bg-white rounded-3xl border border-cream shadow-sm max-w-2xl mx-auto p-8">
            <div className="w-20 h-20 rounded-full bg-cream/70 text-charcoal/40 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 stroke-[1.2]" />
            </div>
            <h2 className="font-serif text-3xl text-charcoal mb-3">
              Your Bag is Empty
            </h2>
            <p className="text-sm text-muted max-w-md mx-auto mb-8 leading-relaxed">
              Discover our sun-dried mango flavors — naturally sweet, tangy, and
              spiced snacks to fill your bag.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/shop"
                className="px-8 py-4 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition shadow-md"
              >
                Explore All Products
              </Link>
              <Link
                href="/shop?category=Bestsellers"
                className="px-8 py-4 bg-cream text-charcoal rounded-full text-xs uppercase tracking-widest font-bold hover:bg-charcoal hover:text-white transition"
              >
                View Bestsellers
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
