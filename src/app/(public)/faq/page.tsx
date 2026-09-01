"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Apple,
  Truck,
  ChevronDown,
  Search,
  X,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react";
import { useStore } from "@/components/public/store";
import { DEFAULT_SETTINGS } from "@/schemas/settings.schema";
import {
  FAQ_CATEGORIES,
  FAQ_DEFAULTS,
  FaqCategoryId,
} from "@/schemas/faq.schema";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

interface FaqRow extends FaqItem {
  category: string;
  position: number;
  is_active: boolean;
}

const CATEGORY_ICONS: Record<
  FaqCategoryId,
  React.ComponentType<{ className?: string }>
> = {
  ingredients: Sparkles,
  snacks: Apple,
  shipping: Truck,
};

/* Pre-fetch fallback — the seeded launch set, with synthetic ids that can
   never collide with real (positive) DB ids. */
const FALLBACK_ROWS: FaqRow[] = FAQ_DEFAULTS.map((f, i) => ({
  id: -(i + 1),
  category: f.category,
  question: f.question,
  answer: f.answer,
  position: f.position,
  is_active: true,
}));


function FaqAccordionItem({
  item,
  index,
  open,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`accordion-item group bg-white rounded-2xl border transition-all duration-300 ${
        open
          ? "active border-accent/25 shadow-xl shadow-accent/5"
          : "border-cream hover:border-accent/20 hover:shadow-md hover:shadow-charcoal/5"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-5 md:p-6 text-left cursor-pointer"
      >
        <span className="hidden md:block font-serif text-xl text-accent/40 w-8 shrink-0 select-none">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex-1 text-sm md:text-base font-semibold text-charcoal">
          {item.question}
        </span>
        <span
          className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition ${
            open
              ? "border-accent bg-accent text-white"
              : "border-cream text-accent group-hover:border-accent/40"
          }`}
        >
          <ChevronDown className="accordion-chevron w-4 h-4" />
        </span>
      </button>
      <div className="accordion-panel">
        <div className="px-5 md:px-6 pb-5 md:pb-6 md:pl-[4.5rem]">
          <span className="block w-10 h-px bg-accent/30 mb-3" />
          <p className="text-xs md:text-sm text-muted leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const { settings } = useStore();
  /* null = untouched → the very first answer renders open by default. */
  const [openItems, setOpenItems] = useState<Set<number> | null>(null);
  const [query, setQuery] = useState("");

  const supportEmail = settings?.support_email || DEFAULT_SETTINGS.support_email;
  const supportPhone = settings?.support_phone || DEFAULT_SETTINGS.support_phone;

  /* Admin-managed FAQs; the seeded launch set fills in until the API answers. */
  const faqsQuery = useQuery({
    queryKey: ["public-faqs"],
    queryFn: async (): Promise<FaqRow[]> => {
      const res = await fetch("/api/faqs");
      if (!res.ok) throw new Error("Failed to load FAQs");
      const body = await res.json();
      return body.data as FaqRow[];
    },
    staleTime: 5 * 60 * 1000,
  });
  const rows = faqsQuery.data ?? FALLBACK_ROWS;

  const allCategories = useMemo(
    () =>
      FAQ_CATEGORIES.map((meta) => ({
        ...meta,
        Icon: CATEGORY_ICONS[meta.id],
        items: rows
          .filter((r) => r.category === meta.id && r.is_active)
          .sort((a, b) => a.position - b.position || a.id - b.id),
      })).filter((cat) => cat.items.length > 0),
    [rows]
  );
  const totalAnswers = allCategories.reduce((n, c) => n + c.items.length, 0);

  const firstId = allCategories[0]?.items[0]?.id;
  const effectiveOpen =
    openItems ?? new Set(firstId !== undefined ? [firstId] : []);

  const toggleItem = (id: number) => {
    const next = new Set(effectiveOpen);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setOpenItems(next);
  };

  /* Live search across questions and answers — matched items render open. */
  const q = query.trim().toLowerCase();
  const visibleCategories = useMemo(() => {
    if (!q) return allCategories;
    return allCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.question.toLowerCase().includes(q) ||
            item.answer.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [q, allCategories]);
  const matchCount = q
    ? visibleCategories.reduce((n, c) => n + c.items.length, 0)
    : 0;

  return (
    <main>
      {/* FAQ Hero */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-burgundy text-white text-center">
        {/* Layered glows + ghost mark — decorative only */}
        <div className="absolute inset-0 bg-gradient-to-b from-burgundy via-beetroot/80 to-burgundy" aria-hidden="true" />
        <div className="absolute -top-28 -right-20 w-[28rem] h-[28rem] rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-36 -left-24 w-[26rem] h-[26rem] rounded-full bg-mango/10 blur-3xl" aria-hidden="true" />
        <span
          className="absolute -top-10 left-1/2 -translate-x-1/2 font-serif text-[22rem] leading-none text-white/[0.04] select-none pointer-events-none"
          aria-hidden="true"
        >
          ?
        </span>

        <div className="relative max-w-3xl mx-auto px-6">
          <span className="flex items-center justify-center gap-4 mb-5">
            <span className="h-px w-10 bg-gold/50" aria-hidden="true" />
            <span className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold">
              Help Center
            </span>
            <span className="h-px w-10 bg-gold/50" aria-hidden="true" />
          </span>
          <h1 className="font-serif text-4xl md:text-6xl mb-6">
            Frequently Asked <em className="italic text-gold">Questions</em>
          </h1>
          <p className="text-white/75 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-10">
            Find clear answers about our dried mango snacks, shipping timelines,
            shelf life, and orders — or search all {totalAnswers} answers below.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gold/80 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "shelf life", "spicy", "delivery"…'
              aria-label="Search frequently asked questions"
              className="w-full pl-12 pr-12 py-4 rounded-full bg-white/10 border border-white/15 backdrop-blur text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold/60 focus:bg-white/15 transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {q && (
            <p className="mt-4 text-xs tracking-widest uppercase text-gold/80">
              {matchCount === 0
                ? "No matching answers"
                : `${matchCount} answer${matchCount === 1 ? "" : "s"} found`}
            </p>
          )}
        </div>
      </section>

      {/* FAQ Body */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Topic rail */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-28 space-y-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3 block">
                    Browse By Topic
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-6">
                    How can we help?
                  </h2>
                  <div className="space-y-3">
                    {allCategories.map((cat) => (
                      <a
                        key={cat.id}
                        href={`#${cat.id}`}
                        className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-cream hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition"
                      >
                        <span className="w-11 h-11 rounded-full bg-ivory border border-cream flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white group-hover:border-accent transition">
                          <cat.Icon className="w-5 h-5" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-charcoal">
                            {cat.label}
                          </span>
                          <span className="block text-[11px] text-muted mt-0.5">
                            {cat.items.length} answer{cat.items.length === 1 ? "" : "s"}
                          </span>
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted/50 group-hover:text-accent group-hover:translate-x-0.5 transition" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Quick support card */}
                <div className="relative overflow-hidden p-6 rounded-3xl bg-burgundy text-white">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gold/15 blur-2xl" aria-hidden="true" />
                  <span className="relative text-[10px] tracking-[0.25em] uppercase text-gold font-bold mb-2 block">
                    Talk To Us
                  </span>
                  <p className="relative text-sm text-white/80 leading-relaxed mb-4">
                    Can&apos;t find your answer? Our care team responds within 24
                    business hours.
                  </p>
                  <div className="relative space-y-2.5 text-xs">
                    <a
                      href={`mailto:${supportEmail}`}
                      className="flex items-center gap-2.5 text-white/90 hover:text-gold transition"
                    >
                      <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                      {supportEmail}
                    </a>
                    <a
                      href={`tel:${supportPhone.replace(/[^+\d]/g, "")}`}
                      className="flex items-center gap-2.5 text-white/90 hover:text-gold transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                      {supportPhone}
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Accordions */}
            <div className="lg:col-span-8">
              {q && visibleCategories.length === 0 ? (
                <div className="p-10 md:p-16 bg-white rounded-3xl border border-cream text-center">
                  <span className="w-14 h-14 rounded-full bg-ivory border border-cream flex items-center justify-center text-accent mx-auto mb-5">
                    <Search className="w-6 h-6" />
                  </span>
                  <h3 className="font-serif text-2xl text-charcoal mb-2">
                    No answers for &ldquo;{query.trim()}&rdquo;
                  </h3>
                  <p className="text-sm text-muted mb-6 max-w-sm mx-auto">
                    Try a different word, or ask us directly — we love a good
                    mango question.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="px-6 py-3 rounded-full border border-cream text-xs font-bold uppercase tracking-widest text-charcoal hover:border-accent hover:text-accent transition"
                    >
                      Clear Search
                    </button>
                    <Link
                      href="/contact"
                      className="px-6 py-3 rounded-full bg-charcoal text-white text-xs font-bold uppercase tracking-widest hover:bg-accent transition"
                    >
                      Ask Our Team
                    </Link>
                  </div>
                </div>
              ) : (
                visibleCategories.map((cat, catIndex) => (
                  <div
                    key={cat.id}
                    id={cat.id}
                    className={`scroll-mt-28 ${catIndex === 0 ? "" : "mt-14"}`}
                  >
                    <div className="flex items-end justify-between gap-4 mb-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent mb-1.5 block">
                          Topic {String(catIndex + 1).padStart(2, "0")}
                        </span>
                        <h2 className="font-serif text-2xl md:text-3xl text-charcoal">
                          {cat.label}
                        </h2>
                      </div>
                      <span className="hidden sm:block text-[11px] text-muted pb-1 shrink-0">
                        {cat.items.length} answer{cat.items.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-muted mb-5">{cat.blurb}</p>
                    <div className="h-px bg-gradient-to-r from-accent/40 via-cream to-transparent mb-6" aria-hidden="true" />

                    <div className="space-y-4">
                      {cat.items.map((item, index) => (
                        <FaqAccordionItem
                          key={item.id}
                          item={item}
                          index={index}
                          open={q ? true : effectiveOpen.has(item.id)}
                          onToggle={() => toggleItem(item.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}

              {/* Still have questions */}
              <div className="relative overflow-hidden mt-14 p-10 md:p-14 bg-burgundy text-white rounded-[32px] text-center shadow-2xl border border-gold/20">
                <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
                <div className="absolute -bottom-20 -right-16 w-56 h-56 rounded-full bg-mango/10 blur-3xl" aria-hidden="true" />
                <span className="relative text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3 block">
                  We&apos;re Here For You
                </span>
                <h3 className="relative font-serif text-3xl md:text-4xl mb-3">
                  Still have questions?
                </h3>
                <p className="relative text-white/70 text-xs md:text-sm mb-8 max-w-md mx-auto leading-relaxed">
                  Our customer care team is here to help you find your perfect
                  flavor.
                </p>
                <div className="relative flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/contact"
                    className="inline-block px-8 py-3.5 bg-gold text-charcoal rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition"
                  >
                    Contact Customer Support
                  </Link>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="inline-block px-8 py-3.5 rounded-full border border-white/25 text-white text-xs font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition"
                  >
                    Email Us
                  </a>
                </div>
                <p className="relative mt-6 text-[11px] tracking-wide text-white/50">
                  Prefer to talk? {supportPhone} (Mon–Sat, 9AM–7PM)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality & Origin 5-Badge Banner */}
      <div className="relative z-10 w-full border-t border-[#E5B869]/30 bg-[#640C26] text-white reveal">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 py-10 md:py-6 grid grid-cols-2 md:grid-cols-5 gap-y-10 md:gap-y-0 gap-x-6 md:gap-x-0 md:divide-x md:divide-[#E5B869]/30 text-center items-center">
          <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
            <span className="w-14 h-14 rounded-full border-2 border-[#E5B869] flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow-sm">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 22V10" />
                <path d="M12 10C12 5 8 3 4 3c0 5 2 9 8 9" />
                <path d="M12 14c0-4 3-7 8-7 0 4-2 7-8 7" />
                <line x1="8" y1="22" x2="16" y2="22" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-wide text-white mb-1">ธรรมชาติ 100%</span>
            <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">100% NATURAL</span>
          </div>
          <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
            <span className="w-14 h-14 rounded-full border-2 border-[#E5B869] flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow-sm">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 4c-1.2-1.8-3-2.5-5-1.8 0 2.8 1.8 3.8 4.8 3.8" />
                <path d="M9.8 6.5C6 6.5 3 10.2 4 15c1 4.8 5.8 6.8 8.8 4.8 4-2.8 5-8.8 3-11.8-1.5-1.8-3.8-2.2-6-1.5z" />
                <path d="M10 4.5c1-1.5 2-2 3-2" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-wide text-white mb-1">คัดสรรจากมะม่วงคุณภาพ</span>
            <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">FINEST QUALITY MANGO</span>
          </div>
          <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
            <span className="w-14 h-14 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300">
              <svg className="w-14 h-9 drop-shadow-md" viewBox="0 0 54 36" fill="none">
                <path d="M2 10C12 2 24 20 34 10C40 4 48 12 52 8V24C48 28 40 20 34 26C24 36 12 18 2 26V10Z" fill="#ED1C24" />
                <path d="M2 13C12 5 24 23 34 13C40 7 48 15 52 11V21C48 25 40 17 34 23C24 33 12 15 2 23V13Z" fill="#FFFFFF" />
                <path d="M2 15.5C12 7.5 24 25.5 34 15.5C40 9.5 48 17.5 52 13.5V18.5C48 22.5 40 14.5 34 20.5C24 30.5 12 12.5 2 20.5V15.5Z" fill="#241D4F" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-wide text-white mb-1">ผลิตในประเทศไทย</span>
            <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">PRODUCT OF THAILAND</span>
          </div>
          <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
            <span className="w-14 h-14 rounded-full border-2 border-[#E5B869] flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow-sm">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5.5 14c1 4.5 4.5 6.5 8.5 6.5 4 0 7-3 7-7 0-3.2-2.2-5.2-4.5-5.2-3 0-5 2-6.5 4-2 0-3.5 1-4.5 1.7z" />
                <circle cx="9" cy="8" r="1" fill="currentColor" />
                <circle cx="15" cy="7" r="0.8" fill="currentColor" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-wide text-white mb-1">อร่อย เพลิน เคี้ยวหนึบ</span>
            <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">DELICIOUS &amp; CHEWY</span>
          </div>
          <div className="col-span-2 md:col-span-1 px-2 md:px-4 flex flex-col items-center justify-center group max-w-xs mx-auto">
            <span className="w-14 h-14 rounded-full border-2 border-[#E5B869] flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow-sm">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8" cy="5.5" r="2.2" />
                <path d="M5.5 21v-5a3 3 0 0 1 5.5 0v5" />
                <circle cx="16.5" cy="7" r="1.8" />
                <path d="M14 21v-4a2.5 2.5 0 0 1 5 0v4" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-wide text-white mb-1">เหมาะสำหรับทุกวัย</span>
            <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">FOR ALL AGES</span>
          </div>
        </div>
      </div>
    </main>
  );
}
