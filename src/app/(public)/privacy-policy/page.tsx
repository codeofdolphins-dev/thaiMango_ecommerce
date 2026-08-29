export default function PrivacyPolicyPage() {
  return (
    <main className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <span className="text-xs uppercase tracking-widest text-accent font-bold mb-3 block">Legal &amp; Transparency</span>
        <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-8">Privacy Policy</h1>
        <p className="text-xs text-muted mb-10">Last updated: February 2026</p>

        <div className="prose max-w-none text-sm md:text-base text-muted space-y-8 leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when purchasing our dried mango snack products, subscribing to our inner circle, placing a bulk or wholesale order, or contacting our customer care team.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">2. How We Use Your Information</h2>
            <p>Your details are used strictly to fulfill orders, process payments securely, provide order tracking, personalize product recommendations, and communicate important updates regarding your purchases.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">3. Data Security &amp; Sharing</h2>
            <p>We do not sell, rent, or trade your personal data. Payment transactions are processed through encrypted, PCI-DSS compliant payment gateways.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">4. Contact Our Data Protection Officer</h2>
            <p>For questions regarding your data or to request record removal, email us at <a href="mailto:privacy@thaimango.com" className="text-accent underline">privacy@thaimango.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
