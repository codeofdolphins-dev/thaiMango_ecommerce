"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AuthUser,
  Lang,
  translations,
} from "@/lib/site-data";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface CartItem {
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
  /* wishlist */
  wishlist: string[];
  toggleWishlist: (name: string) => void;
  isWishlisted: (name: string) => boolean;
  /* auth */
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  logout: () => void;
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

/* The original app.js seeds the bag with one demo item on first visit */
const DEFAULT_CART: CartItem[] = [
  {
    name: "Thai Mango Beetroot Fusion Chews",
    price: 410,
    image: "/images/bangkok-mango-beetroot-1.png",
    quantity: 1,
    size: "100g",
  },
];

/* legacy image paths saved by the static site used relative "images/…" */
const normalizeImg = (src: string) =>
  src && !src.startsWith("/") && !src.startsWith("http") ? `/${src}` : src;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUserState] = useState<AuthUser | null>(null);
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
      setCart(
        parsed && Array.isArray(parsed)
          ? parsed.map((i) => ({ ...i, image: normalizeImg(i.image) }))
          : DEFAULT_CART
      );
    } catch {
      setCart(DEFAULT_CART);
    }
    try {
      const savedWish = localStorage.getItem("bm_wishlist");
      if (savedWish) setWishlist(JSON.parse(savedWish));
    } catch {}
    try {
      const session = localStorage.getItem("thaimango_auth_session");
      if (session) setUserState(JSON.parse(session));
    } catch {}
    const savedLang = localStorage.getItem("preferred_language");
    if (savedLang === "th" || savedLang === "en") setLangState(savedLang);
    setMounted(true);
  }, []);

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
            name: item.name,
            price: item.price,
            image: normalizeImg(item.image),
            quantity: qty,
            size,
          },
        ];
      });
      setQuickView(null);
      showToast(`${item.name} added to your bag!`);
      setCartOpen(true);
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

  /* wishlist */
  const toggleWishlist = useCallback(
    (name: string) => {
      setWishlist((prev) => {
        if (prev.includes(name)) {
          showToast(`Removed ${name} from Wishlist`);
          return prev.filter((n) => n !== name);
        }
        showToast(`Added ${name} to Wishlist`, "heart");
        return [...prev, name];
      });
    },
    [showToast]
  );

  const isWishlisted = useCallback(
    (name: string) => wishlist.includes(name),
    [wishlist]
  );

  /* auth */
  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem("thaimango_auth_session", JSON.stringify(u));
    } else {
      localStorage.removeItem("thaimango_auth_session");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("thaimango_auth_session");
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
        className="fixed bottom-20 md:bottom-8 right-6 z-[9999] flex flex-col gap-2 pointer-events-none"
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
