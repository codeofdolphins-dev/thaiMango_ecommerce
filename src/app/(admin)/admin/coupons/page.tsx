import { Pencil, Plus, Ticket, Trash2 } from "lucide-react";
import { COUPONS } from "@/components/admin/data";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";

export default function CouponsPage() {
  return (
    <>
      <PageHeader title="Coupons" subtitle="Discount codes & promotions">
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-peach to-peach-deep text-white text-sm font-semibold uppercase tracking-wide shadow-sm shadow-peach/30 hover:opacity-95 transition">
          <Plus className="w-4 h-4" />
          New Coupon
        </button>
      </PageHeader>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-stone-200/70 bg-[#F5F4F1]">
                <th className="font-semibold px-5 py-3.5">Code</th>
                <th className="font-semibold px-5 py-3.5">Description</th>
                <th className="font-semibold px-5 py-3.5">Discount</th>
                <th className="font-semibold px-5 py-3.5">Usage</th>
                <th className="font-semibold px-5 py-3.5">Expires</th>
                <th className="font-semibold px-5 py-3.5">Status</th>
                <th className="font-semibold px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {COUPONS.map((c) => (
                <tr
                  key={c.code}
                  className="border-b border-stone-100 last:border-0 hover:bg-peach-soft/30 transition"
                >
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 font-bold text-ink">
                      <span className="w-7 h-7 rounded-lg bg-peach-soft flex items-center justify-center">
                        <Ticket className="w-3.5 h-3.5 text-peach" />
                      </span>
                      {c.code}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{c.description}</td>
                  <td className="px-5 py-4 font-semibold text-peach">
                    {c.discount}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="text-charcoal font-medium text-xs mb-1">
                      {c.used} / {c.limit}
                    </div>
                    <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-peach rounded-full"
                        style={{
                          width: `${Math.min(100, (c.used / c.limit) * 100)}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                    {c.expires}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-peach hover:bg-peach-soft transition"
                        aria-label={`Edit ${c.code}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        aria-label={`Delete ${c.code}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
