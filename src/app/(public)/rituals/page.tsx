import Link from "next/link";

export default function RitualsPage() {
  return (
    <main>
      {/* Rituals Hero */}
      <section className="py-20 md:py-28 bg-burgundy text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <span className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3 block">Ways to Enjoy</span>
          <h1 className="font-serif text-4xl md:text-6xl mb-6">Mango Rituals</h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Simple, satisfying ways to bring sun-dried Thai mango into your everyday moments.
          </p>
        </div>
      </section>

      {/* Ritual 1: Morning Radiance */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-2 block">Everyday Ritual • Anytime</span>
            <h2 className="font-serif text-3xl md:text-5xl text-charcoal">Everyday Mango Moments</h2>
            <p className="text-muted text-sm md:text-base mt-4 leading-relaxed">Three simple ways to work sun-dried Thai mango into your day, whether you&apos;re snacking solo or serving a crowd.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 bg-white rounded-[28px] border border-cream shadow-sm flex flex-col justify-between">
              <div>
                <span className="w-10 h-10 rounded-full bg-cream flex items-center justify-center font-serif text-xl font-bold text-accent mb-6">1</span>
                <h3 className="font-serif text-2xl mb-2">Snack On the Go</h3>
                <p className="text-xs text-muted leading-relaxed mb-6">Keep a pouch of Classic Sun-Dried Strips in your bag or desk drawer for a naturally sweet, chewy pick-me-up anytime hunger strikes.</p>
              </div>
              <Link href="/shop?category=classic-cuts" className="text-xs font-bold uppercase tracking-wider text-accent hover:underline">Shop Classic Cuts →</Link>
            </div>
            {/* Step 2 */}
            <div className="p-8 bg-white rounded-[28px] border border-cream shadow-sm flex flex-col justify-between">
              <div>
                <span className="w-10 h-10 rounded-full bg-cream flex items-center justify-center font-serif text-xl font-bold text-accent mb-6">2</span>
                <h3 className="font-serif text-2xl mb-2">Pair with Sticky Rice</h3>
                <p className="text-xs text-muted leading-relaxed mb-6">Serve a few Honey Glazed Slices alongside warm sticky rice for a Thai-style dessert that&apos;s ready in minutes.</p>
              </div>
              <Link href="/shop?category=glazed-sweet" className="text-xs font-bold uppercase tracking-wider text-accent hover:underline">Shop Glazed &amp; Sweet →</Link>
            </div>
            {/* Step 3 */}
            <div className="p-8 bg-white rounded-[28px] border border-cream shadow-sm flex flex-col justify-between">
              <div>
                <span className="w-10 h-10 rounded-full bg-cream flex items-center justify-center font-serif text-xl font-bold text-accent mb-6">3</span>
                <h3 className="font-serif text-2xl mb-2">Toss into Trail Mix</h3>
                <p className="text-xs text-muted leading-relaxed mb-6">Chop up Chili Lime Bites and fold them into your favorite nuts and seeds for a sweet-sour-spicy trail mix upgrade.</p>
              </div>
              <Link href="/shop?category=spiced-zesty" className="text-xs font-bold uppercase tracking-wider text-accent hover:underline">Shop Spiced &amp; Zesty →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ritual 2: Snacking & Internal Glow */}
      <section className="py-16 md:py-24 bg-[#FAF7F2] border-t border-cream">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-2 block">Wind-Down Ritual</span>
            <h2 className="font-serif text-3xl md:text-5xl text-charcoal mb-6">Steeped in Tea, Ready for the Table</h2>
            <p className="text-sm md:text-base text-muted leading-relaxed mb-6">
              Drop a few pieces of Beetroot Fusion Chews into a warm pot of tea and let them steep for a naturally sweet infusion, or thread Classic Strips onto a cocktail pick as a fruity garnish. Pack a few into the kids&apos; lunchbox, or open a Discovery Gift Box when friends come by — dietary fiber, natural fruit sugars, and antioxidants, without synthetic additives.
            </p>
            <Link href="/shop" className="inline-flex items-center px-8 py-4 bg-charcoal text-white text-xs uppercase tracking-widest font-bold rounded-full hover:bg-accent transition shadow-md">
              Shop Thai Mango Pouches
            </Link>
          </div>
          <div className="relative rounded-[32px] overflow-hidden aspect-[4/3] bg-cream shadow-lg">
            <img src="/images/bangkok-mango-beetroot-2.png" alt="Thai Mango served with tea and sticky rice" className="w-full h-full object-cover" />
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
