"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Search } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/ui";
import { unwrap } from "@/lib/http";

interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  flavor_preference: string[];
  created_at: string;
}

export default function CustomersPage() {
  const [query, setQuery] = useState("");

  const customersQuery = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => unwrap<AdminCustomer[]>(axios.get("/api/admin/customers")),
  });

  const customers = customersQuery.data ?? [];

  const rows = customers.filter((c) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  const newestSignup = customers[0];

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle={
          customersQuery.isPending
            ? "Loading…"
            : `${customers.length} registered customer${customers.length === 1 ? "" : "s"}`
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-6">
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Total Customers
          </span>
          <div className="text-3xl font-bold text-charcoal mt-2">
            {customersQuery.isPending ? "…" : customers.length}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Newest Signup
          </span>
          <div className="text-xl font-bold text-charcoal mt-2 truncate">
            {customersQuery.isPending
              ? "…"
              : newestSignup
                ? newestSignup.name
                : "—"}
          </div>
          {newestSignup && (
            <span className="text-xs text-muted">
              {new Date(newestSignup.created_at).toLocaleDateString("en-IN")}
            </span>
          )}
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-4 p-4 border-b border-cream">
          <h2 className="text-base font-bold uppercase tracking-wide text-charcoal">All Customers</h2>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers…"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-ivory border border-cream text-sm focus:outline-none focus:border-accent transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-cream bg-ivory">
                <th className="font-semibold px-5 py-3">Customer</th>
                <th className="font-semibold px-5 py-3">Phone</th>
                <th className="font-semibold px-5 py-3">Flavor Preference</th>
                <th className="font-semibold px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customersQuery.isPending ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted text-sm">
                    Loading customers…
                  </td>
                </tr>
              ) : (
                <>
                  {rows.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-cream/60 last:border-0 hover:bg-cream/30 transition"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-sm shrink-0">
                            {c.name[0]?.toUpperCase() ?? "?"}
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
                      <td className="px-5 py-3.5 text-muted">
                        {c.flavor_preference.length > 0
                          ? c.flavor_preference.join(", ")
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-muted text-sm">
                        {customers.length === 0
                          ? "No customers have signed up yet."
                          : "No customers match your search."}
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
