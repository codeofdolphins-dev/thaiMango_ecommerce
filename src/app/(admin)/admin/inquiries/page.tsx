"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Check, Mail, Trash2 } from "lucide-react";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { unwrap } from "@/lib/http";

type InquiryStatus = "NEW" | "RESOLVED";

interface AdminInquiry {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
}

const STATUS_LABEL: Record<InquiryStatus, string> = {
  NEW: "New",
  RESOLVED: "Resolved",
};

const TABS: (InquiryStatus | "ALL")[] = ["ALL", "NEW", "RESOLVED"];

export default function InquiriesPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<InquiryStatus | "ALL">("ALL");
  const [serverError, setServerError] = useState("");

  const inquiriesQuery = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: () => unwrap<AdminInquiry[]>(axios.get("/api/contact")),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });

  const resolveMutation = useMutation({
    mutationFn: (id: number) =>
      unwrap<unknown>(axios.patch(`/api/contact/${id}`, { status: "RESOLVED" })),
    onSuccess: invalidate,
    onError: (error: Error) => setServerError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      unwrap<unknown>(axios.delete(`/api/contact/${id}`)),
    onSuccess: invalidate,
    onError: (error: Error) => setServerError(error.message),
  });

  const inquiries = inquiriesQuery.data ?? [];
  const rows = inquiries.filter((i) => tab === "ALL" || i.status === tab);

  return (
    <>
      <PageHeader
        title="Inquiries"
        subtitle="Messages sent through the contact form"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-6">
        <Card className="p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted/70">
            Total
          </span>
          <div className="text-3xl font-bold text-charcoal mt-2">
            {inquiries.length}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted/70">
            Awaiting Reply
          </span>
          <div className="text-3xl font-bold text-amber-600 mt-2">
            {inquiries.filter((i) => i.status === "NEW").length}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted/70">
            Resolved
          </span>
          <div className="text-3xl font-bold text-charcoal mt-2">
            {inquiries.filter((i) => i.status === "RESOLVED").length}
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
          {inquiriesQuery.isPending ? (
            <p className="p-10 text-center text-muted text-sm">
              Loading inquiries…
            </p>
          ) : rows.length === 0 ? (
            <p className="p-10 text-center text-muted text-sm">
              {inquiries.length === 0
                ? "No inquiries yet — messages from the contact form will appear here."
                : "No inquiries match this filter."}
            </p>
          ) : (
            rows.map((i) => (
              <div key={i.id} className="p-4 md:p-6 hover:bg-cream/20 transition">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold text-charcoal">
                        {i.first_name} {i.last_name}
                      </span>
                      <StatusBadge status={STATUS_LABEL[i.status]} />
                    </div>
                    <div className="text-xs font-semibold text-accent mb-0.5">
                      {i.topic}
                    </div>
                    <div className="text-xs text-muted/70">
                      {i.email}
                      {i.phone ? ` · ${i.phone}` : ""} ·{" "}
                      {new Date(i.created_at).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`mailto:${i.email}?subject=${encodeURIComponent(
                        `Re: ${i.topic}`
                      )}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-charcoal hover:bg-cream transition"
                      aria-label="Reply by email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    {i.status === "NEW" ? (
                      <button
                        onClick={() => {
                          setServerError("");
                          resolveMutation.mutate(i.id);
                        }}
                        disabled={resolveMutation.isPending}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50"
                        aria-label="Mark resolved"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : null}
                    <button
                      onClick={() => {
                        if (confirm("Delete this inquiry?")) {
                          setServerError("");
                          deleteMutation.mutate(i.id);
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
                <p className="text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">
                  {i.message}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  );
}
