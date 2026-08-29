"use client";

import { useState } from "react";
import { Download, Eye, Search } from "lucide-react";
import { ORDERS, OrderStatus, formatINR } from "@/components/admin/data";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";

const TABS: (OrderStatus | "All")[] = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function OrdersPage() {
  const [tab, setTab] = useState<OrderStatus | "All">("All");
  const [query, setQuery] = useState("");

  const rows = ORDERS.filter((o) => {
    const matchTab = tab === "All" || o.status === tab;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q);
    return matchTab && matchQuery;
  });

  return (
    <>
      <PageHeader title="Orders" subtitle={`${ORDERS.length} total orders`}>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200/70 bg-white text-sm font-semibold text-charcoal hover:border-peach transition">
          <Download className="w-4 h-4" />
          Export
        </button>
      </PageHeader>

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 border-b border-stone-200/70">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  tab === t
                    ? "bg-gradient-to-r from-peach to-peach-deep text-white shadow-sm shadow-peach/30"
                    : "text-muted hover:bg-peach-soft"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative md:ml-auto md:w-64">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders…"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F5F4F1] border border-stone-200/70 text-sm focus:outline-none focus:border-peach transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-stone-200/70 bg-[#F5F4F1]">
                <th className="font-semibold px-5 py-3">Order ID</th>
                <th className="font-semibold px-5 py-3">Customer</th>
                <th className="font-semibold px-5 py-3">Date</th>
                <th className="font-semibold px-5 py-3">Items</th>
                <th className="font-semibold px-5 py-3">Payment</th>
                <th className="font-semibold px-5 py-3">Total</th>
                <th className="font-semibold px-5 py-3">Status</th>
                <th className="font-semibold px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-stone-100 last:border-0 hover:bg-peach-soft/30 transition"
                >
                  <td className="px-5 py-3.5 font-semibold text-charcoal whitespace-nowrap">
                    {o.id}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="text-charcoal font-medium">{o.customer}</div>
                    <div className="text-[11px] text-muted">{o.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                    {o.date}
                  </td>
                  <td className="px-5 py-3.5 text-muted">{o.items}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-xs font-semibold ${
                        o.payment === "COD" ? "text-amber-600" : "text-emerald-600"
                      }`}
                    >
                      {o.payment}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-charcoal whitespace-nowrap">
                    {formatINR(o.total)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-peach hover:bg-peach-soft transition"
                      aria-label={`View ${o.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-muted text-sm"
                  >
                    No orders match your filters.
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
