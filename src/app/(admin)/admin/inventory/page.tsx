import { AlertTriangle, PackageCheck } from "lucide-react";
import { PRODUCTS, formatINR } from "@/components/admin/data";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";

export default function InventoryPage() {
  const totalUnits = PRODUCTS.reduce((s, p) => s + p.stock, 0);
  const stockValue = PRODUCTS.reduce((s, p) => s + p.stock * p.price, 0);
  const lowStock = PRODUCTS.filter((p) => p.stock > 0 && p.stock < 50);
  const outOfStock = PRODUCTS.filter((p) => p.stock === 0);

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Stock levels and reorder alerts across the catalog."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-6">
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Units in Stock
          </span>
          <div className="text-3xl font-bold text-ink mt-2">
            {totalUnits.toLocaleString("en-IN")}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Stock Value
          </span>
          <div className="text-3xl font-bold text-ink mt-2">
            {formatINR(stockValue)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Low Stock
          </span>
          <div className="text-3xl font-bold text-amber-600 mt-2">
            {lowStock.length}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Out of Stock
          </span>
          <div className="text-3xl font-bold text-rose-600 mt-2">
            {outOfStock.length}
          </div>
        </Card>
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>{lowStock.length + outOfStock.length} products</strong> need
            attention — restock soon to avoid lost sales.
          </p>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-stone-200/70">
          <PackageCheck className="w-4 h-4 text-peach" />
          <h2 className="text-base font-bold uppercase tracking-wide text-ink">Stock Levels</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-stone-200/70 bg-[#F5F4F1]">
                <th className="font-semibold px-5 py-3">Product</th>
                <th className="font-semibold px-5 py-3">SKU</th>
                <th className="font-semibold px-5 py-3">On Hand</th>
                <th className="font-semibold px-5 py-3 w-1/3">Level</th>
                <th className="font-semibold px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p) => {
                const pct = Math.min(100, (p.stock / 250) * 100);
                const color =
                  p.stock === 0
                    ? "bg-rose-500"
                    : p.stock < 50
                      ? "bg-amber-500"
                      : "bg-emerald-500";
                return (
                  <tr
                    key={p.id}
                    className="border-b border-stone-100 last:border-0 hover:bg-peach-soft/30 transition"
                  >
                    <td className="px-5 py-3.5 font-medium text-charcoal max-w-[240px] truncate">
                      {p.name}
                    </td>
                    <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                      {p.sku}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-charcoal">
                      {p.stock}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge
                        status={
                          p.stock === 0
                            ? "Out of Stock"
                            : p.stock < 50
                              ? "Low Stock"
                              : "In Stock"
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
