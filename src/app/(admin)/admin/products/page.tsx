"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import Select from "react-select";
import { useMoney } from "@/components/admin/useMoney";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { compactSelectStyles, SelectOption } from "@/components/admin/selectStyles";
import { unwrap } from "@/lib/http";
import { defaultVariant, totalStock } from "@/lib/variants";
import { productImage } from "@/lib/images";

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
  slug: string;
  name_en: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  images: string[];
  category: { id: number; slug: string; name_en: string };
  productVariant: AdminVariant[];
}

interface AdminCategory {
  id: number;
  slug: string;
  name_en: string;
}

const STATUS_LABEL: Record<AdminProduct["status"], string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

const STATUS_OPTIONS: SelectOption[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function ProductsPage() {
  const { format: money } = useMoney();
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [serverError, setServerError] = useState("");

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => unwrap<AdminProduct[]>(axios.get("/api/admin/products")),
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => unwrap<AdminCategory[]>(axios.get("/api/admin/categories")),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      unwrap<unknown>(axios.patch(`/api/admin/products/${id}`, { status })),
    onSuccess: invalidate,
    onError: (error: Error) => setServerError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      unwrap<unknown>(axios.delete(`/api/admin/products/${id}`)),
    onSuccess: invalidate,
    onError: (error: Error) => setServerError(error.message),
  });

  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const rows = products.filter((p) => {
    const matchCat = categoryId === "all" || p.category.id === categoryId;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      p.name_en.toLowerCase().includes(q) ||
      p.productVariant.some((v) => v.sku.toLowerCase().includes(q));
    return matchCat && matchQuery;
  });

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={
          productsQuery.isPending
            ? "Loading…"
            : `${products.length} products across ${categories.length} categories`
        }
      >
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-widest hover:bg-burgundy transition"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </PageHeader>

      {serverError && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 border-b border-cream">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setCategoryId("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                categoryId === "all"
                  ? "bg-accent text-white shadow-sm shadow-accent/25"
                  : "text-muted hover:bg-cream"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  categoryId === c.id
                    ? "bg-accent text-white shadow-sm shadow-accent/25"
                    : "text-muted hover:bg-cream"
                }`}
              >
                {c.name_en}
              </button>
            ))}
          </div>
          <div className="relative md:ml-auto md:w-64">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-ivory border border-cream text-sm focus:outline-none focus:border-accent transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-cream bg-ivory">
                <th className="font-semibold px-5 py-3">Product</th>
                <th className="font-semibold px-5 py-3">SKU</th>
                <th className="font-semibold px-5 py-3">Category</th>
                <th className="font-semibold px-5 py-3">Price</th>
                <th className="font-semibold px-5 py-3">Stock</th>
                <th className="font-semibold px-5 py-3">Status</th>
                <th className="font-semibold px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsQuery.isPending ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted text-sm">
                    Loading products…
                  </td>
                </tr>
              ) : (
                <>
                  {rows.map((p) => {
                    const v = defaultVariant(p.productVariant);
                    const variantCount = p.productVariant.length;
                    const stock = totalStock(p.productVariant);
                    const price = v ? Number(v.price) : 0;
                    const compareAt = v ? Number(v.compare_at_price) : 0;
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-cream/60 last:border-0 hover:bg-cream/30 transition"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={productImage(p.images)}
                              alt={p.name_en}
                              className="w-11 h-11 rounded-lg object-cover bg-cream shrink-0"
                            />
                            <span className="font-medium text-charcoal max-w-[220px] truncate">
                              {p.name_en}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                          {v?.sku ?? "—"}
                          {variantCount > 1 && (
                            <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                              +{variantCount - 1} more
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                          {p.category.name_en}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-medium text-charcoal">
                            {v ? money(price) : "—"}
                          </span>
                          {compareAt > price ? (
                            <span className="ml-1.5 text-[11px] text-muted line-through">
                              {money(compareAt)}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`font-semibold ${
                              stock === 0
                                ? "text-rose-600"
                                : stock < 50
                                  ? "text-amber-600"
                                  : "text-charcoal"
                            }`}
                            title={
                              variantCount > 1
                                ? `Combined across ${variantCount} variants`
                                : undefined
                            }
                          >
                            {stock}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={STATUS_LABEL[p.status]} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-[120px]">
                              <Select<SelectOption>
                                instanceId={`status-${p.id}`}
                                options={STATUS_OPTIONS}
                                value={STATUS_OPTIONS.find((o) => o.value === p.status)}
                                isDisabled={statusMutation.isPending}
                                isSearchable={false}
                                styles={compactSelectStyles}
                                menuPortalTarget={
                                  typeof document !== "undefined" ? document.body : undefined
                                }
                                onChange={(opt) => {
                                  if (!opt || opt.value === p.status) return;
                                  setServerError("");
                                  statusMutation.mutate({ id: p.id, status: opt.value });
                                }}
                                aria-label={`Change status of ${p.name_en}`}
                              />
                            </div>
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-accent hover:bg-cream transition"
                              aria-label={`Edit ${p.name_en}`}
                              title="Edit product"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => {
                                if (confirm(`Delete product "${p.name_en}"?`)) {
                                  setServerError("");
                                  deleteMutation.mutate(p.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                              aria-label={`Delete ${p.name_en}`}
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-muted text-sm">
                        {products.length === 0
                          ? "No products yet — add your first product."
                          : "No products match your filters."}
                      </td>
                    </tr>
                  ) : null}
                </>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
