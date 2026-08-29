"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Apple, Truck, ChevronDown } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

const ingredientsItems: FaqItem[] = [
  {
    id: "ing-0",
    question: "Do Thai Mango snacks contain any allergens?",
    answer:
      "All Thai Mango products are processed in a facility that also handles tree nuts and sulfites, so trace cross-contact is possible. Some lines use a small amount of sulfites as a preservative to maintain color and freshness — always check the pack label for the specific batch's allergen statement before serving to anyone with a known sensitivity.",
  },
  {
    id: "ing-1",
    question: "How spicy are the Chili Lime Bites?",
    answer:
      "Our Chili Lime Bites carry a mild-to-medium heat — a bright, tangy kick from Thai chili and lime rather than an overwhelming burn. If you prefer no spice at all, we recommend our Classic Sun-Dried Strips or Honey Glazed Slices instead.",
  },
  {
    id: "ing-2",
    question: "Do your snacks contain added sugar?",
    answer:
      "Our Classic Sun-Dried Strips have no added sugar — just the natural sweetness of sun-ripened mango. Honey Glazed Slices are lightly finished with real honey for extra sweetness. Check each product page for the full nutritional breakdown.",
  },
];

const snacksItems: FaqItem[] = [
  {
    id: "snacks-0",
    question: "What makes Thai Mango Beetroot Fusion Chews unique?",
    answer:
      "We select only tree-ripened Thai mangoes and infuse them with natural beetroot juice before gently dehydrating them at low temperatures. This preserves the soft, chewy texture, vibrant ruby hue, and vital phytonutrients without adding artificial colors or chemical preservatives.",
  },
  {
    id: "snacks-1",
    question: "What is the shelf life of the fruit pouches?",
    answer:
      "Unopened pouches maintain peak freshness for roughly 12 months when stored in a cool, dry place away from direct sunlight. Once opened, reseal the pouch and consume within 7 days.",
  },
  {
    id: "snacks-2",
    question: "Is Thai Mango suitable for children?",
    answer: (
      <>
        Yes! It is crafted for all ages (เหมาะสำหรับทุกวัย) as a wholesome lunchbox treat or guilt-free snack. We recommend the milder Classic Cuts and Glazed &amp; Sweet lines for younger kids, and saving Spiced &amp; Zesty for older snackers.
      </>
    ),
  },
  {
    id: "snacks-3",
    question: "Do you offer bulk or wholesale ordering?",
    answer: (
      <>
        Yes. We supply cafes, gift retailers, and corporate clients with bulk cases across all five collections — Classic Cuts, Spiced &amp; Zesty, Glazed &amp; Sweet, Fusion Blends, and Gift Sets. Reach out through our Contact page and select &quot;Bulk &amp; Wholesale Orders&quot; for pricing.
      </>
    ),
  },
];

const shippingItems: FaqItem[] = [
  {
    id: "ship-0",
    question: "How long does shipping take?",
    answer:
      "Orders are dispatched within 24 hours. Metro deliveries typically arrive in 2–3 business days, while non-metro locations take 4–5 business days. You will receive an SMS and email with live tracking details.",
  },
  {
    id: "ship-1",
    question: "Do you accept Cash on Delivery (COD)?",
    answer: "Yes, Cash on Delivery is available across most serviceable pincodes across India.",
  },
];

function FaqAccordionItem({
  item,
  open,
  onToggle,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`accordion-item p-6 bg-white rounded-2xl border border-cream cursor-pointer ${open ? "active" : ""}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full justify-between items-center text-sm md:text-base font-semibold text-charcoal text-left"
      >
        <span>{item.question}</span>
        <ChevronDown className="accordion-chevron w-5 h-5 text-accent transition-transform" />
      </button>
      <div className="accordion-panel">
        <p className="text-xs md:text-sm text-muted leading-relaxed mt-4">{item.answer}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(() => new Set(["ing-0"]));

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <main>
      {/* FAQ Hero */}
      <section className="py-20 md:py-28 bg-[#52091E] text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <span className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3 block">Help Center</span>
          <h1 className="font-serif text-4xl md:text-6xl mb-6">Frequently Asked Questions</h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Find clear answers about our dried mango snacks, shipping timelines, shelf life, and orders.
          </p>
        </div>
      </section>

      {/* FAQ Accordions */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="max-w-4xl mx-auto px-6">

          {/* Category: Ingredients & Allergens */}
          <div className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-6 border-b border-cream pb-3 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-accent" />
              Ingredients &amp; Allergens
            </h2>

            <div className="space-y-4">
              {ingredientsItems.map((item) => (
                <FaqAccordionItem
                  key={item.id}
                  item={item}
                  open={openItems.has(item.id)}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}
            </div>
          </div>

          {/* Category: Thai Mango Snacks */}
          <div className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-6 border-b border-cream pb-3 flex items-center gap-3">
              <Apple className="w-6 h-6 text-mango" />
              Thai Mango Snacks
            </h2>

            <div className="space-y-4">
              {snacksItems.map((item) => (
                <FaqAccordionItem
                  key={item.id}
                  item={item}
                  open={openItems.has(item.id)}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}
            </div>
          </div>

          {/* Category: Shipping & Orders */}
          <div className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-6 border-b border-cream pb-3 flex items-center gap-3">
              <Truck className="w-6 h-6 text-accent" />
              Shipping &amp; Orders
            </h2>

            <div className="space-y-4">
              {shippingItems.map((item) => (
                <FaqAccordionItem
                  key={item.id}
                  item={item}
                  open={openItems.has(item.id)}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}
            </div>
          </div>

          {/* Still have questions card */}
          <div className="p-8 md:p-12 bg-charcoal text-white rounded-[32px] text-center shadow-xl">
            <h3 className="font-serif text-2xl md:text-3xl mb-3">Still have questions?</h3>
            <p className="text-white/70 text-xs md:text-sm mb-6 max-w-md mx-auto">Our customer care team is here to help you find your perfect flavor.</p>
            <Link href="/contact" className="inline-block px-8 py-3.5 bg-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-charcoal transition">Contact Customer Support</Link>
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
