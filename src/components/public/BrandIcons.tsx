/* Brand icons removed from lucide-react — inline SVGs with the original Lucide paths */

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/* ── Payment provider marks (brand-coloured tiles, drawn inline) ── */

export function RazorpayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#0C2451" />
      {/* Razorpay's angled ribbon over the "R" counter */}
      <path d="M13.6 4.5 7.9 14.2l1.5-6.1H6.3l-2 9.4h2.9l5.7-9.7-1.5 6.1h3.1l2-9.4h-2.9z" fill="#3395FF" />
      <path d="M13.6 4.5h3.9l-2.2 9.1h-3.1l1.4-9.1z" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

export function StripeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#635BFF" />
      {/* Stripe's "S" glyph */}
      <path
        d="M11.4 9.6c0-.5.44-.7 1.14-.7 1.02 0 2.32.31 3.34.86V6.63a8.9 8.9 0 0 0-3.34-.61c-2.73 0-4.55 1.43-4.55 3.81 0 3.72 5.12 3.12 5.12 4.73 0 .6-.52.79-1.27.79-1.12 0-2.55-.46-3.68-1.08v3.17c1.25.54 2.52.77 3.68.77 2.8 0 4.72-1.38 4.72-3.8 0-4.01-5.16-3.3-5.16-4.81z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
