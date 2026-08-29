"use client";

import { useState } from "react";
import { Check, Star, Trash2 } from "lucide-react";
import { REVIEWS, ReviewStatus } from "@/components/admin/data";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";

const TABS: (ReviewStatus | "All")[] = ["All", "Published", "Pending"];

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= n ? "text-amber-400 fill-amber-400" : "text-stone-300"
          }`}
        />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const [tab, setTab] = useState<ReviewStatus | "All">("All");
  const rows = REVIEWS.filter((r) => tab === "All" || r.status === tab);

  const avg =
    REVIEWS.reduce((s, r) => s + r.rating, 0) / (REVIEWS.length || 1);

  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle="Moderate customer product reviews"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-6">
        <Card className="p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Average Rating
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-3xl font-bold text-ink">
              {avg.toFixed(1)}
            </span>
            <Stars n={Math.round(avg)} />
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Published
          </span>
          <div className="text-3xl font-bold text-ink mt-2">
            {REVIEWS.filter((r) => r.status === "Published").length}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Awaiting Moderation
          </span>
          <div className="text-3xl font-bold text-amber-600 mt-2">
            {REVIEWS.filter((r) => r.status === "Pending").length}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-1 p-4 border-b border-stone-200/70">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition ${
                tab === t
                  ? "bg-gradient-to-r from-peach to-peach-deep text-white shadow-sm shadow-peach/30"
                  : "text-slate-500 hover:bg-peach-soft"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="divide-y divide-stone-100">
          {rows.map((r) => (
            <div key={r.id} className="p-4 md:p-6 hover:bg-peach-soft/20 transition">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Stars n={r.rating} />
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="text-sm font-bold text-ink">{r.product}</div>
                  <div className="text-xs text-slate-400">
                    {r.customer} · {r.date}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {r.status === "Pending" ? (
                    <button
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition"
                      aria-label="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : null}
                  <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 transition"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                &ldquo;{r.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
