"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Select from "react-select";
import { useMoney } from "@/components/admin/useMoney";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { compactSelectStyles, SelectOption } from "@/components/admin/selectStyles";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface AdminOrder {
  id: string;
  order_no: number;
  status: OrderStatus;
  payment: "PREPAID" | "COD";
  total: string;
  created_at: string;
  user: { name: string; email: string };
  _count: { items: number };
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_OPTIONS: SelectOption[] = (
  Object.entries(STATUS_LABEL) as [OrderStatus, string][]
).map(([value, label]) => ({ value, label }));

const TABS: (OrderStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

async function throwOnError(res: Response) {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.errors?.[0] || body.message || "Something went wrong");
  }
  return body.data;
}

export default function OrdersPage() {
  const { format: money } = useMoney();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<OrderStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [serverError, setServerError] = useState("");

  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async (): Promise<AdminOrder[]> => {
      const res = await fetch("/api/admin/orders");
      return throwOnError(res);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return throwOnError(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error: Error) => setServerError(error.message),
  });

  const orders = ordersQuery.data ?? [];

  const rows = orders.filter((o) => {
    const matchTab = tab === "ALL" || o.status === tab;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      `tm-${o.order_no}`.includes(q) ||
      o.user.name.toLowerCase().includes(q) ||
      o.user.email.toLowerCase().includes(q);
    return matchTab && matchQuery;
  });

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={
          ordersQuery.isPending
            ? "Loading…"
            : `${orders.length} total order${orders.length === 1 ? "" : "s"}`
        }
      />

      {serverError && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 border-b border-cream">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  tab === t
                    ? "bg-accent text-white shadow-sm shadow-accent/25"
                    : "text-muted hover:bg-cream"
                }`}
              >
                {t === "ALL" ? "All" : STATUS_LABEL[t]}
              </button>
            ))}
          </div>
          <div className="relative md:ml-auto md:w-64">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders…"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-ivory border border-cream text-sm focus:outline-none focus:border-accent transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-cream bg-ivory">
                <th className="font-semibold px-5 py-3">Order</th>
                <th className="font-semibold px-5 py-3">Customer</th>
                <th className="font-semibold px-5 py-3">Date</th>
                <th className="font-semibold px-5 py-3">Items</th>
                <th className="font-semibold px-5 py-3">Payment</th>
                <th className="font-semibold px-5 py-3">Total</th>
                <th className="font-semibold px-5 py-3">Status</th>
                <th className="font-semibold px-5 py-3 text-right">Update</th>
              </tr>
            </thead>
            <tbody>
              {ordersQuery.isPending ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted text-sm">
                    Loading orders…
                  </td>
                </tr>
              ) : (
                <>
                  {rows.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-cream/60 last:border-0 hover:bg-cream/30 transition"
                    >
                      <td className="px-5 py-3.5 font-semibold text-charcoal whitespace-nowrap">
                        TM-{String(o.order_no).padStart(5, "0")}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="text-charcoal font-medium">{o.user.name}</div>
                        <div className="text-[11px] text-muted">{o.user.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5 text-muted">{o._count.items}</td>
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
                        {money(Number(o.total))}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={STATUS_LABEL[o.status]} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end">
                          <div className="w-[130px]">
                            <Select<SelectOption>
                              instanceId={`order-status-${o.id}`}
                              options={STATUS_OPTIONS}
                              value={STATUS_OPTIONS.find((s) => s.value === o.status)}
                              isDisabled={statusMutation.isPending}
                              isSearchable={false}
                              styles={compactSelectStyles}
                              menuPortalTarget={
                                typeof document !== "undefined" ? document.body : undefined
                              }
                              onChange={(opt) => {
                                if (!opt || opt.value === o.status) return;
                                setServerError("");
                                statusMutation.mutate({ id: o.id, status: opt.value });
                              }}
                              aria-label={`Update status of order ${o.order_no}`}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-muted text-sm">
                        {orders.length === 0
                          ? "No orders yet — they'll appear here once customers start ordering."
                          : "No orders match your filters."}
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
