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

/* Google's four-colour "G" — the mark used in the official Google Pay lockup */
export function GooglePayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/* PhonePe — white "Pe" on the brand violet tile (#5F259F) */
export function PhonePeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="phonepe-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6F2DB8" />
          <stop offset="100%" stopColor="#5F259F" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#phonepe-tile)" />
      {/* Ribbon over the "Pe" bowl */}
      <path
        d="M16.9 8.1c0-.44-.36-.8-.8-.8h-1.47l-.34-1.17a.86.86 0 0 0-.83-.63h-1.3c-.3 0-.5.28-.42.56l.36 1.24H8.1c-.44 0-.8.36-.8.8v.7c0 .27.22.49.49.49h.86v3.36c0 1.9 1 2.98 2.72 2.98.53 0 .98-.06 1.5-.25v1.9c0 .5.4.9.9.9h1.05c.5 0 .9-.4.9-.9V8.59h.69c.27 0 .49-.22.49-.49v-.4zm-4.03 6.02c-.3.14-.6.19-.94.19-.72 0-1.1-.36-1.1-1.2V8.59h2.04v5.53z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/* Paytm — the brand's two-tone blue wordmark tile */
export function PaytmIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="paytm-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00BAF2" />
          <stop offset="100%" stopColor="#002970" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#paytm-tile)" />
      {/* Stylised "P" counter from the Paytm mark */}
      <path
        d="M8.4 5.8h4.3c2.2 0 3.7 1.4 3.7 3.5s-1.5 3.6-3.7 3.6h-1.9v5.3H8.4V5.8zm2.4 2.2v2.7h1.6c.9 0 1.5-.5 1.5-1.35S13.3 8 12.4 8h-1.6z"
        fill="#FFFFFF"
      />
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
