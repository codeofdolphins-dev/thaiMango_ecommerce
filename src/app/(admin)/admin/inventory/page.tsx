"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, PackageCheck } from "lucide-react";
import { useMoney } from "@/components/admin/useMoney";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";

interface AdminVariant {
  id: number;
  label: string;
  weight_grams: number;
  sku: string;
  price: string;
  compare_at_price: string;
  stock: number;
  is_default: boolean;
}

interface AdminProduct {
  id: string;
  name_en: string;
  productVariant: AdminVariant[];
}

/* One row per variant — stock is tracked per variant, not per product. */
interface StockRow {
  productId: string;
  productName: string;
  variant: AdminVariant;
}

async function throwOnError(res: Response) {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.errors?.[0] || body.message || "Something went wrong");
  }
  return body.data;
}

function StockEditor({
  row,
  onSave,
  saving,
}: {
  row: StockRow;
  onSave: (row: StockRow, stock: number) => void;
  saving: boolean;
}) {
  const current = row.variant.stock;
  const [value, setValue] = useState(String(current));
  const dirty = Number(value) !== current;

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 px-2.5 py-1.5 rounded-lg border border-cream bg-white text-sm font-semibold text-charcoal focus:outline-none focus:border-accent transition"
        aria-label={`Stock for ${row.productName} — ${row.variant.label}`}
      />
      <button
        disabled={!dirty || saving || Number(value) < 0 || !Number.isInteger(Number(value))}
        onClick={() => onSave(row, Number(value))}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white bg-accent hover:opacity-90 transition disabled:opacity-30"
        aria-label={`Save stock for ${row.productName} — ${row.variant.label}`}
      >
        <Check className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function InventoryPage() {
  const { format: money } = useMoney();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: async (): Promise<AdminProduct[]> => {
      const res = await fetch("/api/admin/products");
      return throwOnError(res);
    },
  });

  /* Stock lives on the variant, so a save sends the whole variant set back with
     just this row's stock changed. */
  const stockMutation = useMutation({
    mutationFn: async ({ row, stock }: { row: StockRow; stock: number }) => {
      const product = (productsQuery.data ?? []).find((p) => p.id === row.productId);
      if (!product) throw new Error("Product not found");
      const variants = product.productVariant.map((v) => ({
        id: v.id,
        label: v.label,
        weight_grams: v.weight_grams,
        sku: v.sku,
        price: Number(v.price),
        compare_at_price: Number(v.compare_at_price),
        stock: v.id === row.variant.id ? stock : v.stock,
        is_default: v.is_default,
      }));
      const res = await fetch(`/api/admin/products/${row.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variants }),
      });
      return throwOnError(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => setServerError(error.message),
  });

  const products = productsQuery.data ?? [];
  const rows: StockRow[] = products.flatMap((p) =>
    p.productVariant.map((variant) => ({
      productId: p.id,
      productName: p.name_en,
      variant,
    }))
  );

  const totalUnits = rows.reduce((s, r) => s + r.variant.stock, 0);
  const stockValue = rows.reduce(
    (s, r) => s + r.variant.stock * Number(r.variant.price),
    0
  );
  const lowStock = rows.filter((r) => r.variant.stock > 0 && r.variant.stock < 50);
  const outOfStock = rows.filter((r) => r.variant.stock === 0);

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Stock levels and reorder alerts, tracked per variant."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-6">
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Units in Stock
          </span>
          <div className="text-3xl font-bold text-charcoal mt-2">
            {productsQuery.isPending ? "…" : totalUnits.toLocaleString("en-IN")}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Stock Value
          </span>
          <div className="text-3xl font-bold text-charcoal mt-2">
            {productsQuery.isPending ? "…" : money(stockValue)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Low Stock
          </span>
          <div className="text-3xl font-bold text-amber-600 mt-2">
            {productsQuery.isPending ? "…" : lowStock.length}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Out of Stock
          </span>
          <div className="text-3xl font-bold text-rose-600 mt-2">
            {productsQuery.isPending ? "…" : outOfStock.length}
          </div>
        </Card>
      </div>

      {serverError && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>{lowStock.length + outOfStock.length} variants</strong> need
            attention — restock soon to avoid lost sales.
          </p>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-cream">
          <PackageCheck className="w-4 h-4 text-accent" />
          <h2 className="text-base font-bold uppercase tracking-wide text-charcoal">Stock Levels</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-cream bg-ivory">
                <th className="font-semibold px-5 py-3">Product</th>
                <th className="font-semibold px-5 py-3">Variant</th>
                <th className="font-semibold px-5 py-3">SKU</th>
                <th className="font-semibold px-5 py-3">On Hand</th>
                <th className="font-semibold px-5 py-3 w-1/5">Level</th>
                <th className="font-semibold px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {productsQuery.isPending ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted text-sm">
                    Loading inventory…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted text-sm">
                    No products in the catalog yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const stock = row.variant.stock;
                  const pct = Math.min(100, (stock / 250) * 100);
                  const color =
                    stock === 0
                      ? "bg-rose-500"
                      : stock < 50
                        ? "bg-amber-500"
                        : "bg-emerald-500";
                  return (
                    <tr
                      key={row.variant.id}
                      className="border-b border-cream/60 last:border-0 hover:bg-cream/30 transition"
                    >
                      <td className="px-5 py-3.5 font-medium text-charcoal max-w-[240px] truncate">
                        {row.productName}
                      </td>
                      <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                        {row.variant.label}
                        {row.variant.is_default && (
                          <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                            Default
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                        {row.variant.sku}
                      </td>
                      <td className="px-5 py-3.5">
                        <StockEditor
                          key={`${row.variant.id}-${stock}`}
                          row={row}
                          saving={stockMutation.isPending}
                          onSave={(r, newStock) => {
                            setServerError("");
                            stockMutation.mutate({ row: r, stock: newStock });
                          }}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="w-full h-2 bg-cream rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          status={
                            stock === 0
                              ? "Out of Stock"
                              : stock < 50
                                ? "Low Stock"
                                : "In Stock"
                          }
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
