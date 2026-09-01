"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Droplet,
  Flame,
  Gift,
  Heart,
  HelpCircle,
  Leaf,
  MessageCircle,
  Search,
  Sparkles,
  Sun,
  Truck,
  User,
  X,
} from "lucide-react";
import { InstagramIcon } from "./BrandIcons";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { menuPromoData, MenuTab } from "@/lib/site-data";
import { useStore } from "./store";

interface PromoContent {
  img: string;
  tag: string;
  title: string;
  btn: string;
  url: string;
}

interface PublicCategory {
  id: number;
  slug: string;
  name_en: string;
}

/* Icon pool cycled across however many categories exist in the catalog */
const CATEGORY_ICONS = [Sun, Flame, Droplet, Sparkles, Gift];

const CATEGORY_PROMO_IMAGES = [
  "/images/bangkok-mango-beetroot-1.png",
  "/images/bangkok-mango-beetroot-2.png",
];

const subitemPromoData: Record<string, PromoContent> = {
  "/shop": {
    img: "/images/bangkok-mango-beetroot-2.png",
    tag: "All Products",
    title: "Discover our newest mango creations.",
    btn: "Shop All",
    url: "/shop",
  },
  "/about": {
    img: "/images/menu-guides-promo.jpg",
    tag: "Our Heritage",
    title: "Honoring Thai tradition with pure botanical craft.",
    btn: "Discover Story",
    url: "/about",
  },
  "/rituals": {
    img: "/images/menu-guides-promo.jpg",
    tag: "Daily Rituals",
    title: "Explore mindful wellness & herbal recipes.",
    btn: "View Rituals",
    url: "/rituals",
  },
  "/ingredients": {
    img: "/images/menu-guides-promo.jpg",
    tag: "Pure Ingredients",
    title: "Sustainably harvested Thai mango & herbs.",
    btn: "Explore Ingredients",
    url: "/ingredients",
  },
  "/contact": {
    img: "/images/menu-consult-promo.jpg",
    tag: "Expert Consultations",
    title: "One-on-one personalized herbal consultation.",
    btn: "Contact Us",
    url: "/contact",
  },
  "/faq": {
    img: "/images/menu-consult-promo.jpg",
    tag: "Advice & FAQs",
    title: "Answers to your ritual & wellness questions.",
    btn: "Browse FAQs",
    url: "/faq",
  },
  "/shipping-policy": {
    img: "/images/menu-consult-promo.jpg",
    tag: "Shipping & Policies",
    title: "Worldwide express shipping & guarantee.",
    btn: "Learn Policies",
    url: "/shipping-policy",
  },
};

const subIconBox =
  "w-12 h-12 rounded-2xl bg-white border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-center text-[#F29F86] group-hover:border-[#F29F86]/50 group-hover:shadow-[0_4px_16px_rgba(242,159,134,0.18)] transition-all shrink-0";
const subLabel =
  "text-xs md:text-sm font-bold tracking-widest text-[#334155] uppercase font-sans group-hover:text-[#F29F86] transition-colors";

export default function MobileMenu() {
  const {
    menuOpen,
    closeMenu,
    menuOrigin,
    lang,
    setLang,
    showToast,
    openSearch,
    settings,
  } = useStore();
  const [activeTab, setActiveTab] = useState<MenuTab>("shop");
  const [promo, setPromo] = useState<PromoContent>(menuPromoData.shop);
  const [linksActive, setLinksActive] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<PublicCategory[]> => {
      const res = await fetch("/api/categories");
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to load categories");
      return body.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const shopCategories = (categoriesQuery.data ?? []).map((c, i) => ({
    name: c.name_en,
    href: `/shop?category=${encodeURIComponent(c.slug)}`,
    Icon: CATEGORY_ICONS[i % CATEGORY_ICONS.length],
    promo: {
      img: CATEGORY_PROMO_IMAGES[i % CATEGORY_PROMO_IMAGES.length],
      tag: c.name_en,
      title: `Explore our ${c.name_en} collection.`,
      btn: `Shop ${c.name_en}`,
      url: `/shop?category=${encodeURIComponent(c.slug)}`,
    } satisfies PromoContent,
  }));

  useEffect(() => {
    if (menuOpen) {
      const timer = setTimeout(() => setLinksActive(true), 250);
      return () => clearTimeout(timer);
    }
    setLinksActive(false);
  }, [menuOpen]);

  const switchTab = (tab: MenuTab) => {
    setActiveTab(tab);
    setPromo(menuPromoData[tab]);
  };

  const hoverPromo = (href: string) => {
    const data = subitemPromoData[href];
    if (data) setPromo(data);
  };

  const switchLang = (l: "en" | "th") => {
    setLang(l);
    showToast(`Language switched to ${l.toUpperCase()}`);
  };

  /* No-arg form renders a middle-column sub-link; with `extra` it renders any
     other staggered menu link (e.g. the promo tile). */
  const linkCls = (extra?: string) =>
    extra
      ? `menu-link${linksActive ? " active" : ""} ${extra}`
      : `menu-link${
          linksActive ? " active" : ""
        } group flex items-center gap-5 py-1.5 hover:translate-x-1.5 transition-transform duration-200`;

  const navCard = (tab: MenuTab) => {
    const isActive = activeTab === tab;
    return `menu-nav-card${isActive ? " active" : ""} ${
      linksActive ? "menu-link active" : "menu-link"
    } group relative p-5 md:p-6 rounded-[24px] ${
      isActive
        ? "bg-[#FFF5F2] border border-[#FADCD1] shadow-[0_4px_24px_rgba(242,159,134,0.12)]"
        : "bg-transparent border border-transparent hover:bg-white/60 hover:border-stone-200/60"
    } cursor-pointer transition-all duration-300 flex items-center justify-between`;
  };

  const navTitle = (tab: MenuTab) =>
    `menu-card-title text-base sm:text-lg font-bold tracking-wider ${
      activeTab === tab
        ? "text-[#F29F86]"
        : "text-[#334155] group-hover:text-[#F29F86]"
    } uppercase font-sans transition-colors`;

  const navSub = (tab: MenuTab) =>
    `menu-card-sub text-[10px] sm:text-[11px] font-semibold tracking-widest ${
      activeTab === tab ? "text-[#F7A38B]" : "text-[#94A3B8]"
    } uppercase mt-1 transition-colors`;

  const navBtn = (tab: MenuTab) =>
    `menu-card-btn w-10 h-10 rounded-full ${
      activeTab === tab
        ? "bg-[#F29F86] text-white shadow-sm group-hover:scale-105"
        : "border border-slate-200 bg-white/80 text-slate-400 group-hover:text-white group-hover:bg-[#F29F86] group-hover:border-[#F29F86]"
    } flex items-center justify-center transition-all duration-200 shrink-0`;

  return (
    <div
      id="mobile-menu"
      className={`fixed inset-0 bg-[#FBF9F6] z-50 flex flex-col overflow-y-auto${
        menuOpen ? " menu-open" : ""
      }`}
      style={
        {
          "--menu-cx": menuOrigin ? `${menuOrigin.x}px` : undefined,
          "--menu-cy": menuOrigin ? `${menuOrigin.y}px` : undefined,
        } as React.CSSProperties
      }
    >
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 md:px-12 py-6 border-b border-stone-200/70 shrink-0 sticky top-0 bg-[#FBF9F6]/95 backdrop-blur-md z-10">
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
          <img
            src="/images/logo.png"
            alt="Thai Mango"
            className="w-10 h-10 object-contain rounded-full shadow-sm"
          />
          <span className="hidden sm:inline text-lg font-serif tracking-widest uppercase text-charcoal">
            Thai Mango
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="lang-switcher flex items-center gap-1 text-[10px] tracking-widest uppercase font-semibold">
            <button
              className={`lang-btn px-1.5 py-0.5 rounded transition ${
                lang === "en"
                  ? "text-[#F29F86] font-bold"
                  : "text-muted hover:text-[#F29F86] font-normal"
              }`}
              onClick={() => switchLang("en")}
            >
              EN
            </button>
            <span className="text-stone-300">|</span>
            <button
              className={`lang-btn px-1.5 py-0.5 rounded transition ${
                lang === "th"
                  ? "text-[#F29F86] font-bold"
                  : "text-muted hover:text-[#F29F86] font-normal"
              }`}
              onClick={() => switchLang("th")}
            >
              TH
            </button>
          </div>
          <button
            id="close-menu"
            className="p-2 text-charcoal hover:text-[#F29F86] transition rounded-full hover:bg-black/5"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <X className="w-6 h-6 font-light" />
          </button>
        </div>
      </div>

      {/* Main: Multi-column Menu (Left Categories + Middle Sub-items + Right Promo Image) */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-8 md:py-12 flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-8 lg:gap-12">
        {/* Left Column: Primary Sections */}
        <div className="w-full lg:w-95 xl:w-105 flex flex-col justify-center gap-3 md:gap-4 shrink-0">
          {/* 1. Shop Products */}
          <div
            className={navCard("shop")}
            style={{ transitionDelay: "60ms" }}
            onClick={() => switchTab("shop")}
          >
            <div className="pr-3">
              <h3 className={navTitle("shop")}>SHOP PRODUCTS</h3>
              <p className={navSub("shop")}>DISCOVER YOUR SELECTION Category</p>
            </div>
            <Link
              href="/shop"
              className={navBtn("shop")}
              aria-label="Shop Products"
              onClick={closeMenu}
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* 2. Guides & Journal */}
          <div
            className={navCard("guides")}
            style={{ transitionDelay: "120ms" }}
            onClick={() => switchTab("guides")}
          >
            <div className="pr-3">
              <h3 className={navTitle("guides")}>GUIDES &amp; JOURNAL</h3>
              <p className={navSub("guides")}>OUR STORY AND TIPS</p>
            </div>
            <Link
              href="/about"
              className={navBtn("guides")}
              aria-label="Guides & Journal"
              onClick={closeMenu}
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* 3. Consultations */}
          <div
            className={navCard("consultations")}
            style={{ transitionDelay: "180ms" }}
            onClick={() => switchTab("consultations")}
          >
            <div className="pr-3">
              <h3 className={navTitle("consultations")}>CONSULTATIONS</h3>
              <p className={navSub("consultations")}>HEALTH &amp; SKIN EXPERTS</p>
            </div>
            <Link
              href="/contact"
              className={navBtn("consultations")}
              aria-label="Consultations"
              onClick={closeMenu}
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Middle Column: Sub-links */}
        <div className="w-full lg:flex-1 border-t lg:border-t-0 lg:border-l border-stone-200/70 pt-6 lg:pt-0 lg:pl-10 xl:pl-14 flex flex-col justify-center">
          {/* Tab Panel 1: Shop Products Sub-items */}
          <div
            id="subpanel-shop"
            className={`menu-subpanel ${
              activeTab === "shop" ? "flex" : "hidden"
            } flex-col gap-5 md:gap-6`}
          >
            {categoriesQuery.isPending ? (
              <span className="text-xs text-muted uppercase tracking-widest py-2">
                Loading categories…
              </span>
            ) : (
              shopCategories.map(({ name, href, Icon, promo: catPromo }, i) => (
                <Link
                  key={href}
                  href={href}
                  className={linkCls()}
                  style={{ transitionDelay: `${150 + i * 50}ms` }}
                  onClick={closeMenu}
                  onMouseEnter={() => setPromo(catPromo)}
                >
                  <span className="contents">
                    <span className={subIconBox}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className={subLabel}>{name.toUpperCase()}</span>
                  </span>
                </Link>
              ))
            )}

            <Link
              href="/shop"
              className={linkCls()}
              style={{ transitionDelay: "400ms" }}
              onClick={closeMenu}
              onMouseEnter={() => hoverPromo("/shop")}
            >
              <span className="contents">
                <span className={subIconBox}>
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 3h12a2 2 0 0 1 2 2v14a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2z" />
                    <path d="M9 7a3 3 0 0 0 6 0" />
                  </svg>
                </span>
                <span className={subLabel}>ALL PRODUCTS</span>
              </span>
            </Link>
          </div>

          {/* Tab Panel 2: Guides & Journal Sub-items */}
          <div
            id="subpanel-guides"
            className={`menu-subpanel ${
              activeTab === "guides" ? "flex" : "hidden"
            } flex-col gap-5 md:gap-6`}
          >
            <Link
              href="/about"
              className={linkCls()}
              onClick={closeMenu}
              onMouseEnter={() => hoverPromo("/about")}
            >
              <span className="contents">
                <span className={subIconBox}>
                  <BookOpen className="w-5 h-5" />
                </span>
                <span className={subLabel}>OUR STORY</span>
              </span>
            </Link>
            <Link
              href="/rituals"
              className={linkCls()}
              onClick={closeMenu}
              onMouseEnter={() => hoverPromo("/rituals")}
            >
              <span className="contents">
                <span className={subIconBox}>
                  <Sparkles className="w-5 h-5" />
                </span>
                <span className={subLabel}>RITUALS &amp; JOURNAL</span>
              </span>
            </Link>
            <Link
              href="/ingredients"
              className={linkCls()}
              onClick={closeMenu}
              onMouseEnter={() => hoverPromo("/ingredients")}
            >
              <span className="contents">
                <span className={subIconBox}>
                  <Leaf className="w-5 h-5" />
                </span>
                <span className={subLabel}>NATURAL INGREDIENTS</span>
              </span>
            </Link>
          </div>

          {/* Tab Panel 3: Consultations Sub-items */}
          <div
            id="subpanel-consultations"
            className={`menu-subpanel ${
              activeTab === "consultations" ? "flex" : "hidden"
            } flex-col gap-5 md:gap-6`}
          >
            <Link
              href="/contact"
              className={linkCls()}
              onClick={closeMenu}
              onMouseEnter={() => hoverPromo("/contact")}
            >
              <span className="contents">
                <span className={subIconBox}>
                  <MessageCircle className="w-5 h-5" />
                </span>
                <span className={subLabel}>TALK TO US</span>
              </span>
            </Link>
            <Link
              href="/faq"
              className={linkCls()}
              onClick={closeMenu}
              onMouseEnter={() => hoverPromo("/faq")}
            >
              <span className="contents">
                <span className={subIconBox}>
                  <HelpCircle className="w-5 h-5" />
                </span>
                <span className={subLabel}>FAQ &amp; ADVICE</span>
              </span>
            </Link>
            <Link
              href="/shipping-policy"
              className={linkCls()}
              onClick={closeMenu}
              onMouseEnter={() => hoverPromo("/shipping-policy")}
            >
              <span className="contents">
                <span className={subIconBox}>
                  <Truck className="w-5 h-5" />
                </span>
                <span className={subLabel}>SHIPPING &amp; POLICIES</span>
              </span>
            </Link>
          </div>
        </div>

        {/* Right Column: Promo Image Tile */}
        <Link
          href={promo.url}
          className={linkCls(
            "relative hidden xl:block w-[300px] 2xl:w-[340px] rounded-[28px] overflow-hidden group shrink-0 aspect-[4/5] shadow-xl self-center"
          )}
          style={{ transitionDelay: "320ms" }}
          onClick={closeMenu}
        >
          <img
            src={promo.img}
            alt={promo.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <span className="block text-[10px] tracking-widest uppercase text-[#F29F86] font-bold mb-2">
              {promo.tag}
            </span>
            <h3 className="font-serif text-2xl xl:text-3xl mb-4 leading-snug">
              {promo.title}
            </h3>
            <span className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase font-bold text-white group-hover:text-[#F29F86] transition">
              {promo.btn}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t border-stone-200/70 bg-cream/60 px-8 md:px-16 py-8 shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 max-w-7xl mx-auto">
          <div>
            <h4 className="text-[10px] tracking-widest uppercase font-bold text-muted mb-4">
              Discover
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/shop"
                  className="text-[#334155] hover:text-[#F29F86] transition"
                  onClick={closeMenu}
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-[#334155] hover:text-[#F29F86] transition"
                  onClick={closeMenu}
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-[#334155] hover:text-[#F29F86] transition"
                  onClick={closeMenu}
                >
                  Gift Cards
                </Link>
              </li>
              <li>
                <Link
                  href="/rituals"
                  className="text-[#334155] hover:text-[#F29F86] transition"
                  onClick={closeMenu}
                >
                  Snacking Guide
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] tracking-widest uppercase font-bold text-muted mb-4">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/shipping-policy"
                  className="text-[#334155] hover:text-[#F29F86] transition"
                  onClick={closeMenu}
                >
                  Shipping
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-[#334155] hover:text-[#F29F86] transition"
                  onClick={closeMenu}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[#334155] hover:text-[#F29F86] transition"
                  onClick={closeMenu}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#334155] hover:text-[#F29F86] transition"
                  onClick={closeMenu}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-[#334155] hover:text-[#F29F86] transition"
                  onClick={closeMenu}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2">
            <h4 className="text-[10px] tracking-widest uppercase font-bold text-muted mb-3">
              Stay in Touch
            </h4>
            <p className="text-xs sm:text-sm text-muted mb-3 max-w-sm">
              Sign up for early access, recipes and mango edits.
            </p>
            <NewsletterMiniForm />
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-charcoal/10">
          <div className="flex items-center gap-6 text-charcoal">
            <Link
              href="/login"
              className="hover:text-[#F29F86] transition"
              aria-label="Account"
              onClick={closeMenu}
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 font-light" />
            </Link>
            <Link
              href="/shop"
              className="hover:text-[#F29F86] transition"
              aria-label="Wishlist"
              onClick={closeMenu}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 font-light" />
            </Link>
            <a
              href="#"
              className="open-search hover:text-[#F29F86] transition"
              aria-label="Search"
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                openSearch();
              }}
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 font-light" />
            </a>
            {settings?.social_instagram && (
              <a
                href={settings.social_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#F29F86] transition"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5 font-light" />
              </a>
            )}
          </div>
          <p className="text-[10px] tracking-widest uppercase text-muted">
            © 2026 THAI MANGO
          </p>
        </div>
      </div>
    </div>
  );
}

function NewsletterMiniForm() {
  const { showToast } = useStore();
  return (
    <form
      className="flex border-b border-charcoal/30 max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        showToast("Subscribed to Thai Mango");
        (e.target as HTMLFormElement).reset();
      }}
    >
      <input
        type="email"
        placeholder="Your email"
        className="flex-1 bg-transparent py-2 text-xs sm:text-sm placeholder:text-muted focus:outline-none"
        required
      />
      <button
        type="submit"
        className="p-2 text-charcoal hover:text-[#F29F86] transition"
        aria-label="Subscribe"
      >
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
