"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { siteSearchDatabase } from "@/lib/site-data";
import { useStore } from "./store";

export default function SearchOverlay() {
  const { searchOpen, closeSearch } = useStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  const q = query.trim().toLowerCase();
  const matches = q
    ? siteSearchDatabase.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.includes(q))
      )
    : [];

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
            placeholder="Search for rituals, ingredients..."
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
        {q ? (
          <div
            id="live-search-results"
            className="max-w-2xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto no-scrollbar"
          >
            {matches.length === 0 ? (
              <div className="col-span-2 text-center py-6 text-muted text-xs">
                No results matching &quot;<strong>{query}</strong>&quot;. Try
                searching <em>&quot;chili&quot;</em>, <em>&quot;mango&quot;</em>,
                or <em>&quot;gift box&quot;</em>.
              </div>
            ) : (
              matches.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className="flex items-center gap-3 p-3 bg-white hover:bg-cream rounded-2xl border border-cream transition group shadow-sm"
                  onClick={closeSearch}
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-12 h-12 object-cover rounded-xl bg-cream shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wider text-accent font-bold block">
                      {item.category}
                    </span>
                    <h5 className="text-xs font-semibold text-charcoal group-hover:text-accent transition truncate">
                      {item.title}
                    </h5>
                    <span className="text-[11px] text-muted font-medium">
                      {item.price}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : (
          <div>
            <h4 className="text-[10px] tracking-widest uppercase text-muted mb-6 font-semibold">
              Suggested Searches
            </h4>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop?search=Chili+Lime"
                className="px-5 py-2.5 border border-cream rounded-full text-xs hover:border-accent hover:text-accent transition bg-white/50"
                onClick={closeSearch}
              >
                Chili Lime
              </Link>
              <Link
                href="/shop?category=Classic+Cuts"
                className="px-5 py-2.5 border border-cream rounded-full text-xs hover:border-accent hover:text-accent transition bg-white/50"
                onClick={closeSearch}
              >
                Classic Cuts
              </Link>
              <Link
                href="/shop?search=Honey+Glazed"
                className="px-5 py-2.5 border border-cream rounded-full text-xs hover:border-accent hover:text-accent transition bg-white/50"
                onClick={closeSearch}
              >
                Honey Glazed
              </Link>
              <Link
                href="/shop?category=Gift+Sets"
                className="px-5 py-2.5 border border-cream rounded-full text-xs hover:border-accent hover:text-accent transition bg-white/50"
                onClick={closeSearch}
              >
                Gift Sets
              </Link>
              <Link
                href="/shop?category=Bestsellers"
                className="px-5 py-2.5 border border-cream rounded-full text-xs hover:border-accent hover:text-accent transition bg-white/50"
                onClick={closeSearch}
              >
                Best Sellers
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
