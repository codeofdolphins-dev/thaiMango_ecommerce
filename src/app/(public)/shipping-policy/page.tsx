import { baseCurrencyOf, getStoreSettings } from "@/lib/storeSettings";
import { formatMoney } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function ShippingPolicyPage() {
  const settings = await getStoreSettings();
  const base = baseCurrencyOf(settings);
  const freeAbove = formatMoney(settings.free_shipping_above, base);
  const flatRate = formatMoney(settings.standard_shipping, base);
  return (
    <main className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <span className="text-xs uppercase tracking-widest text-accent font-bold mb-3 block">Orders &amp; Dispatch</span>
        <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-8">Shipping &amp; Returns Policy</h1>
        <p className="text-xs text-muted mb-10">Last updated: February 2026</p>

        <div className="prose max-w-none text-sm md:text-base text-muted space-y-8 leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">1. Dispatch &amp; Delivery Timelines</h2>
            <p>All orders placed before 2:00 PM IST Monday through Saturday are dispatched on the same business day. Delivery across major metro cities typically takes 2–3 business days. Non-metro and regional addresses take 3–5 business days.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">2. Shipping Charges</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Free Standard Delivery:</strong> On all orders above {freeAbove}.</li>
              <li><strong>Standard Flat Rate:</strong> {flatRate} on orders under {freeAbove}.</li>
              <li><strong>Cash on Delivery:</strong> Available with no additional surcharge.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">3. Temperature-Controlled Eco Packaging</h2>
            <p>All Thai Mango pouches are packed inside biodegradable insulated sleeves to ensure total freshness, even in warm climates.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal mb-3">4. Damaged or Missing Shipments</h2>
            <p>If your package arrives damaged, please photograph the package and notify us within 48 hours at <a href={`mailto:${settings.support_email}`} className="text-accent underline">{settings.support_email}</a> for an immediate replacement dispatch.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
