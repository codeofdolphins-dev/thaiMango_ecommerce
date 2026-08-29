import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  CATEGORY_SHARE,
  PRODUCTS,
  CATEGORIES,
} from "@/components/admin/data";
import { Card, PageHeader } from "@/components/admin/ui";

const DESCRIPTIONS: Record<string, string> = {
  "Classic Cuts": "Naturally sun-dried strips with no sugar added.",
  "Spiced & Zesty": "Thai chili, lime and tamarind — bold and tangy.",
  "Glazed & Sweet": "Honey-glazed slices, soft and indulgent.",
  "Fusion Blends": "Mango blended with beetroot and botanicals.",
  "Gift Sets": "Curated discovery boxes made for gifting.",
};

export default function CategoriesPage() {
  return (
    <>
      <PageHeader
        title="Categories"
        subtitle={`${CATEGORIES.length} product categories`}
      >
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-peach to-peach-deep text-white text-sm font-semibold hover:opacity-95 transition">
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => {
          const count = PRODUCTS.filter((p) => p.category === cat).length;
          const share =
            CATEGORY_SHARE.find((c) => c.name === cat)?.pct ?? 0;
          return (
            <Card key={cat} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wide text-ink">{cat}</h3>
                  <p className="text-xs text-muted mt-1">
                    {count} product{count === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="w-8 h-8 rounded-lg text-muted hover:text-peach hover:bg-peach-soft transition flex items-center justify-center"
                    aria-label={`Edit ${cat}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    className="w-8 h-8 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition flex items-center justify-center"
                    aria-label={`Delete ${cat}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed mb-5 min-h-[40px]">
                {DESCRIPTIONS[cat]}
              </p>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                    Sales Share
                  </span>
                  <span className="text-xs font-bold text-charcoal">
                    {share}%
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-peach rounded-full"
                    style={{ width: `${share}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
