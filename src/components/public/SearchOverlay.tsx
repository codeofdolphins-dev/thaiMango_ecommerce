"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "./store";
import { minPrice } from "@/lib/variants";
import { productImage } from "@/lib/images";

interface SearchProduct {
  id: string;
  slug: string;
  name_en: string;
  images: string[];
  category: { slug: string; name_en: string };
  productVariant: { price: string; is_default: boolean; stock: number }[];
}

interface PublicCategory {
  id: number;
  slug: string;
  name_en: string;
}

/* Real content pages — static by nature, not catalog data */
const CONTENT_PAGES = [
  { title: "Our Orchard Story & Heritage", category: "Story", url: "/about", tags: ["story", "about", "heritage", "history", "thailand"] },
  { title: "100% Thai Natural Ingredients", category: "Ingredients", url: "/ingredients", tags: ["ingredients", "natural", "mango", "chili", "honey", "beetroot"] },
  { title: "Mango Rituals & Recipe Guide", category: "Guide", url: "/rituals", tags: ["rituals", "guide", "recipes", "pairings", "snacking"] },
  { title: "FAQ & Advice", category: "Support", url: "/faq", tags: ["faq", "help", "questions", "shipping"] },
];

export default function SearchOverlay() {
  const { searchOpen, closeSearch, formatPrice } = useStore();
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const productsQuery = useQuery({
    queryKey: ["search-products", debouncedQ],
    enabled: debouncedQ.length > 0,
    queryFn: async (): Promise<SearchProduct[]> => {
      const res = await fetch(
        `/api/products?search=${encodeURIComponent(debouncedQ)}&limit=6`
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Search failed");
      return body.data.products;
    },
  });

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

  const q = debouncedQ.toLowerCase();
  const productMatches = productsQuery.data ?? [];
  const pageMatches = q
    ? CONTENT_PAGES.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.includes(q))
      )
    : [];
  const searching = query.trim().length > 0;
  const loading = productsQuery.isPending && debouncedQ.length > 0;
  const noResults =
    searching && !loading && productMatches.length === 0 && pageMatches.length === 0;

  return (
    <div
      id="search-overlay"
      className={`fixed inset-0 bg-ivory/95 backdrop-blur-md z-50 transition-opacity duration-300 flex flex-col items-center justify-center px-6 ${
        searchOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <button
        id="close-search"
        className="absolute top-8 right-8 p-2 text-muted hover:text-charcoal transition"
        aria-label="Close search"
        onClick={closeSearch}
      >
        <X className="w-8 h-8 font-light" />
      </button>

      <div className="w-full max-w-3xl">
        <form
          className="relative border-b-2 border-charcoal pb-4 mb-12"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            id="search-input"
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, guides..."
            className="w-full bg-transparent text-3xl md:text-5xl font-serif focus:outline-none placeholder:text-muted/50"
          />
          <button
            type="submit"
            className="absolute right-0 bottom-4 text-charcoal hover:text-accent transition"
          >
            <ArrowRight className="w-8 h-8" />
          </button>
        </form>

        {/* Live results */}
        {searching ? (
          <div
            id="live-search-results"
            className="max-w-2xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto no-scrollbar"
          >
            {loading ? (
              <div className="col-span-2 text-center py-6 text-muted text-xs">
                Searching…
              </div>
            ) : noResults ? (
              <div className="col-span-2 text-center py-6 text-muted text-xs">
                No results matching &quot;<strong>{query}</strong>&quot;.
              </div>
            ) : (
              <>
                {productMatches.map((p) => (
                  <Link
                    key={p.id}
                    href={`/shop?category=${encodeURIComponent(p.category.slug)}`}
                    className="flex items-center gap-3 p-3 bg-white hover:bg-cream rounded-2xl border border-cream transition group shadow-sm"
                    onClick={closeSearch}
                  >
                    <img
                      src={productImage(p.images)}
                      alt={p.name_en}
                      className="w-12 h-12 object-cover rounded-xl bg-cream shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase tracking-wider text-accent font-bold block">
                        {p.category.name_en}
                      </span>
                      <h5 className="text-xs font-semibold text-charcoal group-hover:text-accent transition truncate">
                        {p.name_en}
                      </h5>
                      {minPrice(p.productVariant) !== null && (
                        <span className="text-[11px] text-muted font-medium">
                          {p.productVariant.length > 1 ? "From " : ""}
                          {formatPrice(Number(minPrice(p.productVariant)))}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
                {pageMatches.map((item) => (
                  <Link
                    key={item.url}
                    href={item.url}
                    className="flex items-center gap-3 p-3 bg-white hover:bg-cream rounded-2xl border border-cream transition group shadow-sm"
                    onClick={closeSearch}
                  >
                    <img
                      src="/brand/logo.svg"
                      alt={item.title}
                      className="w-12 h-12 object-contain p-1 rounded-xl bg-cream shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase tracking-wider text-accent font-bold block">
                        {item.category}
                      </span>
                      <h5 className="text-xs font-semibold text-charcoal group-hover:text-accent transition truncate">
                        {item.title}
                      </h5>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        ) : (
          <div>
            <h4 className="text-[10px] tracking-widest uppercase text-muted mb-6 font-semibold">
              Browse Categories
            </h4>
            <div className="flex flex-wrap gap-3">
              {(categoriesQuery.data ?? []).map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${encodeURIComponent(c.slug)}`}
                  className="px-5 py-2.5 border border-cream rounded-full text-xs hover:border-accent hover:text-accent transition bg-white/50"
                  onClick={closeSearch}
                >
                  {c.name_en}
                </Link>
              ))}
              <Link
                href="/shop"
                className="px-5 py-2.5 border border-cream rounded-full text-xs hover:border-accent hover:text-accent transition bg-white/50"
                onClick={closeSearch}
              >
                All Products
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
