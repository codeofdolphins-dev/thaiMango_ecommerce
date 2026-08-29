import Link from "next/link";
import {
  Sun,
  Sparkles,
  Droplet,
  Shield,
  Leaf,
  CheckCircle,
} from "lucide-react";

export default function IngredientsPage() {
  return (
    <main>
      {/* Page Hero */}
      <section className="py-20 md:py-28 bg-[#640C26] text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <span className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3 block">Pure Fruit, Nothing Else</span>
          <h1 className="font-serif text-4xl md:text-6xl mb-6">What&apos;s Inside Every Pack</h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Every pack begins in the orchard. We source sun-ripened Thai mangoes and a short list of natural ingredients that deliver real flavor and nutrition — without artificial fillers.
          </p>
        </div>
      </section>

      {/* Key Ingredients Grid */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Active 1: Thai Mango */}
            <div className="p-8 md:p-10 rounded-[32px] bg-white border border-cream shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-mango mb-6">
                  <Sun className="w-7 h-7" />
                </div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-accent mb-2 block">Origin: Chanthaburi, Thailand</span>
                <h3 className="font-serif text-2xl text-charcoal mb-4">Nam Dok Mai Mango</h3>
                <p className="text-xs md:text-sm text-muted leading-relaxed mb-6">
                  The prized &quot;honey mango&quot; varietal, hand-picked at peak ripeness from our family orchard. Naturally sweet, fiber-rich, and packed with vitamins A and C, then sun-dried to a chewy finish.
                </p>
              </div>
              <div className="pt-4 border-t border-cream text-xs text-charcoal font-semibold">
                Found in: Classic Cuts, Chili Lime Bites, Honey Glazed Slices
              </div>
            </div>

            {/* Active 2: Beetroot */}
            <div className="p-8 md:p-10 rounded-[32px] bg-white border border-cream shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-beetroot mb-6">
                  <Sparkles className="w-7 h-7" />
                </div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-accent mb-2 block">Origin: Natural, Cold-Pressed</span>
                <h3 className="font-serif text-2xl text-charcoal mb-4">Beetroot Juice</h3>
                <p className="text-xs md:text-sm text-muted leading-relaxed mb-6">
                  Cold-pressed beetroot juice gives our Fusion line its vibrant color naturally — no added dyes — while contributing earthy sweetness and antioxidants to every chew.
                </p>
              </div>
              <div className="pt-4 border-t border-cream text-xs text-charcoal font-semibold">
                Found in: Beetroot Fusion Chews
              </div>
            </div>

            {/* Active 3: Triple Hyaluronic Acid */}
            <div className="p-8 md:p-10 rounded-[32px] bg-white border border-cream shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6">
                  <Droplet className="w-7 h-7" />
                </div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-accent mb-2 block">Small-Batch Sourced</span>
                <h3 className="font-serif text-2xl text-charcoal mb-4">Wildflower Honey</h3>
                <p className="text-xs md:text-sm text-muted leading-relaxed mb-6">
                  A light glaze of raw wildflower honey is brushed over sun-dried mango, giving our Glazed &amp; Sweet line its soft, glossy finish and rounded sweetness.
                </p>
              </div>
              <div className="pt-4 border-t border-cream text-xs text-charcoal font-semibold">
                Found in: Honey Glazed Slices
              </div>
            </div>

            {/* Active 4: Niacinamide */}
            <div className="p-8 md:p-10 rounded-[32px] bg-white border border-cream shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-6">
                  <Shield className="w-7 h-7" />
                </div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-accent mb-2 block">Quality-Checked at Origin</span>
                <h3 className="font-serif text-2xl text-charcoal mb-4">Thai Chili &amp; Kaffir Lime</h3>
                <p className="text-xs md:text-sm text-muted leading-relaxed mb-6">
                  Dried mango is tossed by hand in Thai chili and kaffir lime for a sweet-sour-spicy kick that balances the fruit&apos;s natural sugars with real heat and zest.
                </p>
              </div>
              <div className="pt-4 border-t border-cream text-xs text-charcoal font-semibold">
                Found in: Chili Lime Bites
              </div>
            </div>

            {/* Active 5: Green Tea Extract */}
            <div className="p-8 md:p-10 rounded-[32px] bg-white border border-cream shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mb-6">
                  <Leaf className="w-7 h-7" />
                </div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-accent mb-2 block">Naturally Sourced</span>
                <h3 className="font-serif text-2xl text-charcoal mb-4">Citric Acid &amp; Sea Salt</h3>
                <p className="text-xs md:text-sm text-muted leading-relaxed mb-6">
                  A pinch of natural citric acid keeps the fruit&apos;s color bright and a touch of sea salt rounds out the sweetness — nothing more, nothing artificial.
                </p>
              </div>
              <div className="pt-4 border-t border-cream text-xs text-charcoal font-semibold">
                Found in: All Thai Mango snacks
              </div>
            </div>

            {/* Active 6: Clean Standards */}
            <div className="p-8 md:p-10 rounded-[32px] bg-charcoal text-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-gold mb-6">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-gold mb-2 block">Our Snacking Promise</span>
                <h3 className="font-serif text-2xl text-white mb-4">Made Without</h3>
                <p className="text-xs md:text-sm text-white/80 leading-relaxed mb-6">
                  Artificial Preservatives, Added Colors, GMOs, Gluten, and Animal Products. Non-GMO, gluten-free, and vegan — with no added sugar on our Classic line.
                </p>
              </div>
              <Link href="/shop" className="inline-block py-3 bg-accent text-white text-center text-xs uppercase tracking-widest font-bold rounded-full hover:bg-gold hover:text-charcoal transition">Explore The Range</Link>
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
