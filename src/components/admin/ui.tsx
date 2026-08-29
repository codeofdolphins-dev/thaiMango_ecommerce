/* Status pill for orders / products / reviews */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Processing: "bg-blue-50 text-blue-700 border-blue-200",
    Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "In Stock": "bg-emerald-50 text-emerald-700 border-emerald-200",
    Draft: "bg-stone-100 text-stone-600 border-stone-200",
    "Low Stock": "bg-amber-50 text-amber-700 border-amber-200",
    "Out of Stock": "bg-rose-50 text-rose-700 border-rose-200",
    New: "bg-sky-50 text-sky-700 border-sky-200",
    Silver: "bg-stone-100 text-stone-600 border-stone-200",
    Gold: "bg-amber-50 text-amber-700 border-amber-200",
    Published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Requested: "bg-amber-50 text-amber-700 border-amber-200",
    Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Expired: "bg-stone-100 text-stone-500 border-stone-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
        map[status] ?? "bg-stone-100 text-stone-600 border-stone-200"
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

/* Mint status chip used on stat cards (Live / Total / Active / Growth) */
export function MintChip({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
      {label}
    </span>
  );
}

/* Tiny inline sparkline (single series) */
export function Sparkline({
  data,
  positive = true,
  className = "",
}: {
  data: number[];
  positive?: boolean;
  className?: string;
}) {
  const w = 120;
  const h = 36;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data
    .map((d, i) => `${i * step},${h - ((d - min) / range) * (h - 6) - 3}`)
    .join(" ");
  const stroke = positive ? "#0f9d6b" : "#e11d48";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Stat card matching the Command Center reference */
export function StatCard({
  Icon,
  chip,
  label,
  value,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  chip: string;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <span className="w-11 h-11 rounded-xl bg-peach-soft flex items-center justify-center">
          <Icon className="w-5 h-5 text-peach" />
        </span>
        <MintChip label={chip} />
      </div>
      <span className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400 mb-1.5">
        {label}
      </span>
      <span className="block text-3xl font-bold text-ink">{value}</span>
    </Card>
  );
}

/* Vertical bar chart (single series) */
export function BarChart({
  data,
  unit = "",
}: {
  data: { month: string; value: number }[];
  unit?: string;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end justify-between gap-2 h-56 pt-4">
      {data.map((d) => (
        <div
          key={d.month}
          className="flex-1 flex flex-col items-center gap-2 group"
        >
          <div className="relative w-full flex items-end justify-center h-full">
            <div
              className="w-full max-w-[26px] rounded-t-md bg-peach/30 group-hover:bg-peach transition-all duration-300 relative"
              style={{ height: `${(d.value / max) * 100}%` }}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-ink opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                {unit}
                {d.value}L
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {d.month}
          </span>
        </div>
      ))}
    </div>
  );
}

/* Page header — uppercase sans title with peach eyebrow subtitle */
export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-ink">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-peach mt-1.5">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children ? (
        <div className="flex items-center gap-3 shrink-0">{children}</div>
      ) : null}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200/70 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

/* Section heading used inside cards / list panels */
export function SectionTitle({
  Icon,
  title,
  actionHref,
  actionLabel = "View all",
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-lg bg-peach-soft flex items-center justify-center">
          <Icon className="w-4 h-4 text-peach" />
        </span>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink">
          {title}
        </h2>
      </div>
      {actionHref ? (
        <a
          href={actionHref}
          className="text-[11px] font-semibold uppercase tracking-wide text-peach hover:underline"
        >
          {actionLabel}
        </a>
      ) : null}
    </div>
  );
}
