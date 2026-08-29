"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  CATEGORIES,
  PRODUCTS,
  formatINR,
} from "@/components/admin/data";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";

export default function ProductsPage() {
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const rows = PRODUCTS.filter((p) => {
    const matchCat = category === "all" || p.category === category;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${PRODUCTS.length} products across ${CATEGORIES.length} categories`}
      >
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-peach to-peach-deep text-white text-sm font-semibold hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </PageHeader>

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 border-b border-stone-200/70">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setCategory("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                category === "all"
                  ? "bg-gradient-to-r from-peach to-peach-deep text-white shadow-sm shadow-peach/30"
                  : "text-muted hover:bg-peach-soft"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  category === c
                    ? "bg-gradient-to-r from-peach to-peach-deep text-white shadow-sm shadow-peach/30"
                    : "text-muted hover:bg-peach-soft"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative md:ml-auto md:w-64">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F5F4F1] border border-stone-200/70 text-sm focus:outline-none focus:border-peach transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-stone-200/70 bg-[#F5F4F1]">
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
              {rows.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-stone-100 last:border-0 hover:bg-peach-soft/30 transition"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-11 h-11 rounded-lg object-cover bg-cream shrink-0"
                      />
                      <span className="font-medium text-charcoal max-w-[220px] truncate">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                    {p.sku}
                  </td>
                  <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                    {p.category}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="font-medium text-charcoal">
                      {formatINR(p.price)}
                    </span>
                    {p.compareAt ? (
                      <span className="ml-1.5 text-[11px] text-muted line-through">
                        {formatINR(p.compareAt)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`font-semibold ${
                        p.stock === 0
                          ? "text-rose-600"
                          : p.stock < 50
                            ? "text-amber-600"
                            : "text-charcoal"
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-peach hover:bg-peach-soft transition"
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition"
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-muted text-sm"
                  >
                    No products match your filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
