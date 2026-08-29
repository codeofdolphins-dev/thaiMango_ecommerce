"use client";

import { useState } from "react";
import { Mail, Search } from "lucide-react";
import { CUSTOMERS, formatINR } from "@/components/admin/data";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";

export default function CustomersPage() {
  const [query, setQuery] = useState("");

  const rows = CUSTOMERS.filter((c) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  const totalSpent = CUSTOMERS.reduce((s, c) => s + c.spent, 0);

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle={`${CUSTOMERS.length} registered customers`}
      />

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-6">
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Total Customers
          </span>
          <div className="text-3xl font-bold text-ink mt-2">
            {CUSTOMERS.length}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Lifetime Value
          </span>
          <div className="text-3xl font-bold text-ink mt-2">
            {formatINR(totalSpent)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Gold Members
          </span>
          <div className="text-3xl font-bold text-ink mt-2">
            {CUSTOMERS.filter((c) => c.tier === "Gold").length}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-4 p-4 border-b border-stone-200/70">
          <h2 className="text-base font-bold uppercase tracking-wide text-ink">All Customers</h2>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers…"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F5F4F1] border border-stone-200/70 text-sm focus:outline-none focus:border-peach transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-stone-200/70 bg-[#F5F4F1]">
                <th className="font-semibold px-5 py-3">Customer</th>
                <th className="font-semibold px-5 py-3">Phone</th>
                <th className="font-semibold px-5 py-3">Orders</th>
                <th className="font-semibold px-5 py-3">Spent</th>
                <th className="font-semibold px-5 py-3">Joined</th>
                <th className="font-semibold px-5 py-3">Tier</th>
                <th className="font-semibold px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-stone-100 last:border-0 hover:bg-peach-soft/30 transition"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-peach/15 text-peach flex items-center justify-center font-bold text-sm shrink-0">
                        {c.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-charcoal">{c.name}</div>
                        <div className="text-[11px] text-muted truncate">
                          {c.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                    {c.phone}
                  </td>
                  <td className="px-5 py-3.5 text-charcoal font-medium">
                    {c.orders}
                  </td>
                  <td className="px-5 py-3.5 text-charcoal font-medium whitespace-nowrap">
                    {formatINR(c.spent)}
                  </td>
                  <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                    {c.joined}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={c.tier} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-peach hover:bg-peach-soft transition"
                      aria-label={`Email ${c.name}`}
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-muted text-sm"
                  >
                    No customers match your search.
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
