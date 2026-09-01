"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { useStore } from "@/components/public/store";
import PhoneField from "@/components/common/PhoneField";
import { DEFAULT_SETTINGS } from "@/schemas/settings.schema";
import { INQUIRY_TOPICS } from "@/schemas/contact.schema";

export default function ContactPage() {
  const { showToast, settings } = useStore();
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitInquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fields = new FormData(form);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: fields.get("first_name"),
          last_name: fields.get("last_name"),
          email: fields.get("email"),
          phone: contactPhone,
          topic: fields.get("topic"),
          message: fields.get("message"),
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.errors?.[0] || body.message || "Something went wrong");
      }
      showToast("Thank you! Your request has been received.");
      form.reset();
      setContactPhone("");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Could not send your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* Support details come from admin Settings; defaults are only the
     pre-fetch fallback. */
  const supportEmail = settings?.support_email || DEFAULT_SETTINGS.support_email;
  const supportPhone = settings?.support_phone || DEFAULT_SETTINGS.support_phone;
  const storeAddress = settings?.store_address || DEFAULT_SETTINGS.store_address;

  return (
    <main>
      {/* Contact Hero */}
      <section className="py-20 md:py-28 bg-[#52091E] text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <span className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3 block">We Are Here For You</span>
          <h1 className="font-serif text-4xl md:text-6xl mb-6">Connect with Thai Mango</h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Whether you have questions about our sun-dried mango snacks, order status, or bulk &amp; wholesale inquiries, our team is always ready to assist.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* Contact Info Sidebar (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3 block">Customer Care</span>
                <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-6">Customer Support</h2>
                <p className="text-sm text-muted leading-relaxed mb-8">
                  Reach out through any of our direct channels. Our customer care team responds within 24 business hours.
                </p>

                <div className="space-y-6 mb-10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-accent shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-1">Email Inquiries</h4>
                      <p className="text-sm text-muted">
                        <a href={`mailto:${supportEmail}`} className="hover:text-accent transition">
                          {supportEmail}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-accent shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-1">Direct Support</h4>
                      <p className="text-sm text-muted">
                        <a
                          href={`tel:${supportPhone.replace(/[^+\d]/g, "")}`}
                          className="hover:text-accent transition"
                        >
                          {supportPhone}
                        </a>{" "}
                        (Mon–Sat, 9AM–7PM)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-accent shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-1">Flagship &amp; Packing House</h4>
                      <p className="text-sm text-muted">{storeAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#FAF7F2] rounded-3xl border border-cream">
                <h4 className="text-xs font-bold uppercase tracking-widest text-charcoal mb-2">Order Tracking</h4>
                <p className="text-xs text-muted leading-relaxed mb-4">Have your Order ID ready? Send us a quick note to receive immediate dispatch status.</p>
                <Link href="/faq" className="text-xs font-bold uppercase tracking-wider text-accent hover:underline">View Shipping FAQs →</Link>
              </div>
            </div>

            {/* Contact Form (7 cols) */}
            <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[32px] border border-cream shadow-xl">
              <h3 className="font-serif text-2xl md:text-3xl text-charcoal mb-2">Send Us a Message</h3>
              <p className="text-xs md:text-sm text-muted mb-8">Fill in your details below and we will get back to you promptly.</p>

              <form className="space-y-6" onSubmit={submitInquiry}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-charcoal mb-2">First Name *</label>
                    <input type="text" name="first_name" required placeholder="Nalinee" className="w-full px-4 py-3.5 rounded-2xl border border-cream bg-ivory text-sm focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-charcoal mb-2">Last Name *</label>
                    <input type="text" name="last_name" required placeholder="Sombat" className="w-full px-4 py-3.5 rounded-2xl border border-cream bg-ivory text-sm focus:outline-none focus:border-accent" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-charcoal mb-2">Email Address *</label>
                    <input type="email" name="email" required placeholder="name@domain.com" className="w-full px-4 py-3.5 rounded-2xl border border-cream bg-ivory text-sm focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-charcoal mb-2">Phone Number</label>
                    <PhoneField
                      id="contact-phone"
                      value={contactPhone}
                      onChange={setContactPhone}
                      inputClassName="w-full px-4 py-3.5 rounded-2xl border border-cream bg-ivory text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-charcoal mb-2">Inquiry Topic</label>
                  <select name="topic" className="w-full px-4 py-3.5 rounded-2xl border border-cream bg-ivory text-sm focus:outline-none focus:border-accent">
                    {INQUIRY_TOPICS.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-charcoal mb-2">Your Message *</label>
                  <textarea rows={5} name="message" required placeholder="Tell us how we can assist you..." className="w-full px-4 py-3.5 rounded-2xl border border-cream bg-ivory text-sm focus:outline-none focus:border-accent"></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-accent transition duration-300 shadow-md disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Submit Inquiry"}
                </button>
              </form>
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
