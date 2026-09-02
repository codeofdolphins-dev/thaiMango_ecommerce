"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { HelpCircle, Pencil, Plus, Power, Trash2, X } from "lucide-react";
import type { z } from "zod";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { unwrap } from "@/lib/http";
import {
  faqSchema,
  FaqValues,
  FAQ_CATEGORIES,
  FaqCategoryId,
} from "@/schemas/faq.schema";

type FaqFormInput = z.input<typeof faqSchema>;

interface AdminFaq {
  id: number;
  category: FaqCategoryId;
  question: string;
  answer: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-cream bg-white text-sm focus:outline-none focus:border-accent transition placeholder:text-muted/60";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5";

const CATEGORY_LABEL = Object.fromEntries(
  FAQ_CATEGORIES.map((c) => [c.id, c.label])
) as Record<FaqCategoryId, string>;

export default function FaqsPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tab, setTab] = useState<FaqCategoryId | "ALL">("ALL");
  const [serverError, setServerError] = useState("");

  const faqsQuery = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: () => unwrap<AdminFaq[]>(axios.get("/api/faqs")),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FaqFormInput, unknown, FaqValues>({
    resolver: zodResolver(faqSchema),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
    queryClient.invalidateQueries({ queryKey: ["public-faqs"] });
  };

  const saveMutation = useMutation({
    mutationFn: (values: FaqValues) =>
      unwrap<unknown>(
        editingId === null
          ? axios.post("/api/faqs", values)
          : axios.patch(`/api/faqs/${editingId}`, values)
      ),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
    onError: (error: Error) => setServerError(error.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (faq: AdminFaq) =>
      unwrap<unknown>(
        axios.patch(`/api/faqs/${faq.id}`, { is_active: !faq.is_active })
      ),
    onSuccess: invalidate,
    onError: (error: Error) => setServerError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => unwrap<unknown>(axios.delete(`/api/faqs/${id}`)),
    onSuccess: invalidate,
    onError: (error: Error) => setServerError(error.message),
  });

  const faqs = faqsQuery.data ?? [];

  const openCreate = () => {
    setEditingId(null);
    setServerError("");
    /* Default the new question to the end of its (first) category. */
    reset({
      category: FAQ_CATEGORIES[0].id,
      question: "",
      answer: "",
      position: faqs.filter((f) => f.category === FAQ_CATEGORIES[0].id).length,
      is_active: true,
    });
    setFormOpen(true);
  };

  const openEdit = (faq: AdminFaq) => {
    setEditingId(faq.id);
    setServerError("");
    reset({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      position: faq.position,
      is_active: faq.is_active,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setServerError("");
  };

  const rows = faqs.filter((f) => tab === "ALL" || f.category === tab);

  return (
    <>
      <PageHeader title="FAQs" subtitle="Questions shown on the public FAQ page">
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-widest shadow-sm shadow-accent/25 hover:bg-burgundy transition"
        >
          <Plus className="w-4 h-4" />
          New FAQ
        </button>
      </PageHeader>

      {formOpen && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold uppercase tracking-wide text-charcoal">
              {editingId === null ? "New FAQ" : "Edit FAQ"}
            </h2>
            <button
              onClick={closeForm}
              className="w-8 h-8 rounded-lg text-muted hover:text-charcoal hover:bg-cream transition flex items-center justify-center"
              aria-label="Close form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form
            onSubmit={handleSubmit((values) => {
              setServerError("");
              saveMutation.mutate(values);
            })}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
          >
            <div>
              <label className={labelCls}>Topic</label>
              <select className={inputCls} {...register("category")}>
                {FAQ_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-[11px] text-rose-600 mt-1">Pick a topic</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Order</label>
              <input
                type="number"
                className={inputCls}
                placeholder="0"
                {...register("position")}
              />
              <p className="text-[11px] text-muted mt-1">
                Lower shows first within the topic.
              </p>
            </div>
            <div>
              <label className={labelCls}>Visibility</label>
              <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-cream bg-white text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-[#7A1233] w-4 h-4"
                  {...register("is_active")}
                />
                <span className="text-charcoal">Visible on the public page</span>
              </label>
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Question</label>
              <input
                className={inputCls}
                placeholder="How long does shipping take?"
                {...register("question")}
              />
              {errors.question && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.question.message}
                </p>
              )}
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Answer</label>
              <textarea
                rows={4}
                className={`${inputCls} resize-y`}
                placeholder="Write the answer shoppers will read…"
                {...register("answer")}
              />
              {errors.answer && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.answer.message}
                </p>
              )}
            </div>
            <div className="sm:col-span-3 flex items-center gap-3">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-5 py-2.5 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-widest hover:bg-burgundy transition disabled:opacity-60"
              >
                {saveMutation.isPending
                  ? "Saving…"
                  : editingId === null
                    ? "Create FAQ"
                    : "Save Changes"}
              </button>
              {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
            </div>
          </form>
        </Card>
      )}

      {serverError && !formOpen && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center gap-1 p-4 border-b border-cream overflow-x-auto">
          {(["ALL", ...FAQ_CATEGORIES.map((c) => c.id)] as (FaqCategoryId | "ALL")[]).map(
            (t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition ${
                  tab === t
                    ? "bg-accent text-white shadow-sm shadow-accent/25"
                    : "text-muted hover:bg-cream"
                }`}
              >
                {t === "ALL" ? "All" : CATEGORY_LABEL[t]}
              </button>
            )
          )}
        </div>

        <div className="divide-y divide-cream">
          {faqsQuery.isPending ? (
            <p className="p-10 text-center text-muted text-sm">Loading FAQs…</p>
          ) : rows.length === 0 ? (
            <p className="p-10 text-center text-muted text-sm">
              {faqs.length === 0
                ? "No FAQs yet — add your first question, or run the seeder for the launch set."
                : "No FAQs in this topic."}
            </p>
          ) : (
            rows.map((faq) => (
              <div key={faq.id} className="p-4 md:p-6 hover:bg-cream/20 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                      <span className="w-7 h-7 rounded-lg bg-cream flex items-center justify-center shrink-0">
                        <HelpCircle className="w-3.5 h-3.5 text-accent" />
                      </span>
                      <span className="text-sm font-bold text-charcoal">
                        {faq.question}
                      </span>
                      <StatusBadge status={faq.is_active ? "Published" : "Draft"} />
                    </div>
                    <div className="text-[11px] text-muted/70 mb-2">
                      {CATEGORY_LABEL[faq.category] ?? faq.category} · position{" "}
                      {faq.position}
                    </div>
                    <p className="text-sm text-charcoal/70 leading-relaxed line-clamp-2">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setServerError("");
                        toggleMutation.mutate(faq);
                      }}
                      disabled={toggleMutation.isPending}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-50 ${
                        faq.is_active
                          ? "text-emerald-600 hover:bg-emerald-50"
                          : "text-muted/70 hover:bg-cream"
                      }`}
                      aria-label={faq.is_active ? "Hide from public page" : "Show on public page"}
                      title={faq.is_active ? "Hide" : "Show"}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(faq)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted/70 hover:text-accent hover:bg-cream transition"
                      aria-label="Edit FAQ"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this FAQ?")) {
                          setServerError("");
                          deleteMutation.mutate(faq.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted/70 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                      aria-label="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  );
}
