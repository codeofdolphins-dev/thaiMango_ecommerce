"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/site-data";
import { useStore } from "./store";

export default function CartDrawer() {
  const {
    t,
    cart,
    subtotal,
    cartOpen,
    closeCart,
    removeFromCart,
    updateQty,
    showToast,
  } = useStore();
  const router = useRouter();

  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100
  );

  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast("Your bag is empty! Add products first.");
      return;
    }
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      <div
        id="cart-overlay"
        className={`fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          cartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />
      {/* Drawer */}
      <div
        id="cart-drawer"
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-ivory z-50 transition-transform duration-500 ease-in-out shadow-2xl flex flex-col ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 md:p-8 border-b border-cream flex justify-between items-center bg-ivory relative z-10">
          <h3 className="font-serif text-3xl">{t("your_bag")}</h3>
          <button
            id="close-cart"
            className="p-2 text-muted hover:text-charcoal transition"
            aria-label="Close cart"
            onClick={closeCart}
          >
            <X className="w-6 h-6 font-light" />
          </button>
        </div>
        <div
          id="cart-items"
          className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar bg-ivory relative z-0"
        >
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center text-muted mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h4 className="font-serif text-2xl text-charcoal mb-2">
                Your Bag is Empty
              </h4>
              <p className="text-xs text-muted max-w-xs mb-6">
                Discover our sun-dried Thai mango flavors, from classic to chili
                lime.
              </p>
              <Link
                href="/shop"
                className="px-6 py-3 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-accent transition"
                onClick={closeCart}
              >
                Explore Shop
              </Link>
            </div>
          ) : (
            <>
              {/* Free Shipping Progress Bar */}
              <div className="mb-6 p-4 rounded-2xl bg-cream/70 border border-cream text-xs">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-charcoal">
                    {remainingForFree === 0 ? (
                      <>
                        🎉 You have qualified for{" "}
                        <strong>FREE Express Delivery</strong>!
                      </>
                    ) : (
                      <>
                        Add{" "}
                        <span className="text-accent font-bold">
                          {formatPrice(remainingForFree)}
                        </span>{" "}
                        more for Free Delivery!
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-muted font-bold">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Item rows */}
              {cart.map((item, index) => (
                <div
                  key={`${item.name}-${item.size}-${index}`}
                  className="flex gap-4 p-3 rounded-2xl bg-white border border-cream shadow-sm mb-3 group hover:border-[#E5B869]/40 transition"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-cream shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="text-xs font-semibold text-charcoal leading-snug line-clamp-2">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-accent">
                          {formatPrice(item.price)}
                        </span>
                        {item.size ? (
                          <span className="text-[10px] text-muted bg-cream px-2 py-0.5 rounded-md font-medium">
                            {item.size}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-cream/50">
                      <div className="flex items-center border border-charcoal/10 bg-cream/30 rounded-full px-2 py-0.5">
                        <button
                          className="px-2 text-xs text-charcoal hover:text-accent font-bold"
                          onClick={() => updateQty(index, "minus")}
                        >
                          -
                        </button>
                        <span className="text-xs px-2 font-semibold text-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          className="px-2 text-xs text-charcoal hover:text-accent font-bold"
                          onClick={() => updateQty(index, "plus")}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-[11px] text-muted hover:text-rose-600 transition font-medium flex items-center gap-1"
                        onClick={() => removeFromCart(index)}
                      >
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="p-6 md:p-8 border-t border-cream bg-cream relative z-10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
              {t("subtotal")}
            </span>
            <span id="cart-subtotal" className="font-serif text-2xl">
              {formatPrice(subtotal)}
            </span>
          </div>
          <p className="text-[10px] text-muted mb-6 text-center uppercase tracking-widest">
            {t("shipping_calc")}
          </p>
          <button
            className="w-full py-4 bg-charcoal text-ivory text-xs tracking-widest uppercase hover:bg-accent transition duration-300"
            onClick={handleCheckout}
          >
            {t("checkout")}
          </button>
        </div>
      </div>
    </>
  );
}
