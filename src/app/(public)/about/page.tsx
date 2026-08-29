export default function AboutPage() {
  return (
    <main>
      {/* Hero Banner */}
      <section className="relative py-24 md:py-32 bg-[#52091E] text-white overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <span className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-4 block">Rooted in Tradition • Ripened by the Sun</span>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight">The Thai Mango Story</h1>
          <p className="text-base md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            A celebration of Thailand&apos;s rich mango harvest, grown and sun-dried by one family for three generations.
          </p>
        </div>
      </section>

      {/* Narrative Section 1: Origins */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative rounded-[32px] overflow-hidden aspect-[4/3] bg-cream shadow-xl">
            <img src="/images/bangkok-mango-beetroot-1.png" alt="Origins" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3 block">Chapter 01</span>
            <h2 className="font-serif text-3xl md:text-5xl text-charcoal mb-6 leading-snug">From Chanthaburi Orchards to Every Snack Bag</h2>
            <p className="text-sm md:text-base text-muted leading-relaxed mb-6">
              Our journey began three generations ago in Chanthaburi, one of Thailand&apos;s oldest mango-growing provinces. Our family has spent decades tending the same trees, hand-picking fruit at peak ripeness and sun-drying it the way our grandparents taught us.
            </p>
            <p className="text-sm md:text-base text-muted leading-relaxed">
              Today, Thai Mango brings that same orchard harvest to the world — sun-ripened, hand-selected, and dried with no artificial preservatives, so every strip tastes like it just came off the tree.
            </p>
          </div>
        </div>
      </section>

      {/* Narrative Section 2: The Philosophy */}
      <section className="py-16 md:py-24 bg-[#FAF7F2] border-y border-cream">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3 block">Chapter 02</span>
            <h2 className="font-serif text-3xl md:text-5xl text-charcoal mb-6 leading-snug">Honest Snacking, Nothing Added</h2>
            <p className="text-sm md:text-base text-muted leading-relaxed mb-6">
              We believe a great snack should taste like the fruit it came from. Every batch of Thai Mango is small-batch dried and quality-checked at origin — no artificial preservatives, no added colors (our Beetroot Fusion line gets its color naturally), just real Thai mango.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="p-5 bg-white rounded-2xl border border-cream shadow-sm">
                <span className="font-serif text-3xl text-accent font-bold mb-1 block">100%</span>
                <span className="text-xs uppercase tracking-wider text-charcoal font-semibold">Natural Origin Fruit</span>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-cream shadow-sm">
                <span className="font-serif text-3xl text-accent font-bold mb-1 block">0%</span>
                <span className="text-xs uppercase tracking-wider text-charcoal font-semibold">Artificial Colors &amp; Preservatives</span>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative rounded-[32px] overflow-hidden aspect-[4/3] bg-cream shadow-xl">
            <img src="/images/bangkok-mango-beetroot-2.png" alt="Philosophy" className="w-full h-full object-cover" />
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
