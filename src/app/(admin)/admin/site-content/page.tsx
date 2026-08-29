import { FileText, Pencil } from "lucide-react";
import { SITE_CONTENT } from "@/components/admin/data";
import { Card, PageHeader } from "@/components/admin/ui";

export default function SiteContentPage() {
  return (
    <>
      <PageHeader
        title="Site Content"
        subtitle="Manage storefront copy & blocks"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {SITE_CONTENT.map((block) => (
          <Card key={block.id} className="p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-peach-soft flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-peach" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-ink">
                    {block.section}
                  </h3>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-peach">
                    {block.location}
                  </span>
                </div>
              </div>
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200/70 text-xs font-semibold text-slate-600 hover:border-peach hover:text-peach transition shrink-0"
                aria-label={`Edit ${block.section}`}
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mt-4 line-clamp-2">
              {block.snippet}
            </p>
            <p className="text-[11px] text-slate-400 mt-3">
              Last updated {block.updated}
            </p>
          </Card>
        ))}
      </div>
    </>
  );
}
