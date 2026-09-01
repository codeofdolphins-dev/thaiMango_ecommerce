"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Star, Trash2 } from "lucide-react";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";

type ReviewStatus = "PENDING" | "PUBLISHED";

interface AdminReview {
  id: number;
  rating: number;
  text: string;
  status: ReviewStatus;
  created_at: string;
  product: { name_en: string; slug: string };
  user: { name: string };
}

const STATUS_LABEL: Record<ReviewStatus, string> = {
  PENDING: "Pending",
  PUBLISHED: "Published",
};

const TABS: (ReviewStatus | "ALL")[] = ["ALL", "PUBLISHED", "PENDING"];

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= n ? "text-amber-400 fill-amber-400" : "text-muted/50"
          }`}
        />
      ))}
    </span>
  );
}

async function throwOnError(res: Response) {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.errors?.[0] || body.message || "Something went wrong");
  }
  return body.data;
}

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<ReviewStatus | "ALL">("ALL");
  const [serverError, setServerError] = useState("");

  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async (): Promise<AdminReview[]> => {
      const res = await fetch("/api/admin/reviews");
      return throwOnError(res);
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
      return throwOnError(res);
    },
    onSuccess: invalidate,
    onError: (error: Error) => setServerError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      return throwOnError(res);
    },
    onSuccess: invalidate,
    onError: (error: Error) => setServerError(error.message),
  });

  const reviews = reviewsQuery.data ?? [];
  const rows = reviews.filter((r) => tab === "ALL" || r.status === tab);
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1);

  return (
    <>
      <PageHeader title="Reviews" subtitle="Moderate customer product reviews" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-6">
        <Card className="p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted/70">
            Average Rating
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-3xl font-bold text-charcoal">
              {reviews.length === 0 ? "—" : avg.toFixed(1)}
            </span>
            {reviews.length > 0 && <Stars n={Math.round(avg)} />}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted/70">
            Published
          </span>
          <div className="text-3xl font-bold text-charcoal mt-2">
            {reviews.filter((r) => r.status === "PUBLISHED").length}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted/70">
            Awaiting Moderation
          </span>
          <div className="text-3xl font-bold text-amber-600 mt-2">
            {reviews.filter((r) => r.status === "PENDING").length}
          </div>
        </Card>
      </div>

      {serverError && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center gap-1 p-4 border-b border-cream">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition ${
                tab === t
                  ? "bg-accent text-white shadow-sm shadow-accent/25"
                  : "text-muted hover:bg-cream"
              }`}
            >
              {t === "ALL" ? "All" : STATUS_LABEL[t]}
            </button>
          ))}
        </div>

        <div className="divide-y divide-cream">
          {reviewsQuery.isPending ? (
            <p className="p-10 text-center text-muted text-sm">Loading reviews…</p>
          ) : rows.length === 0 ? (
            <p className="p-10 text-center text-muted text-sm">
              {reviews.length === 0
                ? "No reviews yet — they'll appear here once customers start reviewing products."
                : "No reviews match this filter."}
            </p>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="p-4 md:p-6 hover:bg-cream/20 transition">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Stars n={r.rating} />
                      <StatusBadge status={STATUS_LABEL[r.status]} />
                    </div>
                    <div className="text-sm font-bold text-charcoal">{r.product.name_en}</div>
                    <div className="text-xs text-muted/70">
                      {r.user.name} · {new Date(r.created_at).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {r.status === "PENDING" ? (
                      <button
                        onClick={() => {
                          setServerError("");
                          approveMutation.mutate(r.id);
                        }}
                        disabled={approveMutation.isPending}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50"
                        aria-label="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : null}
                    <button
                      onClick={() => {
                        if (confirm("Delete this review?")) {
                          setServerError("");
                          deleteMutation.mutate(r.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 transition disabled:opacity-50"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-charcoal/80 leading-relaxed">
                  &ldquo;{r.text}&rdquo;
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  );
}
