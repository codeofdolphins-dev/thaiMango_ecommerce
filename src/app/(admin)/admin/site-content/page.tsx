"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, FileText, Pencil, X } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/ui";

interface ContentBlock {
  id: string;
  section: string;
  location: string;
  content: string;
  updated_at: string;
}

async function throwOnError(res: Response) {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.errors?.[0] || body.message || "Something went wrong");
  }
  return body.data;
}

export default function SiteContentPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [serverError, setServerError] = useState("");

  const blocksQuery = useQuery({
    queryKey: ["admin-site-content"],
    queryFn: async (): Promise<ContentBlock[]> => {
      const res = await fetch("/api/admin/site-content");
      return throwOnError(res);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const res = await fetch(`/api/admin/site-content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      return throwOnError(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-content"] });
      setEditingId(null);
    },
    onError: (error: Error) => setServerError(error.message),
  });

  const blocks = blocksQuery.data ?? [];

  return (
    <>
      <PageHeader title="Site Content" subtitle="Manage storefront copy & blocks" />

      {serverError && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      {blocksQuery.isPending ? (
        <p className="text-sm text-muted py-16 text-center">Loading content blocks…</p>
      ) : blocks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-muted">
            No content blocks yet — run <code>bun run seed</code> to create the default
            storefront blocks.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {blocks.map((block) => {
            const isEditing = editingId === block.id;
            return (
              <Card key={block.id} className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-accent" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-charcoal">
                        {block.section}
                      </h3>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                        {block.location}
                      </span>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setServerError("");
                          saveMutation.mutate({ id: block.id, content: draft });
                        }}
                        disabled={saveMutation.isPending || !draft.trim()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-white text-xs font-semibold hover:bg-burgundy transition disabled:opacity-50"
                        aria-label={`Save ${block.section}`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {saveMutation.isPending ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted/70 hover:text-charcoal hover:bg-cream transition"
                        aria-label="Cancel editing"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setServerError("");
                        setEditingId(block.id);
                        setDraft(block.content);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cream text-xs font-semibold text-charcoal/80 hover:border-accent hover:text-accent transition shrink-0"
                      aria-label={`Edit ${block.section}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="w-full mt-4 px-4 py-2.5 rounded-xl border border-cream bg-white text-sm focus:outline-none focus:border-accent transition resize-y"
                    aria-label={`Content for ${block.section}`}
                  />
                ) : (
                  <p className="text-sm text-muted leading-relaxed mt-4 line-clamp-2">
                    {block.content}
                  </p>
                )}
                <p className="text-[11px] text-muted/70 mt-3">
                  Last updated {new Date(block.updated_at).toLocaleDateString("en-IN")}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
