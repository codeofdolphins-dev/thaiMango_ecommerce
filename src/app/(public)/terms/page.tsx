export default function TermsPage() {
  return (
    <main className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <span className="text-xs uppercase tracking-widest text-accent font-bold mb-3 block">Terms of Service</span>
        <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-8">Terms &amp; Conditions</h1>
        <p className="text-xs text-muted mb-10">Last updated: February 2026</p>

        <div className="prose max-w-none text-sm md:text-base text-muted space-y-8 leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">1. Agreement to Terms</h2>
            <p>By accessing or purchasing from Thai Mango, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">2. Product Authenticity &amp; Use</h2>
            <p>All Thai Mango products are authentic and manufactured under stringent food safety and sanitary standards. Our dried mango products are intended for personal consumption only.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">3. Pricing &amp; Availability</h2>
            <p>Prices are listed in Indian Rupees (INR) and are inclusive of all applicable taxes. We reserve the right to revise pricing or discontinue products at our discretion.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">4. Intellectual Property</h2>
            <p>All logos, imagery, typography, and product descriptions are the proprietary intellectual property of Thai Mango.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
