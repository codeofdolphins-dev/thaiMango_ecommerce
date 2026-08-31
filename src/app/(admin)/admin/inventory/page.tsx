"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, PackageCheck } from "lucide-react";
import { formatINR } from "@/components/admin/data";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";

interface AdminVariant {
  id: number;
  sku: string;
  price: string;
  stock: number;
}

interface AdminProduct {
  id: string;
  name_en: string;
  productVariant: AdminVariant | null;
}

async function throwOnError(res: Response) {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.errors?.[0] || body.message || "Something went wrong");
  }
  return body.data;
}

function StockEditor({
  product,
  onSave,
  saving,
}: {
  product: AdminProduct;
  onSave: (id: string, stock: number) => void;
  saving: boolean;
}) {
  const current = product.productVariant?.stock ?? 0;
  const [value, setValue] = useState(String(current));
  const dirty = Number(value) !== current;

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 px-2.5 py-1.5 rounded-lg border border-stone-200/70 bg-white text-sm font-semibold text-charcoal focus:outline-none focus:border-peach transition"
        aria-label={`Stock for ${product.name_en}`}
      />
      <button
        disabled={!dirty || saving || Number(value) < 0 || !Number.isInteger(Number(value))}
        onClick={() => onSave(product.id, Number(value))}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white bg-peach hover:opacity-90 transition disabled:opacity-30"
        aria-label={`Save stock for ${product.name_en}`}
      >
        <Check className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: async (): Promise<AdminProduct[]> => {
      const res = await fetch("/api/admin/products");
      return throwOnError(res);
    },
  });

  const stockMutation = useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant: { stock } }),
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
  const withVariant = products.filter((p) => p.productVariant);
  const totalUnits = withVariant.reduce((s, p) => s + (p.productVariant?.stock ?? 0), 0);
  const stockValue = withVariant.reduce(
    (s, p) => s + (p.productVariant?.stock ?? 0) * Number(p.productVariant?.price ?? 0),
    0
  );
  const lowStock = withVariant.filter(
    (p) => (p.productVariant?.stock ?? 0) > 0 && (p.productVariant?.stock ?? 0) < 50
  );
  const outOfStock = withVariant.filter((p) => (p.productVariant?.stock ?? 0) === 0);

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
            {productsQuery.isPending ? "…" : totalUnits.toLocaleString("en-IN")}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Stock Value
          </span>
          <div className="text-3xl font-bold text-ink mt-2">
            {productsQuery.isPending ? "…" : formatINR(stockValue)}
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
                <th className="font-semibold px-5 py-3 w-1/4">Level</th>
                <th className="font-semibold px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {productsQuery.isPending ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted text-sm">
                    Loading inventory…
                  </td>
                </tr>
              ) : withVariant.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted text-sm">
                    No products in the catalog yet.
                  </td>
                </tr>
              ) : (
                withVariant.map((p) => {
                  const stock = p.productVariant?.stock ?? 0;
                  const pct = Math.min(100, (stock / 250) * 100);
                  const color =
                    stock === 0
                      ? "bg-rose-500"
                      : stock < 50
                        ? "bg-amber-500"
                        : "bg-emerald-500";
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-stone-100 last:border-0 hover:bg-peach-soft/30 transition"
                    >
                      <td className="px-5 py-3.5 font-medium text-charcoal max-w-[240px] truncate">
                        {p.name_en}
                      </td>
                      <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                        {p.productVariant?.sku}
                      </td>
                      <td className="px-5 py-3.5">
                        <StockEditor
                          product={p}
                          saving={stockMutation.isPending}
                          onSave={(id, newStock) => {
                            setServerError("");
                            stockMutation.mutate({ id, stock: newStock });
                          }}
                        />
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
