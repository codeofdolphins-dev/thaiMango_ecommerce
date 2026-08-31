"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Clock,
  MessageCircle,
  Play,
  ShoppingBag,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import { InstagramIcon } from "@/components/public/BrandIcons";
import { useStore } from "@/components/public/store";
import { defaultVariant, minPrice } from "@/lib/variants";
import { productImage } from "@/lib/images";

interface ApiVariant {
  label: string;
  weight_grams: number;
  price: string;
  compare_at_price: string;
  stock: number;
  is_default: boolean;
}

interface ApiProduct {
  id: string;
  slug: string;
  name_en: string;
  description_en: string;
  images: string[];
  highlights: string[];
  category: { slug: string; name_en: string };
  productVariant: ApiVariant[];
}

interface ApiCategory {
  id: number;
  slug: string;
  name_en: string;
  name_th: string;
  cat_id: number | null;
}

interface ContentBlock {
  id: string;
  content: string;
}

const FALLBACK_IMAGES = [
  "/images/bangkok-mango-beetroot-1.png",
  "/images/bangkok-mango-beetroot-2.png",
];

type PriceFormatter = (value: number) => string;

interface HomeProduct {
  id: string;
  slug: string;
  name: string;
  desc: string;
  image: string;
  categorySlug: string;
  categoryName: string;
  badges: string[];
  price: number;
  priceDisplay: string;
  comparePriceDisplay?: string;
  discountPct?: number;
}

function mapProduct(p: ApiProduct, formatPrice: PriceFormatter): HomeProduct {
  /* Cards show the default variant; "from <price>" when cheaper sizes exist. */
  const variant = defaultVariant(p.productVariant);
  const lowest = minPrice(p.productVariant);
  const price = variant ? Number(variant.price) : 0;
  const compareAt = variant ? Number(variant.compare_at_price) : 0;
  const hasCheaper = lowest !== null && lowest < price;
  const hasDiscount = variant !== null && !hasCheaper && compareAt > price;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name_en,
    desc: p.description_en,
    image: productImage(p.images),
    categorySlug: p.category.slug,
    categoryName: p.category.name_en,
    badges: p.highlights.slice(0, 2),
    price: hasCheaper ? lowest : price,
    priceDisplay: !variant
      ? "—"
      : hasCheaper
        ? `From ${formatPrice(lowest)}`
        : formatPrice(price),
    comparePriceDisplay: hasDiscount ? formatPrice(compareAt) : undefined,
    discountPct: hasDiscount
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : undefined,
  };
}

export default function Home() {
  const { t, addToCart, showToast, formatPrice } = useStore();

  /* Admin-editable copy (Admin → Site Content) */
  const contentQuery = useQuery({
    queryKey: ["site-content"],
    queryFn: async (): Promise<ContentBlock[]> => {
      const res = await fetch("/api/site-content");
      if (!res.ok) throw new Error("Failed to load site content");
      const body = await res.json();
      return body.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const productsQuery = useQuery({
    queryKey: ["home-products"],
    queryFn: async (): Promise<ApiProduct[]> => {
      const res = await fetch("/api/products?limit=6");
      if (!res.ok) throw new Error("Failed to load products");
      const body = await res.json();
      return body.data.products;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<ApiCategory[]> => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      const body = await res.json();
      return body.data;
    },
  });

  const blocks = new Map(
    (contentQuery.data ?? []).map((b) => [b.id, b.content])
  );
  const content = (id: string, fallback: string) =>
    blocks.get(id)?.trim() || fallback;

  const products = (productsQuery.data ?? []).map((p) =>
    mapProduct(p, formatPrice)
  );
  const showcase = products.slice(0, 3);
  const collections = products.length > 3 ? products.slice(3, 6) : products;

  const rootCategories = (categoriesQuery.data ?? [])
    .filter((c) => c.cat_id === null)
    .slice(0, 4);
  const categoryImage = (slug: string, index: number) => {
    const match = productsQuery.data?.find((p) => p.category.slug === slug)?.images[0];
    return match ? productImage([match]) : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };

  /* Hero title renders its last word in the accent color */
  const heroWords = content(
    "hero_title",
    `${t("hero_title_1")} ${t("hero_title_2")}`
  ).split(" ");
  const heroLead = heroWords.slice(0, -1).join(" ");
  const heroAccent = heroWords[heroWords.length - 1];

  const productsPending = productsQuery.isPending;

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/images/ei_video_ta_background_e_dao.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-[#161616]/70"></div>
        </div>

        {/* Corner Frame Accent */}
        <div className="hidden md:block absolute inset-6 md:inset-10 lg:inset-12 z-5 pointer-events-none">
          <span className="absolute top-0 left-0 w-14 h-14 border-t border-l border-ivory/30"></span>
          <span className="absolute top-0 right-0 w-14 h-14 border-t border-r border-ivory/30"></span>
          <span className="absolute bottom-0 left-0 w-14 h-14 border-b border-l border-ivory/30"></span>
          <span className="absolute bottom-0 right-0 w-14 h-14 border-b border-r border-ivory/30"></span>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 md:px-12 flex-1 flex items-center justify-start">
          <div className="max-w-2xl text-left text-white reveal">
            <h1 className="font-serif font-medium text-5xl md:text-[5.5rem] leading-[1.1] mb-6 tracking-tight uppercase">
              {heroLead && <span>{heroLead} </span>}
              <span className="text-[#F29F86]">{heroAccent}</span>
            </h1>

            <p className="text-white/90 text-sm md:text-lg leading-relaxed mb-10 max-w-xl font-medium">
              {content("hero_desc", t("hero_desc"))}
            </p>

            <div className="flex flex-col sm:flex-row items-start justify-start gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 bg-[#F29F86] text-white text-[10px] md:text-xs tracking-widest uppercase hover:bg-white hover:text-charcoal transition duration-300 rounded-full font-bold"
              >
                <span>{t("shop_products")}</span>
                <ArrowRight className="w-4 h-4 ml-3" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 bg-white/10 border border-white/20 text-white text-[10px] md:text-xs tracking-widest uppercase hover:bg-white hover:text-charcoal transition duration-300 rounded-full font-bold backdrop-blur-sm"
              >
                <span>{t("skin_consultation")}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quality & Origin 5-Badge Banner */}
        <div className="relative z-10 w-full border-t border-gold/30 bg-beetroot text-white reveal">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 py-10 md:py-6 grid grid-cols-2 md:grid-cols-5 gap-y-10 md:gap-y-0 gap-x-6 md:gap-x-0 md:divide-x md:divide-gold/30 text-center items-center">
            {/* 1: 100% Natural */}
            <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
              <span className="w-14 h-14 md:w-14 md:h-14 rounded-full border-2 border-gold flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow-sm">
                <svg className="w-7 h-7 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22V10"></path>
                  <path d="M12 10C12 5 8 3 4 3c0 5 2 9 8 9"></path>
                  <path d="M12 14c0-4 3-7 8-7 0 4-2 7-8 7"></path>
                  <line x1="8" y1="22" x2="16" y2="22"></line>
                </svg>
              </span>
              <span className="text-sm md:text-sm font-semibold tracking-wide text-white mb-1">ธรรมชาติ 100%</span>
              <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">100% NATURAL</span>
            </div>

            {/* 2: Finest Quality Mango */}
            <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
              <span className="w-14 h-14 md:w-14 md:h-14 rounded-full border-2 border-gold flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow-sm">
                <svg className="w-7 h-7 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 4c-1.2-1.8-3-2.5-5-1.8 0 2.8 1.8 3.8 4.8 3.8"></path>
                  <path d="M9.8 6.5C6 6.5 3 10.2 4 15c1 4.8 5.8 6.8 8.8 4.8 4-2.8 5-8.8 3-11.8-1.5-1.8-3.8-2.2-6-1.5z"></path>
                  <path d="M10 4.5c1-1.5 2-2 3-2"></path>
                </svg>
              </span>
              <span className="text-sm md:text-sm font-semibold tracking-wide text-white mb-1">คัดสรรจากมะม่วงคุณภาพ</span>
              <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">FINEST QUALITY MANGO</span>
            </div>

            {/* 3: Product of Thailand */}
            <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
              <span className="w-14 h-14 md:w-14 md:h-14 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300">
                <svg className="w-14 h-9 md:w-14 md:h-9 drop-shadow-md" viewBox="0 0 54 36" fill="none">
                  <path d="M2 10C12 2 24 20 34 10C40 4 48 12 52 8V24C48 28 40 20 34 26C24 36 12 18 2 26V10Z" fill="#ED1C24" />
                  <path d="M2 13C12 5 24 23 34 13C40 7 48 15 52 11V21C48 25 40 17 34 23C24 33 12 15 2 23V13Z" fill="#FFFFFF" />
                  <path d="M2 15.5C12 7.5 24 25.5 34 15.5C40 9.5 48 17.5 52 13.5V18.5C48 22.5 40 14.5 34 20.5C24 30.5 12 12.5 2 20.5V15.5Z" fill="#241D4F" />
                </svg>
              </span>
              <span className="text-sm md:text-sm font-semibold tracking-wide text-white mb-1">ผลิตในประเทศไทย</span>
              <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">PRODUCT OF THAILAND</span>
            </div>

            {/* 4: Delicious & Chewy */}
            <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
              <span className="w-14 h-14 md:w-14 md:h-14 rounded-full border-2 border-gold flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow-sm">
                <svg className="w-7 h-7 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5.5 14c1 4.5 4.5 6.5 8.5 6.5 4 0 7-3 7-7 0-3.2-2.2-5.2-4.5-5.2-3 0-5 2-6.5 4-2 0-3.5 1-4.5 1.7z"></path>
                  <circle cx="9" cy="8" r="1" fill="currentColor"></circle>
                  <circle cx="15" cy="7" r="0.8" fill="currentColor"></circle>
                  <path d="M7 6l.4 1.2L8.5 7.5l-1.1.4L7 9l-.4-1.1L5.5 7.5l1.1-.3L7 6z" fill="currentColor"></path>
                </svg>
              </span>
              <span className="text-sm md:text-sm font-semibold tracking-wide text-white mb-1">อร่อย เพลิน เคี้ยวหนึบ</span>
              <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">DELICIOUS &amp; CHEWY</span>
            </div>

            {/* 5: For All Ages */}
            <div className="col-span-2 md:col-span-1 px-2 md:px-4 flex flex-col items-center justify-center group max-w-xs mx-auto">
              <span className="w-14 h-14 md:w-14 md:h-14 rounded-full border-2 border-gold flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow-sm">
                <svg className="w-7 h-7 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="5.5" r="2.2"></circle>
                  <path d="M5.5 21v-5a3 3 0 0 1 5.5 0v5"></path>
                  <circle cx="16.5" cy="7" r="1.8"></circle>
                  <path d="M14 21v-4a2.5 2.5 0 0 1 5 0v4"></path>
                </svg>
              </span>
              <span className="text-sm md:text-sm font-semibold tracking-wide text-white mb-1">เหมาะสำหรับทุกวัย</span>
              <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">FOR ALL AGES</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="pt-16 pb-12 bg-[#F5F5F5]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 mb-8 reveal">
          <h2 className="text-xl md:text-[26px] font-serif font-normal tracking-[0.08em] text-[#334155] uppercase">
            {t("the_selection")}
          </h2>
        </div>
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          {productsPending ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-[32px] aspect-[4/5] bg-white/70 animate-pulse" />
              ))}
            </div>
          ) : showcase.length === 0 ? (
            <p className="py-16 text-center text-xs uppercase tracking-widest text-muted">
              No products available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {showcase.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/product-detail/${product.slug}`}
                  className="relative overflow-hidden rounded-[32px] aspect-[4/5] group cursor-pointer reveal block"
                  style={i > 0 ? { transitionDelay: `${i * 200}ms` } : undefined}
                >
                  {/* Background Image */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 bg-[#F7F4EE]"
                  />

                  {/* Dark Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 text-white">
                    <h2 className="text-lg xl:text-xl font-serif font-medium mb-3 tracking-tight leading-snug pr-4 uppercase">
                      {product.name}
                    </h2>
                    <p className="text-[13px] text-white/80 line-clamp-2 mb-8 font-medium max-w-sm pr-4">
                      {product.desc}
                    </p>

                    <span className="inline-flex items-center gap-3 text-[10px] tracking-widest uppercase font-bold group-hover:text-white transition duration-300">
                      <span className="border-b border-white pb-0.5">{t("discover_more")}</span>
                      <span className="w-7 h-7 rounded-full border border-white/40 flex items-center justify-center group-hover:bg-white/20 transition duration-300">
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="pb-16 pt-8 bg-[#F5F5F5]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 reveal">
            <h2 className="text-xl md:text-[26px] font-serif font-normal tracking-[0.08em] text-[#334155] uppercase mb-6 md:mb-0">
              {t("shop_by_category")}
            </h2>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-[#0A1118] text-white text-[10px] md:text-xs tracking-[0.15em] uppercase hover:bg-accent transition duration-300 rounded-full font-bold shadow-md"
            >
              <span>Explore Complete Selection</span>
              <ArrowRight className="w-4 h-4 ml-3" />
            </Link>
          </div>

          {/* Banner Cards Grid */}
          {categoriesQuery.isPending ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-[32px] aspect-[4/3] md:aspect-[16/9] lg:aspect-[2/1] bg-white/70 animate-pulse" />
              ))}
            </div>
          ) : rootCategories.length === 0 ? (
            <p className="py-16 text-center text-xs uppercase tracking-widest text-muted">
              No categories available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {rootCategories.map((category, i) => (
                <Link
                  key={category.slug}
                  href={`/shop?category=${encodeURIComponent(category.slug)}`}
                  className="relative overflow-hidden rounded-[32px] aspect-[4/3] md:aspect-[16/9] lg:aspect-[2/1] group block reveal"
                  style={i > 0 ? { transitionDelay: `${(i % 2) * 200}ms` } : undefined}
                >
                  <img
                    src={categoryImage(category.slug, i)}
                    alt={`${category.name_en} Category`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 md:p-10 z-10 w-full">
                    <span className="block text-[#F29F86] text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase mb-2">Selection</span>
                    <h3 className="text-white text-3xl md:text-4xl font-serif font-medium uppercase tracking-tight">{category.name_en}</h3>

                    {/* Hover Button */}
                    <div className="flex items-center gap-3 mt-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                      <span className="text-white text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold">Explore Flavors</span>
                      <span className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center group-hover:border-white transition duration-300">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* The Collections */}
      <section id="collections" className="pb-16 pt-8 bg-[#F5F5F5]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 reveal">
            <h2 className="text-xl md:text-[26px] font-serif font-normal tracking-[0.08em] text-[#334155] uppercase mb-6 md:mb-0">
              THE COLLECTIONS
            </h2>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-[#0A1118] text-white text-[10px] md:text-xs tracking-[0.15em] uppercase hover:bg-accent transition duration-300 rounded-full font-bold shadow-md"
            >
              Explore Complete Selection
              <ArrowRight className="w-4 h-4 ml-3" />
            </Link>
          </div>

          {/* Product Cards Grid */}
          {productsPending ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-[24px] aspect-[4/5] bg-white/70 animate-pulse" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <p className="py-16 text-center text-xs uppercase tracking-widest text-muted">
              No products available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {collections.map((product, i) => (
                <div
                  key={product.id}
                  className="bg-white rounded-[24px] overflow-hidden shadow-sm group cursor-pointer reveal"
                  style={i > 0 ? { transitionDelay: `${i * 200}ms` } : undefined}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#FCE9D8]">
                    <Link href={`/product-detail/${product.slug}`} className="absolute inset-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                      />
                    </Link>

                    {/* Badges */}
                    {product.badges.length > 0 && (
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                        {product.badges.map((badge) => (
                          <span key={badge} className="bg-[#F29F86] text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                    {product.discountPct !== undefined && product.discountPct > 0 && (
                      <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 pointer-events-none">
                        -{product.discountPct}%
                      </span>
                    )}

                    {/* Quick Add */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart({
                          name: product.name,
                          price: product.price,
                          image: product.image,
                        });
                      }}
                      className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center text-accent shadow-md z-10 hover:bg-accent hover:text-white transition"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6">
                    <h3 className="text-sm md:text-base font-serif font-semibold uppercase tracking-tight text-[#0A1118] mb-2 truncate">
                      <Link href={`/product-detail/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <p className="text-[13px] text-muted line-clamp-2 mb-4 leading-relaxed">{product.desc}</p>

                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="text-[9px] tracking-widest uppercase font-bold text-accent bg-[#FDF1EA] px-3 py-1.5 rounded-full">
                        {product.categoryName}
                      </span>
                    </div>

                    <div className="flex items-end justify-between pt-4 border-t border-cream">
                      <div>
                        {product.comparePriceDisplay && (
                          <span className="block text-xs text-muted line-through">{product.comparePriceDisplay}</span>
                        )}
                        <span className="text-lg font-bold text-[#F29F86]">{product.priceDisplay}</span>
                      </div>
                      <Link
                        href={`/product-detail/${product.slug}`}
                        className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase font-bold text-[#0A1118] group-hover:text-accent transition"
                      >
                        Explore
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* The Visionary */}
      <section id="our-founder" className="py-12 md:py-16 bg-ivory">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Image */}
            <div className="w-full lg:w-1/2">
              <div className="relative aspect-[4/4.5] lg:aspect-[4/3.6] rounded-[28px] overflow-hidden border border-accent/10">
                <img src="/images/bangkok-mango-beetroot-1.png" alt="Our Founder" className="w-full h-full object-cover" />
              </div>
            </div>
            {/* Text */}
            <div className="w-full lg:w-1/2 reveal text-center lg:text-left">
              <span className="text-[10px] tracking-[0.3em] uppercase text-accent font-bold block mb-4">The Visionary</span>
              <h2 className="font-serif text-4xl md:text-5xl mb-6">Our Founder</h2>
              <blockquote className="border-l-2 border-accent pl-5 italic text-muted text-base md:text-lg mb-10 max-w-xl mx-auto lg:mx-0">
                &quot;{content(
                  "founder_quote",
                  "Thai Mango was created to bring my family's three generations of orchard craft to the world — mango dried the way my grandmother did it, with nothing added and nothing hidden."
                )}&quot;
              </blockquote>

              <div className="grid grid-cols-2 gap-8 mb-10 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="w-11 h-11 rounded-full bg-[#FDF1EA] flex items-center justify-center mb-3 mx-auto lg:mx-0">
                    <Star className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wide mb-1">[Add Figure] Harvests</h3>
                  <p className="text-xs text-muted">Placeholder — replace with a real, verifiable number.</p>
                </div>
                <div>
                  <div className="w-11 h-11 rounded-full bg-[#FDF1EA] flex items-center justify-center mb-3 mx-auto lg:mx-0">
                    <Award className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wide mb-1">Orchard-Direct Sourcing</h3>
                  <p className="text-xs text-muted">Placeholder — name the actual grower/partner once confirmed.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/contact" className="inline-flex items-center justify-center px-8 py-3.5 bg-charcoal text-ivory text-[10px] md:text-xs tracking-widest uppercase hover:bg-accent transition duration-300 rounded-full font-bold">
                  Request a Sample
                  <ArrowRight className="w-4 h-4 ml-3" />
                </Link>
                <Link href="/about" className="inline-flex items-center justify-center px-8 py-3.5 border border-accent text-accent text-[10px] md:text-xs tracking-widest uppercase hover:bg-accent hover:text-white transition duration-300 rounded-full font-bold">
                  <User className="w-4 h-4 mr-2" /> Meet the Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skin Community */}
      <section className="py-24 bg-[#F5F5F5]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="mb-10 reveal">
            <h2 className="text-2xl md:text-3xl font-serif font-normal text-[#334155] mb-2">Mango Moments</h2>
            <p className="text-muted text-sm md:text-base">
              {content(
                "community_intro",
                "Join our community of mango lovers. Share your snacking moments with #THAIMANGOMOMENTS."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-4 lg:h-[600px]">
            {/* Large tile */}
            <Link href="/rituals" className="relative rounded-[24px] overflow-hidden group cursor-pointer lg:row-span-2 aspect-[4/3] lg:aspect-auto reveal">
              <img src="/images/bangkok-mango-beetroot-1.png" alt="Thai Mango editorial" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <span className="absolute top-4 left-4 bg-white/90 text-[#334155] text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">Editorial</span>
            </Link>

            {/* Small tile 1 */}
            <Link href="/rituals" className="relative rounded-[24px] overflow-hidden group cursor-pointer aspect-[4/3] lg:aspect-auto reveal delay-[100ms]">
              <img src="/images/bangkok-mango-beetroot-2.png" alt="Behind the harvest" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
              <span className="absolute top-4 left-4 bg-white/90 text-[#334155] text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">Editorial</span>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-semibold tracking-wide">Behind the Harvest</p>
              </div>
            </Link>

            {/* CTA tile */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="relative rounded-[24px] overflow-hidden bg-accent flex flex-col justify-between p-6 aspect-[4/3] lg:aspect-auto reveal delay-[150ms]">
              <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <InstagramIcon className="w-5 h-5 text-white" />
              </span>
              <div>
                <h3 className="text-white font-serif text-2xl mb-2">The Orchard</h3>
                <p className="text-white/80 text-xs mb-5">Connect with our community on Instagram.</p>
                <span className="inline-flex items-center justify-between gap-3 w-full bg-charcoal text-ivory text-[10px] tracking-widest uppercase font-bold px-4 py-3 rounded-full">
                  @thaimango
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </a>

            {/* Small tile 2 */}
            <Link href="/rituals" className="relative rounded-[24px] overflow-hidden group cursor-pointer aspect-[4/3] lg:aspect-auto reveal delay-[200ms]">
              <img src="/images/bangkok-mango-beetroot-1.png" alt="Thai Mango snacking ritual" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
              <span className="absolute top-4 left-4 bg-white/90 text-[#334155] text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">Editorial</span>
            </Link>

            {/* Small tile 3 */}
            <Link href="/rituals" className="relative rounded-[24px] overflow-hidden group cursor-pointer aspect-[4/3] lg:aspect-auto reveal delay-[250ms]">
              <img src="/images/bangkok-mango-beetroot-2.png" alt="Snacking rituals" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
              <span className="absolute top-4 left-4 bg-white/90 text-[#334155] text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">Editorial</span>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-semibold tracking-wide">Snacking Rituals</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Heritage Film */}
      <section className="relative h-[80vh] bg-charcoal flex items-center justify-center overflow-hidden">
        <img src="/images/bangkok-mango-beetroot-1.png" alt="Thai Mango Philosophy" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />

        {/* Corner Frame Accent */}
        <div className="hidden md:block absolute inset-8 md:inset-12 z-[5] pointer-events-none">
          <span className="absolute top-0 left-0 w-14 h-14 border-t border-l border-ivory/25"></span>
          <span className="absolute top-0 right-0 w-14 h-14 border-t border-r border-ivory/25"></span>
          <span className="absolute bottom-0 left-0 w-14 h-14 border-b border-l border-ivory/25"></span>
          <span className="absolute bottom-0 right-0 w-14 h-14 border-b border-r border-ivory/25"></span>
        </div>

        <div className="relative z-10 text-center text-ivory max-w-3xl px-6 reveal">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase font-bold border border-ivory/30 rounded-full px-5 py-2 mb-8">Our Heritage</span>
          <h2 className="font-serif font-medium text-4xl md:text-6xl lg:text-7xl uppercase leading-[1.1] mb-12 tracking-tight max-w-2xl mx-auto">
            {content("heritage_title", "A Legacy of Golden Orchards")}
          </h2>

          <button className="w-20 h-20 rounded-full border border-ivory flex items-center justify-center mx-auto hover:bg-ivory hover:text-charcoal transition duration-500 play-pulse group" aria-label="Play video">
            <Play className="w-6 h-6 ml-1 fill-current" />
          </button>
          <span className="block mt-8 text-xs tracking-widest uppercase text-ivory/80 font-semibold">Watch the Film</span>
        </div>
      </section>

      {/* The Edit */}
      <section className="py-24 bg-[#F5F5F5]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 reveal gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-normal text-[#334155] uppercase mb-3">The Edit</h2>
              <p className="text-muted text-sm md:text-base max-w-xl">
                {content(
                  "journal_intro",
                  "Dive into our curated world of snacking rituals, orchard heritage, and mango know-how."
                )}
              </p>
            </div>
            <Link href="/rituals" className="inline-flex items-center justify-center px-6 py-3.5 bg-[#0A1118] text-white text-[10px] md:text-xs tracking-[0.15em] uppercase hover:bg-accent transition duration-300 rounded-full font-bold shadow-md shrink-0">
              View Journal
              <ArrowRight className="w-4 h-4 ml-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <article className="group cursor-pointer reveal">
              <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden mb-5 shadow-sm">
                <img src="/images/bangkok-mango-beetroot-1.png" alt="The Art of Sun-Drying" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
                <span className="absolute top-4 left-4 bg-white/90 text-accent text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">Craft</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted tracking-widest uppercase mb-3 font-semibold">
                <span>March 15, 2024</span>
                <span className="w-1 h-1 rounded-full bg-muted/50"></span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 5 Min Read</span>
              </div>
              <h3 className="text-lg md:text-xl font-serif font-semibold uppercase tracking-tight text-[#0A1118] mb-3 group-hover:text-accent transition">The Art of Sun-Drying</h3>
              <p className="text-[13px] text-muted leading-relaxed mb-5">Discover why this centuries-old Thai technique is the foundation of every chewy, flavor-packed strip.</p>
              <Link href="/rituals" className="inline-flex items-center gap-3 text-[10px] tracking-widest uppercase font-bold text-[#0A1118] group-hover:text-accent transition">
                Read Entry
                <span className="w-7 h-7 rounded-full border border-[#0A1118]/20 flex items-center justify-center group-hover:border-accent transition"><ArrowRight className="w-3.5 h-3.5" /></span>
              </Link>
            </article>

            {/* Card 2 */}
            <article className="group cursor-pointer reveal delay-[100ms]">
              <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden mb-5 shadow-sm">
                <img src="/images/bangkok-mango-beetroot-2.png" alt="Understanding Mango Varietals" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
                <span className="absolute top-4 left-4 bg-white/90 text-accent text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">Varietals</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted tracking-widest uppercase mb-3 font-semibold">
                <span>March 08, 2024</span>
                <span className="w-1 h-1 rounded-full bg-muted/50"></span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 4 Min Read</span>
              </div>
              <h3 className="text-lg md:text-xl font-serif font-semibold uppercase tracking-tight text-[#0A1118] mb-3 group-hover:text-accent transition">Understanding Mango Varietals</h3>
              <p className="text-[13px] text-muted leading-relaxed mb-5">Nam Dok Mai, Kaew, or Nam Dok Mai See Thong — what makes each Thai mango varietal unique.</p>
              <Link href="/rituals" className="inline-flex items-center gap-3 text-[10px] tracking-widest uppercase font-bold text-[#0A1118] group-hover:text-accent transition">
                Read Entry
                <span className="w-7 h-7 rounded-full border border-[#0A1118]/20 flex items-center justify-center group-hover:border-accent transition"><ArrowRight className="w-3.5 h-3.5" /></span>
              </Link>
            </article>

            {/* Card 3 */}
            <article className="group cursor-pointer reveal delay-[200ms]">
              <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden mb-5 shadow-sm">
                <img src="/images/bangkok-mango-beetroot-1.png" alt="Ways to Enjoy Dried Mango" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
                <span className="absolute top-4 left-4 bg-white/90 text-accent text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">Ingredients</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted tracking-widest uppercase mb-3 font-semibold">
                <span>Feb 28, 2024</span>
                <span className="w-1 h-1 rounded-full bg-muted/50"></span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 6 Min Read</span>
              </div>
              <h3 className="text-lg md:text-xl font-serif font-semibold uppercase tracking-tight text-[#0A1118] mb-3 group-hover:text-accent transition">Ways to Enjoy Dried Mango</h3>
              <p className="text-[13px] text-muted leading-relaxed mb-5">A closer look at the ingredients behind our most-loved flavors, and how to pair them.</p>
              <Link href="/rituals" className="inline-flex items-center gap-3 text-[10px] tracking-widest uppercase font-bold text-[#0A1118] group-hover:text-accent transition">
                Read Entry
                <span className="w-7 h-7 rounded-full border border-[#0A1118]/20 flex items-center justify-center group-hover:border-accent transition"><ArrowRight className="w-3.5 h-3.5" /></span>
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* AI Skin Expert */}
      <section id="skin-consultant" className="flex flex-col lg:flex-row min-h-[70vh]">
        {/* Image */}
        <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-auto">
          <img src="/images/bangkok-mango-beetroot-1.png" alt="Thai Mango orchard" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-6 left-6 right-6 lg:right-auto lg:max-w-xs bg-charcoal/70 backdrop-blur-sm rounded-2xl p-5">
            <h3 className="text-ivory text-xs font-bold tracking-widest uppercase mb-2">Hand-Picked Quality</h3>
            <p className="text-ivory/70 text-xs leading-relaxed">Blending orchard heritage with careful ripeness testing for a snack that&apos;s actually worth it.</p>
          </div>
        </div>

        {/* Panel */}
        <div className="w-full lg:w-1/2 bg-accent flex items-center p-8 md:p-16">
          <div className="max-w-lg">
            <h2 className="text-ivory text-2xl md:text-3xl font-serif font-bold uppercase tracking-tight mb-5">Your Mango Flavor Expert</h2>
            <p className="text-ivory/90 text-sm md:text-base leading-relaxed mb-8">
              {content(
                "expert_intro",
                "Tell us your taste preferences — sweet, spicy, tangy, or classic — and we'll point you toward the flavors that fit, or connect you with our team for bulk and gifting orders."
              )}
            </p>

            <form
              className="flex flex-col sm:flex-row gap-3 mb-6"
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Thank you! Your request has been received.");
                e.currentTarget.reset();
              }}
            >
              <input type="text" placeholder="Describe your taste preferences…" className="flex-1 px-5 py-4 rounded-full text-charcoal text-sm bg-ivory focus:outline-none" />
              <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-charcoal text-ivory text-sm font-semibold rounded-full hover:bg-black transition shrink-0">
                <MessageCircle className="w-4 h-4" /> Get My Recommendation
              </button>
            </form>

            <Link href="/contact" className="inline-flex items-center gap-3 px-6 py-3.5 border border-ivory/40 text-ivory text-[10px] md:text-xs tracking-widest uppercase font-bold rounded-full hover:bg-ivory/10 transition">
              <Stethoscope className="w-4 h-4" /> Talk to Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-32 bg-cream text-center border-t border-cream reveal">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">{t("join_circle_title")}</h2>
          <p className="text-muted text-sm md:text-base mb-10 leading-relaxed">{t("join_circle_desc")}</p>

          <form
            className="flex flex-col sm:flex-row gap-4 mb-6"
            onSubmit={(e) => {
              e.preventDefault();
              showToast("Thank you! Your request has been received.");
              e.currentTarget.reset();
            }}
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-transparent border-b border-charcoal py-3 px-2 focus:outline-none focus:border-accent text-sm transition text-center sm:text-left"
              required
            />
            <button type="submit" className="px-8 py-3.5 bg-charcoal text-ivory text-xs tracking-widest uppercase hover:bg-accent transition duration-300">
              {t("join_circle_btn")}
            </button>
          </form>
          <p className="text-[10px] text-muted uppercase tracking-widest">By subscribing, you agree to receive updates from Thai Mango.</p>
        </div>
      </section>

      {/* Trust / Quality Pillars */}
      <section className="py-16 bg-[#52091E] text-white border-y border-gold/20 reveal">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#E5B869] font-bold">Quality &amp; Authenticity</span>
            <h2 className="font-serif text-3xl md:text-4xl text-white mt-2">The Thai Mango Standard</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-10 md:gap-y-4 gap-x-6 md:gap-x-4 text-center">
            {/* 1 */}
            <div className="px-2 md:px-3 flex flex-col items-center group">
              <span className="w-14 h-14 rounded-full border-2 border-gold flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22V10"></path>
                  <path d="M12 10C12 5 8 3 4 3c0 5 2 9 8 9"></path>
                  <path d="M12 14c0-4 3-7 8-7 0 4-2 7-8 7"></path>
                  <line x1="8" y1="22" x2="16" y2="22"></line>
                </svg>
              </span>
              <h3 className="text-sm font-semibold text-white mb-0.5">ธรรมชาติ 100%</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#E5B869] font-bold mb-2">100% Natural</p>
              <p className="text-xs text-white/70">Pure natural fruit with zero artificial preservatives.</p>
            </div>

            {/* 2 */}
            <div className="px-2 md:px-3 flex flex-col items-center group">
              <span className="w-14 h-14 rounded-full border-2 border-gold flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 4c-1.2-1.8-3-2.5-5-1.8 0 2.8 1.8 3.8 4.8 3.8"></path>
                  <path d="M9.8 6.5C6 6.5 3 10.2 4 15c1 4.8 5.8 6.8 8.8 4.8 4-2.8 5-8.8 3-11.8-1.5-1.8-3.8-2.2-6-1.5z"></path>
                  <path d="M10 4.5c1-1.5 2-2 3-2"></path>
                </svg>
              </span>
              <h3 className="text-sm font-semibold text-white mb-0.5">คัดสรรจากมะม่วงคุณภาพ</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#E5B869] font-bold mb-2">Finest Quality Mango</p>
              <p className="text-xs text-white/70">Hand-selected ripe mangoes for maximum sweetness and aroma.</p>
            </div>

            {/* 3 */}
            <div className="px-2 md:px-3 flex flex-col items-center group">
              <span className="w-14 h-14 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300">
                <svg className="w-14 h-9 drop-shadow-md" viewBox="0 0 54 36" fill="none">
                  <path d="M2 10C12 2 24 20 34 10C40 4 48 12 52 8V24C48 28 40 20 34 26C24 36 12 18 2 26V10Z" fill="#ED1C24" />
                  <path d="M2 13C12 5 24 23 34 13C40 7 48 15 52 11V21C48 25 40 17 34 23C24 33 12 15 2 23V13Z" fill="#FFFFFF" />
                  <path d="M2 15.5C12 7.5 24 25.5 34 15.5C40 9.5 48 17.5 52 13.5V18.5C48 22.5 40 14.5 34 20.5C24 30.5 12 12.5 2 20.5V15.5Z" fill="#241D4F" />
                </svg>
              </span>
              <h3 className="text-sm font-semibold text-white mb-0.5">ผลิตในประเทศไทย</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#E5B869] font-bold mb-2">Product of Thailand</p>
              <p className="text-xs text-white/70">Authentically produced and packed in Thailand.</p>
            </div>

            {/* 4 */}
            <div className="px-2 md:px-3 flex flex-col items-center group">
              <span className="w-14 h-14 rounded-full border-2 border-gold flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5.5 14c1 4.5 4.5 6.5 8.5 6.5 4 0 7-3 7-7 0-3.2-2.2-5.2-4.5-5.2-3 0-5 2-6.5 4-2 0-3.5 1-4.5 1.7z"></path>
                  <circle cx="9" cy="8" r="1" fill="currentColor"></circle>
                  <circle cx="15" cy="7" r="0.8" fill="currentColor"></circle>
                  <path d="M7 6l.4 1.2L8.5 7.5l-1.1.4L7 9l-.4-1.1L5.5 7.5l1.1-.3L7 6z" fill="currentColor"></path>
                </svg>
              </span>
              <h3 className="text-sm font-semibold text-white mb-0.5">อร่อย เพลิน เคี้ยวหนึบ</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#E5B869] font-bold mb-2">Delicious &amp; Chewy</p>
              <p className="text-xs text-white/70">Gently dried for that irresistibly soft, chewy mouthfeel.</p>
            </div>

            {/* 5 */}
            <div className="col-span-2 md:col-span-1 px-2 md:px-3 flex flex-col items-center group max-w-xs mx-auto">
              <span className="w-14 h-14 rounded-full border-2 border-gold flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="5.5" r="2.2"></circle>
                  <path d="M5.5 21v-5a3 3 0 0 1 5.5 0v5"></path>
                  <circle cx="16.5" cy="7" r="1.8"></circle>
                  <path d="M14 21v-4a2.5 2.5 0 0 1 5 0v4"></path>
                </svg>
              </span>
              <h3 className="text-sm font-semibold text-white mb-0.5">เหมาะสำหรับทุกวัย</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#E5B869] font-bold mb-2">For All Ages</p>
              <p className="text-xs text-white/70">Wholesome, guilt-free snacking for kids and adults alike.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
