"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Eye } from "lucide-react";
import { useStore } from "@/components/public/store";

interface Badge {
  text: string;
  className: string;
}

interface Product {
  id: number;
  category: string;
  image: string;
  alt: string;
  badges: Badge[];
  weight: string;
  name: string;
  desc: string;
  price: number;
  priceDisplay: string;
  comparePrice?: string;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    category: "Classic Cuts",
    image: "/images/bangkok-mango-beetroot-1.png",
    alt: "Thai Mango Classic Sun-Dried Strips",
    badges: [
      {
        text: "Best Seller",
        className:
          "bg-[#F29F86] text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm",
      },
      {
        text: "No Sugar Added",
        className:
          "bg-charcoal text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm",
      },
    ],
    weight: "100G Pouch",
    name: "Thai Mango Classic Sun-Dried Strips",
    desc: "Naturally sun-dried Thai mango strips with no sugar added — just soft, chewy, sun-ripened sweetness.",
    price: 390,
    priceDisplay: "₹390",
    comparePrice: "₹430",
  },
  {
    id: 2,
    category: "Spiced & Zesty",
    image: "/images/bangkok-mango-beetroot-1.png",
    alt: "Thai Mango Chili Lime Bites",
    badges: [
      {
        text: "Sweet, Sour & Spicy",
        className:
          "bg-charcoal text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm",
      },
    ],
    weight: "100G Pouch",
    name: "Thai Mango Chili Lime Bites",
    desc: "Sun-dried mango tossed in Thai chili and lime for a bold sweet-sour-spicy kick in every bite.",
    price: 430,
    priceDisplay: "₹430",
  },
  {
    id: 3,
    category: "Glazed & Sweet",
    image: "/images/bangkok-mango-beetroot-2.png",
    alt: "Thai Mango Honey Glazed Slices",
    badges: [
      {
        text: "Wildflower Honey",
        className:
          "bg-gold text-charcoal text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm",
      },
    ],
    weight: "150G Pack",
    name: "Thai Mango Honey Glazed Slices",
    desc: "Soft, glossy mango slices finished with a wildflower honey glaze for an extra-indulgent bite.",
    price: 450,
    priceDisplay: "₹450",
  },
  {
    id: 4,
    category: "Fusion Blends",
    image: "/images/bangkok-mango-beetroot-2.png",
    alt: "Thai Mango Beetroot Fusion Chews",
    badges: [
      {
        text: "100% Natural",
        className:
          "bg-beetroot text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm",
      },
      {
        text: "Product of Thailand",
        className:
          "bg-gold text-charcoal text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm",
      },
    ],
    weight: "100G Pouch",
    name: "Thai Mango Beetroot Fusion Chews",
    desc: "Real dried Thai mango infused with natural beetroot for vibrant color, earthy sweetness, and antioxidants.",
    price: 410,
    priceDisplay: "₹410",
  },
  {
    id: 5,
    category: "Gift Sets",
    image: "/images/bangkok-mango-beetroot-1.png",
    alt: "Thai Mango Discovery Gift Box",
    badges: [
      {
        text: "All 4 Flavors",
        className:
          "bg-[#8C2442] text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm",
      },
    ],
    weight: "4 x 100G Pouches",
    name: "Thai Mango Discovery Gift Box",
    desc: "Can't decide? This variety box bundles all four Thai Mango flavors in one beautifully packaged gift set.",
    price: 1450,
    priceDisplay: "₹1,450",
    comparePrice: "₹1,600",
  },
  {
    id: 6,
    category: "Gift Sets",
    image: "/images/bangkok-mango-beetroot-2.png",
    alt: "Thai Mango Duo Gift Set",
    badges: [
      {
        text: "Gift Box",
        className:
          "bg-gold text-charcoal text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm",
      },
    ],
    weight: "2 x 100G Duo Pack",
    name: "Thai Mango Duo Gift Set",
    desc: "Our Classic Sun-Dried Strips paired with Chili Lime Bites in one gift-ready duo pack.",
    price: 780,
    priceDisplay: "₹780",
    comparePrice: "₹860",
  },
];

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All Items" },
  { value: "Classic Cuts", label: "Classic Cuts" },
  { value: "Spiced & Zesty", label: "Spiced & Zesty" },
  { value: "Glazed & Sweet", label: "Glazed & Sweet" },
  { value: "Fusion Blends", label: "Fusion Blends" },
  { value: "Gift Sets", label: "Gift Sets" },
];

/* Reads ?category= inside its own Suspense boundary so the catalog itself
   stays in the server-rendered HTML (a page-wide boundary would strip it). */
function CategoryParamSync({
  onCategory,
}: {
  onCategory: (c: string) => void;
}) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  useEffect(() => {
    if (categoryParam && FILTERS.some((f) => f.value === categoryParam)) {
      onCategory(categoryParam);
    }
  }, [categoryParam, onCategory]);
  return null;
}

function ShopPageContent() {
  const { addToCart, openQuickView } = useStore();
  const [activeFilter, setActiveFilter] = useState("all");

  const visibleProducts = PRODUCTS.filter(
    (p) => activeFilter === "all" || p.category === activeFilter
  );

  return (
    <main>
      <Suspense fallback={null}>
        <CategoryParamSync onCategory={setActiveFilter} />
      </Suspense>
      {/* Page Header & Breadcrumbs */}
      <section className="bg-cream/60 border-b border-cream py-12 md:py-16">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <nav className="flex items-center gap-2 text-xs text-muted uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-charcoal transition">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-charcoal font-semibold">Shop All Products</span>
          </nav>
          <h1 className="font-serif text-4xl md:text-6xl text-charcoal mb-4">
            The Complete Collection
          </h1>
          <p className="text-sm md:text-base text-muted max-w-2xl leading-relaxed">
            Discover our full range of naturally sun-dried Thai mango, from classic
            sun-dried strips to our iconic beetroot fusion chews and gift-ready
            variety boxes.
          </p>
        </div>
      </section>

      {/* Catalog Section with Filters */}
      <section className="py-12 md:py-16 bg-[#F8F6F2]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          {/* Category Tabs & Sorting Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 pb-6 border-b border-cream">
            <div className="flex flex-wrap gap-2.5">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  data-filter={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={
                    activeFilter === f.value
                      ? "filter-btn active filter-tab px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-charcoal text-white transition"
                      : "filter-btn filter-tab px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-muted hover:text-charcoal hover:bg-cream/60 transition border border-cream"
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
              <span className="text-xs text-muted font-medium">Showing 6 Products</span>
              <select className="bg-white border border-cream rounded-full px-4 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-accent">
                <option>Featured First</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Best Selling</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="product-card bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col"
                data-product-id={product.id}
                data-category={product.category}
              >
                <div className="relative aspect-[4/3.8] overflow-hidden bg-[#FAF8F5]">
                  <img
                    src={product.image}
                    alt={product.alt}
                    className="product-image w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {product.badges.map((badge, i) => (
                      <span key={i} className={badge.className}>
                        {badge.text}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      openQuickView({
                        name: product.name,
                        price: product.priceDisplay,
                        image: product.image,
                        desc: product.desc,
                      })
                    }
                    className="quick-view-btn absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-charcoal shadow hover:bg-accent hover:text-white transition"
                    aria-label="Quick View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase font-bold text-accent mb-1.5 block">
                      {product.weight}
                    </span>
                    <h3 className="product-name font-serif text-2xl text-charcoal mb-2 hover:text-accent transition">
                      <Link href="/product-detail">{product.name}</Link>
                    </h3>
                    <p className="product-desc text-xs text-muted line-clamp-2 leading-relaxed mb-6">
                      {product.desc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-cream flex items-center justify-between">
                    <div>
                      <span className="product-price font-serif text-xl font-semibold text-charcoal">
                        {product.priceDisplay}
                      </span>
                      {product.comparePrice && (
                        <span className="text-xs text-muted line-through ml-1.5">
                          {product.comparePrice}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          name: product.name,
                          price: product.price,
                          image: product.image,
                        })
                      }
                      className="add-to-cart px-5 py-2.5 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-accent transition duration-300"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality & Origin 5-Badge Banner (Mobile 2x2+1 responsive format) */}
      <div className="relative z-10 w-full border-t border-gold/30 bg-beetroot text-white reveal">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 py-10 md:py-6 grid grid-cols-2 md:grid-cols-5 gap-y-10 md:gap-y-0 gap-x-6 md:gap-x-0 md:divide-x md:divide-gold/30 text-center items-center">
          {/* 1: 100% Natural */}
          <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
            <span className="w-14 h-14 md:w-14 md:h-14 rounded-full border-2 border-gold flex items-center justify-center text-gold mb-3 group-hover:scale-110 group-hover:bg-gold/10 transition-all duration-300 shadow-sm">
              <svg
                className="w-7 h-7 md:w-7 md:h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22V10"></path>
                <path d="M12 10C12 5 8 3 4 3c0 5 2 9 8 9"></path>
                <path d="M12 14c0-4 3-7 8-7 0 4-2 7-8 7"></path>
                <line x1="8" y1="22" x2="16" y2="22"></line>
              </svg>
            </span>
            <span className="text-sm md:text-sm font-semibold tracking-wide text-white mb-1">
              ธรรมชาติ 100%
            </span>
            <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-gold">
              100% NATURAL
            </span>
          </div>

          {/* 2: Finest Quality Mango */}
          <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
            <span className="w-14 h-14 md:w-14 md:h-14 rounded-full border-2 border-gold flex items-center justify-center text-gold mb-3 group-hover:scale-110 group-hover:bg-gold/10 transition-all duration-300 shadow-sm">
              <svg
                className="w-7 h-7 md:w-7 md:h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 4c-1.2-1.8-3-2.5-5-1.8 0 2.8 1.8 3.8 4.8 3.8"></path>
                <path d="M9.8 6.5C6 6.5 3 10.2 4 15c1 4.8 5.8 6.8 8.8 4.8 4-2.8 5-8.8 3-11.8-1.5-1.8-3.8-2.2-6-1.5z"></path>
                <path d="M10 4.5c1-1.5 2-2 3-2"></path>
              </svg>
            </span>
            <span className="text-sm md:text-sm font-semibold tracking-wide text-white mb-1">
              คัดสรรจากมะม่วงคุณภาพ
            </span>
            <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-gold">
              FINEST QUALITY MANGO
            </span>
          </div>

          {/* 3: Product of Thailand */}
          <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
            <span className="w-14 h-14 md:w-14 md:h-14 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300">
              <svg
                className="w-14 h-9 md:w-14 md:h-9 drop-shadow-md"
                viewBox="0 0 54 36"
                fill="none"
              >
                <path
                  d="M2 10C12 2 24 20 34 10C40 4 48 12 52 8V24C48 28 40 20 34 26C24 36 12 18 2 26V10Z"
                  fill="#ED1C24"
                />
                <path
                  d="M2 13C12 5 24 23 34 13C40 7 48 15 52 11V21C48 25 40 17 34 23C24 33 12 15 2 23V13Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M2 15.5C12 7.5 24 25.5 34 15.5C40 9.5 48 17.5 52 13.5V18.5C48 22.5 40 14.5 34 20.5C24 30.5 12 12.5 2 20.5V15.5Z"
                  fill="#241D4F"
                />
              </svg>
            </span>
            <span className="text-sm md:text-sm font-semibold tracking-wide text-white mb-1">
              ผลิตในประเทศไทย
            </span>
            <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-gold">
              PRODUCT OF THAILAND
            </span>
          </div>

          {/* 4: Delicious & Chewy */}
          <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
            <span className="w-14 h-14 md:w-14 md:h-14 rounded-full border-2 border-gold flex items-center justify-center text-gold mb-3 group-hover:scale-110 group-hover:bg-gold/10 transition-all duration-300 shadow-sm">
              <svg
                className="w-7 h-7 md:w-7 md:h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5.5 14c1 4.5 4.5 6.5 8.5 6.5 4 0 7-3 7-7 0-3.2-2.2-5.2-4.5-5.2-3 0-5 2-6.5 4-2 0-3.5 1-4.5 1.7z"></path>
                <circle cx="9" cy="8" r="1" fill="currentColor"></circle>
                <circle cx="15" cy="7" r="0.8" fill="currentColor"></circle>
                <path
                  d="M7 6l.4 1.2L8.5 7.5l-1.1.4L7 9l-.4-1.1L5.5 7.5l1.1-.3L7 6z"
                  fill="currentColor"
                ></path>
              </svg>
            </span>
            <span className="text-sm md:text-sm font-semibold tracking-wide text-white mb-1">
              อร่อย เพลิน เคี้ยวหนึบ
            </span>
            <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-gold">
              DELICIOUS &amp; CHEWY
            </span>
          </div>

          {/* 5: For All Ages */}
          <div className="col-span-2 md:col-span-1 px-2 md:px-4 flex flex-col items-center justify-center group max-w-xs mx-auto">
            <span className="w-14 h-14 md:w-14 md:h-14 rounded-full border-2 border-gold flex items-center justify-center text-gold mb-3 group-hover:scale-110 group-hover:bg-gold/10 transition-all duration-300 shadow-sm">
              <svg
                className="w-7 h-7 md:w-7 md:h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="5.5" r="2.2"></circle>
                <path d="M5.5 21v-5a3 3 0 0 1 5.5 0v5"></path>
                <circle cx="16.5" cy="7" r="1.8"></circle>
                <path d="M14 21v-4a2.5 2.5 0 0 1 5 0v4"></path>
              </svg>
            </span>
            <span className="text-sm md:text-sm font-semibold tracking-wide text-white mb-1">
              เหมาะสำหรับทุกวัย
            </span>
            <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-gold">
              FOR ALL AGES
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ShopPage() {
  return <ShopPageContent />;
}
