"use client";

import Link from "next/link";
import { Menu, ShoppingBag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "./store";

/**
 * Two header variants ported from the static site:
 *  - "hero"  (index.html): transparent, absolute below the announcement bar,
 *    turns into a fixed maroon bar after scrolling 40px.
 *  - "solid" (every other page): sticky maroon bar that darkens after 10px.
 */
export default function SiteHeader({ variant }: { variant: "hero" | "solid" }) {
  const { t, lang, setLang, showToast, openCart, openMenu, totalItems, user, mounted } =
    useStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const threshold = variant === "hero" ? 40 : 10;
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const headerClass =
    variant === "hero"
      ? `header-transparent w-full z-40 transition-all duration-500 text-ivory ${
          scrolled
            ? "fixed top-0 bg-[#52091E]/95 backdrop-blur-md shadow-md py-4"
            : "absolute top-[40px] bg-transparent py-6"
        }`
      : `sticky top-0 w-full z-40 py-4 text-ivory transition-all duration-300 ${
          scrolled ? "bg-[#400717] shadow-lg" : "bg-[#52091E] shadow-md"
        }`;

  const loggedIn = mounted && user?.isLoggedIn;
  const accountHref = loggedIn ? "/dashboard" : "/login";
  const accountLabel = loggedIn ? user?.firstName || "Sanctuary" : "Sign In";

  const switchLang = (l: "en" | "th") => {
    setLang(l);
    showToast(`Language switched to ${l.toUpperCase()}`);
  };

  return (
    <header id="main-header" className={headerClass}>
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Menu Button (desktop only on the hero header — mobile uses the bottom app nav) */}
        <button
          id="open-menu"
          className={`${
            variant === "hero"
              ? "invisible lg:visible flex items-center gap-3 p-1 hover:text-accent transition"
              : "flex items-center gap-3 p-1 hover:text-gold transition"
          }`}
          aria-label="Open Menu"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            openMenu({
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            });
          }}
        >
          <Menu className="w-5 h-5" />
          <span
            id="open-menu-label"
            className="hidden sm:inline text-[10px] md:text-xs tracking-[0.2em] uppercase font-semibold"
          >
            {t("menu")}
          </span>
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center group"
          aria-label="Thai Mango home"
        >
          <img
            src="/images/logo.png"
            alt="Thai Mango"
            className="w-12 h-12 md:w-14 md:h-14 object-contain rounded-full shadow-md group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Right: Language + Icons */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="lang-switcher hidden sm:flex items-center gap-1 text-[10px] md:text-xs tracking-widest uppercase font-semibold">
            <button
              className={`lang-btn px-1.5 py-0.5 rounded transition ${
                lang === "en"
                  ? "text-accent font-bold"
                  : "text-ivory/60 hover:text-accent font-normal"
              }`}
              onClick={() => switchLang("en")}
            >
              EN
            </button>
            <span className="text-ivory/40">|</span>
            <button
              className={`lang-btn px-1.5 py-0.5 rounded transition ${
                lang === "th"
                  ? "text-accent font-bold"
                  : "text-ivory/60 hover:text-accent font-normal"
              }`}
              onClick={() => switchLang("th")}
            >
              TH
            </button>
          </div>
          <Link
            href={accountHref}
            className="account-link text-ivory/80 hover:text-accent transition flex items-center gap-1.5"
            aria-label="Account"
          >
            <User className="w-5 h-5 font-light" />
            <span className="account-label hidden xl:inline text-[11px] tracking-widest uppercase font-semibold">
              {accountLabel}
            </span>
          </Link>
          <button
            className="open-cart p-1 hover:text-accent transition relative"
            aria-label="Cart"
            onClick={openCart}
          >
            <ShoppingBag className="w-5 h-5 font-light" />
            <span
              className={`cart-count absolute -top-1 -right-1 bg-accent text-ivory text-[9px] w-4 h-4 rounded-full flex items-center justify-center ${
                mounted && totalItems > 0 ? "" : "hidden"
              }`}
            >
              {mounted ? totalItems : 0}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
