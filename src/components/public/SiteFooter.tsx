"use client";

import Link from "next/link";
import { Banknote, MessageCircle } from "lucide-react";
import { InstagramIcon } from "./BrandIcons";
import { useStore } from "./store";

export default function SiteFooter() {
  const { t, settings } = useStore();

  /* Admin-managed social links — an empty link hides its icon. */
  const socials = [
    {
      label: "Instagram",
      href: settings?.social_instagram,
      icon: <InstagramIcon className="w-4 h-4" />,
    },
    {
      label: "Facebook",
      href: settings?.social_facebook,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      label: "X / Twitter",
      href: settings?.social_twitter,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
        </svg>
      ),
    },
    {
      label: "YouTube",
      href: settings?.social_youtube,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      href: settings?.social_whatsapp,
      icon: <MessageCircle className="w-4 h-4" />,
    },
  ].filter((s) => Boolean(s.href));

  const storeName = settings?.store_name || "Thai Mango";

  return (
    <footer className="bg-charcoal text-ivory pt-24 pb-12 px-6 md:px-12">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 mb-20">
        {/* Col 1 */}
        <div className="lg:pr-12 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
            <img
              src="/images/logo.png"
              alt={storeName}
              className="w-12 h-12 object-contain rounded-full shadow-md"
            />
            <h3 className="font-serif text-2xl md:text-3xl tracking-widest uppercase">
              {storeName}
            </h3>
          </div>
          <p className="text-sm text-ivory/70 leading-relaxed">
            {t("footer_brand_desc")}
          </p>
        </div>

        {/* Col 2 */}
        <div className="text-center md:text-left">
          <h4 className="text-[10px] tracking-widest uppercase mb-6 font-semibold text-accent">
            {t("footer_shop")}
          </h4>
          <ul className="space-y-4 text-sm text-ivory/70">
            <li>
              <Link href="/shop" className="hover:text-white transition">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-white transition">
                Bestsellers
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-white transition">
                New Arrivals
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-white transition">
                Gift Sets
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="text-center md:text-left">
          <h4 className="text-[10px] tracking-widest uppercase mb-6 font-semibold text-accent">
            {t("footer_discover")}
          </h4>
          <ul className="space-y-4 text-sm text-ivory/70">
            <li>
              <Link href="/about" className="hover:text-white transition">
                Our Story
              </Link>
            </li>
            <li>
              <Link href="/ingredients" className="hover:text-white transition">
                Ingredients
              </Link>
            </li>
            <li>
              <Link href="/rituals" className="hover:text-white transition">
                Rituals
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-white transition">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4 */}
        <div className="text-center md:text-left">
          <h4 className="text-[10px] tracking-widest uppercase mb-6 font-semibold text-accent">
            {t("footer_help")}
          </h4>
          <ul className="space-y-4 text-sm text-ivory/70">
            <li>
              <Link href="/contact" className="hover:text-white transition">
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="/shipping-policy"
                className="hover:text-white transition"
              >
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="hover:text-white transition"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
          {/* Admin-managed support details */}
          {settings && (
            <div className="mt-6 space-y-2 text-xs text-ivory/60">
              {settings.support_email && (
                <a
                  href={`mailto:${settings.support_email}`}
                  className="block hover:text-white transition"
                >
                  {settings.support_email}
                </a>
              )}
              {settings.support_phone && (
                <a
                  href={`tel:${settings.support_phone.replace(/[^+\d]/g, "")}`}
                  className="block hover:text-white transition"
                >
                  {settings.support_phone}
                </a>
              )}
              {settings.store_address && (
                <p className="leading-relaxed">{settings.store_address}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="max-w-screen-2xl mx-auto pb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] tracking-widest uppercase text-ivory/50">
          We Accept
        </p>
        {/* Admin-managed: card_* toggles; UPI/COD follow the payment flags. */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {(settings?.card_visa ?? true) && (
            <svg viewBox="0 0 48 32" className="w-11 h-8 rounded-md shadow-sm" aria-label="Visa">
              <rect width="48" height="32" rx="5" fill="#1A1F71" />
              <text x="24" y="21" textAnchor="middle" fontFamily="Inter, sans-serif" fontStyle="italic" fontWeight="bold" fontSize="12" fill="#ffffff">
                VISA
              </text>
            </svg>
          )}
          {(settings?.card_mastercard ?? true) && (
            <svg viewBox="0 0 48 32" className="w-11 h-8 rounded-md shadow-sm" aria-label="Mastercard">
              <rect width="48" height="32" rx="5" fill="#F3F3F3" />
              <circle cx="20" cy="16" r="9" fill="#EB001B" />
              <circle cx="28" cy="16" r="9" fill="#F79E1B" fillOpacity="0.85" />
            </svg>
          )}
          {(settings?.card_rupay ?? true) && (
            <svg viewBox="0 0 48 32" className="w-11 h-8 rounded-md shadow-sm" aria-label="RuPay">
              <rect width="48" height="32" rx="5" fill="#FFFFFF" />
              <text x="24" y="19" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="bold" fontSize="9.5" fill="#0A3577">
                Ru<tspan fill="#F58220">Pay</tspan>
              </text>
              <rect x="4" y="23" width="40" height="3" rx="1.5" fill="#0AA84F" />
            </svg>
          )}
          {(settings?.card_amex ?? false) && (
            <svg viewBox="0 0 48 32" className="w-11 h-8 rounded-md shadow-sm" aria-label="American Express">
              <rect width="48" height="32" rx="5" fill="#2E77BC" />
              <text x="24" y="20" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="bold" fontSize="9" fill="#ffffff">
                AMEX
              </text>
            </svg>
          )}
          {(settings?.upi_enabled ?? true) && (
            <svg viewBox="0 0 48 32" className="w-11 h-8 rounded-md shadow-sm" aria-label="UPI">
              <rect width="48" height="32" rx="5" fill="#FFFFFF" />
              <text x="24" y="20" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="bold" fontSize="11" fill="#4B2E83">
                UPI
              </text>
            </svg>
          )}
          {(settings?.cod_enabled ?? true) && (
            <span className="flex items-center gap-1.5 w-auto h-8 px-3 rounded-md bg-ivory/5 border border-ivory/15 text-ivory/70 text-[9px] tracking-wide uppercase font-semibold">
              <Banknote className="w-3.5 h-3.5" /> COD
            </span>
          )}
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] tracking-widest text-ivory/50 uppercase">
          © 2026 {storeName}
        </p>
        {socials.length > 0 && (
          <div className="flex items-center gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-ivory/25 flex items-center justify-center text-ivory/80 hover:text-accent hover:border-accent transition"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
