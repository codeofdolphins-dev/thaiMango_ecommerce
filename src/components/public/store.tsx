"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AuthUser,
  Lang,
  translations,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
} from "@/lib/site-data";
import { THAI_VAT_RATE } from "@/schemas/settings.schema";
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  convertAmount,
  currencySymbol,
  formatMoney,
} from "@/lib/currency";
import type { SettingsResponse } from "@/lib/storeSettings";
import { normalizeImagePath } from "@/lib/images";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface CartItem {
  /** Product slug — lets the order API link the line to a real product. */
  slug?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
}

export interface QuickViewProduct {
  name: string;
  price: string;
  image: string;
  desc: string;
  slug?: string;
}

interface Toast {
  id: number;
  message: string;
  type: "info" | "heart";
  leaving: boolean;
}

interface StoreValue {
  /* language */
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string) => string;
  /* toast */
  showToast: (message: string, type?: "info" | "heart") => void;
  /* cart */
  cart: CartItem[];
  addToCart: (item: {
    slug?: string;
    name: string;
    price: number;
    image: string;
    quantity?: number;
    size?: string;
  }) => void;
  removeFromCart: (index: number) => void;
  updateQty: (index: number, action: "plus" | "minus") => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  /* wishlist — product slugs, not names */
  wishlist: string[];
  toggleWishlist: (slug: string, label?: string) => void;
  isWishlisted: (slug: string) => boolean;
  /* auth */
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  logout: () => void;
  authLoading: boolean;
  /* store settings / currency */
  settings: SettingsResponse | null;
  /** Visitor's display currency. */
  currency: CurrencyCode;
  /** Currency product amounts are stored in. */
  baseCurrency: CurrencyCode;
  /** Multiplier from base → display currency. */
  displayRate: number;
  currencySymbol: string;
  formatPrice: (amount: number) => string;
  freeShippingThreshold: number;
  standardShipping: number;
  /** VAT as a fraction, e.g. 0.07 */
  taxRate: number;
  /* ui */
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  menuOpen: boolean;
  openMenu: (origin?: { x: number; y: number }) => void;
  closeMenu: () => void;
  menuOrigin: { x: number; y: number } | null;
  quickView: QuickViewProduct | null;
  openQuickView: (p: QuickViewProduct) => void;
  closeQuickView: () => void;
  mounted: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

/* legacy image paths saved by the static site used relative "images/…" */
const normalizeImg = normalizeImagePath;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuOrigin, setMenuOrigin] = useState<{ x: number; y: number } | null>(
    null
  );
  const [quickView, setQuickView] = useState<QuickViewProduct | null>(null);
  const [mounted, setMounted] = useState(false);
  const toastId = useRef(0);

  /* hydrate persisted state after mount (avoids SSR mismatch) */
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("bm_cart");
      const parsed = savedCart ? (JSON.parse(savedCart) as CartItem[]) : null;
      if (parsed && Array.isArray(parsed)) {
        setCart(parsed.map((i) => ({ ...i, image: normalizeImg(i.image) })));
      }
    } catch {}
    try {
      const savedWish = localStorage.getItem("bm_wishlist");
      if (savedWish) {
        const saved = JSON.parse(savedWish);
        if (Array.isArray(saved)) {
          setWishlist(saved.filter((s): s is string => typeof s === "string"));
        }
      }
    } catch {}
    const savedLang = localStorage.getItem("preferred_language");
    if (savedLang === "th" || savedLang === "en") setLangState(savedLang);
    setMounted(true);
  }, []);

  /* store settings drive the displayed currency (and later shipping rules) */
  const settingsQuery = useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) return null;
      const body = await res.json();
      return body.data as SettingsResponse;
    },
    staleTime: 5 * 60 * 1000,
  });

  const settings = settingsQuery.data ?? null;
  /* Visitor-resolved display currency (IN → ₹, TH → ฿, else the admin's
     display currency or $) and the base → display FX rate that price values —
     stored in the base currency — are multiplied by before formatting. */
  const currency: CurrencyCode = settings?.visitor_currency ?? DEFAULT_CURRENCY;
  const displayRate = settings?.display_rate ?? 1;
  const baseCurrency: CurrencyCode = settings?.base_currency ?? DEFAULT_CURRENCY;
  const formatPrice = useCallback(
    (amount: number) =>
      formatMoney(convertAmount(amount, displayRate, currency), currency),
    [currency, displayRate]
  );
  /* Shipping/tax amounts come from admin settings; static constants are only
     the pre-fetch fallback. */
  const freeShippingThreshold =
    settings?.free_shipping_above ?? FREE_SHIPPING_THRESHOLD;
  const standardShipping = settings?.standard_shipping ?? STANDARD_SHIPPING;
  const taxRate = (settings?.gst_rate ?? THAI_VAT_RATE) / 100;

  /* hydrate the real session from the httpOnly cookie via the API */
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) return null;
      const body = await res.json();
      return body.data as {
        id: string;
        name: string;
        email: string;
        phone: string;
        flavor_preference: string[];
        created_at: string;
      };
    },
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (meQuery.isPending) return;
    const u = meQuery.data;
    if (u) {
      const [firstName, ...rest] = u.name.split(" ");
      setUserState({
        isLoggedIn: true,
        id: u.id,
        firstName,
        lastName: rest.join(" "),
        name: u.name,
        email: u.email,
        phone: u.phone,
        skinType: u.flavor_preference?.[0],
        memberSince: new Date(u.created_at).getFullYear().toString(),
      });
    }
    setAuthLoading(false);
  }, [meQuery.isPending, meQuery.data]);

  /* The wishlist used to hold product names; it now holds slugs. Convert any
     legacy entry once, on the first mount that sees one, and drop names that
     no longer match a product. */
  useEffect(() => {
    if (!mounted) return;
    const legacy = wishlist.filter((entry) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry));
    if (legacy.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/products?limit=100");
        if (!res.ok) return;
        const body = await res.json();
        const bySlug = new Map<string, string>(
          (body.data?.products ?? []).map(
            (p: { slug: string; name_en: string }) => [p.name_en, p.slug]
          )
        );
        if (cancelled) return;
        setWishlist((prev) =>
          Array.from(
            new Set(
              prev
                .map((entry) =>
                  /^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry)
                    ? entry
                    : bySlug.get(entry)
                )
                .filter((s): s is string => Boolean(s))
            )
          )
        );
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [mounted, wishlist]);

  /* persist */
  useEffect(() => {
    if (mounted) localStorage.setItem("bm_cart", JSON.stringify(cart));
  }, [cart, mounted]);
  useEffect(() => {
    if (mounted) localStorage.setItem("bm_wishlist", JSON.stringify(wishlist));
  }, [wishlist, mounted]);

  /* lock body scroll while any overlay is open */
  useEffect(() => {
    const anyOpen = cartOpen || searchOpen || menuOpen || quickView !== null;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, searchOpen, menuOpen, quickView]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("preferred_language", l);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) =>
      translations[lang][key] ?? translations.en[key] ?? fallback ?? key,
    [lang]
  );

  const showToast = useCallback(
    (message: string, type: "info" | "heart" = "info") => {
      const id = ++toastId.current;
      setToasts((prev) => [...prev, { id, message, type, leaving: false }]);
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((tst) => (tst.id === id ? { ...tst, leaving: true } : tst))
        );
      }, 2800);
      setTimeout(() => {
        setToasts((prev) => prev.filter((tst) => tst.id !== id));
      }, 3200);
    },
    []
  );

  /* cart operations */
  const addToCart = useCallback(
    (item: {
      slug?: string;
      name: string;
      price: number;
      image: string;
      quantity?: number;
      size?: string;
    }) => {
      const qty = item.quantity ?? 1;
      const size = item.size ?? "Standard 100g";
      setCart((prev) => {
        const existing = prev.findIndex(
          (i) => i.name === item.name && i.size === size
        );
        if (existing !== -1) {
          return prev.map((i, idx) =>
            idx === existing ? { ...i, quantity: i.quantity + qty } : i
          );
        }
        return [
          ...prev,
          {
            slug: item.slug,
            name: item.name,
            price: item.price,
            image: normalizeImg(item.image),
            quantity: qty,
            size,
          },
        ];
      });
      setQuickView(null);
      /* Feedback is the toast alone — auto-opening the drawer on every add
         interrupts browsing; the header cart icon is there when they're ready. */
      showToast(`${item.name} added to your bag!`);
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    (index: number) => {
      setCart((prev) => {
        const removed = prev[index]?.name || "Item";
        showToast(`Removed ${removed} from bag`);
        return prev.filter((_, i) => i !== index);
      });
    },
    [showToast]
  );

  const updateQty = useCallback((index: number, action: "plus" | "minus") => {
    setCart((prev) =>
      prev
        .map((item, i) => {
          if (i !== index) return item;
          if (action === "plus") return { ...item, quantity: item.quantity + 1 };
          return { ...item, quantity: item.quantity - 1 };
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  /* wishlist — keyed by product slug so saved items can be looked up in the
     catalog. `label` is only ever used for the toast. */
  const toggleWishlist = useCallback(
    (slug: string, label?: string) => {
      const name = label ?? slug;
      setWishlist((prev) => {
        if (prev.includes(slug)) {
          showToast(`Removed ${name} from Wishlist`);
          return prev.filter((s) => s !== slug);
        }
        showToast(`Added ${name} to Wishlist`, "heart");
        return [...prev, slug];
      });
    },
    [showToast]
  );

  const isWishlisted = useCallback(
    (slug: string) => wishlist.includes(slug),
    [wishlist]
  );

  /* auth */
  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {}
    setUserState(null);
    showToast("Signed out of your account");
    setTimeout(() => {
      window.location.href = "/login";
    }, 500);
  }, [showToast]);

  /* ui */
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openMenu = useCallback((origin?: { x: number; y: number }) => {
    if (origin) setMenuOrigin(origin);
    setMenuOpen(true);
  }, []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openQuickView = useCallback(
    (p: QuickViewProduct) => setQuickView({ ...p, image: normalizeImg(p.image) }),
    []
  );
  const closeQuickView = useCallback(() => setQuickView(null), []);

  /* Escape closes everything (port of the global key listener) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCartOpen(false);
        setSearchOpen(false);
        setMenuOpen(false);
        setQuickView(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        lang,
        setLang,
        t,
        showToast,
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        subtotal,
        totalItems,
        wishlist,
        toggleWishlist,
        isWishlisted,
        user,
        setUser,
        logout,
        authLoading,
        settings,
        currency,
        baseCurrency,
        displayRate,
        currencySymbol: currencySymbol(currency),
        formatPrice,
        freeShippingThreshold,
        standardShipping,
        taxRate,
        cartOpen,
        openCart,
        closeCart,
        searchOpen,
        openSearch,
        closeSearch,
        menuOpen,
        openMenu,
        closeMenu,
        menuOrigin,
        quickView,
        openQuickView,
        closeQuickView,
        mounted,
      }}
    >
      {children}
      {/* Toast stack */}
      <div
        id="toast-stack"
        /* Positioned by the #toast-stack rule in globals.css (bottom-left,
           clear of the drawer CTA / chat launcher / mobile nav) — keep the
           layout in one place. */
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </StoreContext.Provider>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const visible = entered && !toast.leaving;
  return (
    <div
      className={`bg-[#241016] text-[#FBF4E8] text-xs md:text-sm font-medium px-5 py-3 rounded-full shadow-2xl pointer-events-auto border border-[#E5B869]/30 transition-all duration-300 transform flex items-center gap-2.5 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {toast.type === "heart" ? (
              <svg
                className="w-4 h-4 text-rose-400 shrink-0 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-[#E5B869] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
      <span>{toast.message}</span>
    </div>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
