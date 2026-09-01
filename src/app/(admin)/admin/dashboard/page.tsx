"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Clock,
  MessageSquare,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMoney } from "@/components/admin/useMoney";
import {
  Card,
  PageHeader,
  SectionTitle,
  StatCard,
} from "@/components/admin/ui";

interface Stats {
  products: number;
  activeProducts: number;
  categories: number;
  customers: number;
  outOfStock: number;
  lowStock: number;
  orders: number;
  revenue: number;
  pendingReviews: number;
}

interface AdminOrder {
  id: string;
  order_no: number;
  status: string;
  total: string;
  created_at: string;
  user: { name: string; email: string };
}

interface AdminReview {
  id: number;
  rating: number;
  status: string;
  product: { name_en: string };
  user: { name: string };
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= n ? "text-amber-400 fill-amber-400" : "text-muted/50"
          }`}
        />
      ))}
    </span>
  );
}

export default function DashboardPage() {
  const { format: money } = useMoney();
  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<Stats> => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      return (await res.json()).data;
    },
  });

  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async (): Promise<AdminOrder[]> => {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to load orders");
      return (await res.json()).data;
    },
  });

  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async (): Promise<AdminReview[]> => {
      const res = await fetch("/api/admin/reviews");
      if (!res.ok) throw new Error("Failed to load reviews");
      return (await res.json()).data;
    },
  });

  const stats = statsQuery.data;

  return (
    <>
      <PageHeader title="Overview" subtitle="Real-time platform performance" />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-6">
        <StatCard
          Icon={TrendingUp}
          chip="Live"
          label="Total Revenue"
          value={stats ? money(stats.revenue) : "…"}
        />
        <StatCard
          Icon={ShoppingBag}
          chip="Total"
          label="Orders"
          value={stats ? String(stats.orders) : "…"}
        />
        <StatCard
          Icon={Package}
          chip="Catalog"
          label="Products"
          value={stats ? String(stats.products) : "…"}
        />
        <StatCard
          Icon={Users}
          chip="Growth"
          label="Customers"
          value={stats ? String(stats.customers) : "…"}
        />
      </div>

      {(stats?.outOfStock || stats?.lowStock || stats?.pendingReviews) ? (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          {stats.outOfStock + stats.lowStock > 0 && (
            <span>
              <strong>
                {stats.outOfStock} out of stock, {stats.lowStock} low stock
              </strong>{" "}
              — check the{" "}
              <Link href="/admin/inventory" className="underline">
                inventory
              </Link>
              .{" "}
            </span>
          )}
          {stats.pendingReviews > 0 && (
            <span>
              <strong>{stats.pendingReviews} review{stats.pendingReviews === 1 ? "" : "s"}</strong>{" "}
              awaiting{" "}
              <Link href="/admin/reviews" className="underline">
                moderation
              </Link>
              .
            </span>
          )}
        </div>
      ) : null}

      {/* Recent orders + reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* Recent Orders */}
        <Card className="p-5 md:p-6">
          <SectionTitle
            Icon={ShoppingBag}
            title="Recent Orders"
            actionHref="/admin/orders"
          />
          <div className="space-y-3">
            {ordersQuery.isPending ? (
              <p className="text-sm text-muted py-6 text-center">Loading…</p>
            ) : (ordersQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">
                No orders yet — they&apos;ll appear here once customers start ordering.
              </p>
            ) : (
              (ordersQuery.data ?? []).slice(0, 4).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center gap-4 p-3.5 rounded-xl border border-cream hover:border-accent/50 hover:bg-cream/40 transition group"
                >
                  <span className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-muted/70 shrink-0">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-charcoal uppercase tracking-wide truncate">
                      Order #TM-{String(o.order_no).padStart(5, "0")}
                    </div>
                    <div className="text-xs text-muted/70 font-medium">
                      {money(Number(o.total))} · {o.user.name}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-muted">
                      {new Date(o.created_at).toLocaleDateString("en-IN")}
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wide text-accent">
                      {o.status}
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted/50 group-hover:text-accent transition shrink-0" />
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Reviews */}
        <Card className="p-5 md:p-6">
          <SectionTitle
            Icon={MessageSquare}
            title="Recent Reviews"
            actionHref="/admin/reviews"
          />
          <div className="space-y-3">
            {reviewsQuery.isPending ? (
              <p className="text-sm text-muted py-6 text-center">Loading…</p>
            ) : (reviewsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">
                No reviews yet — they&apos;ll appear here once customers start reviewing.
              </p>
            ) : (
              (reviewsQuery.data ?? []).slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 p-3.5 rounded-xl border border-cream hover:border-accent/50 hover:bg-cream/40 transition group"
                >
                  <span className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-muted/70 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-charcoal truncate">
                      {r.product.name_en}
                    </div>
                    <div className="text-xs text-muted/70 font-medium">{r.user.name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <Stars n={r.rating} />
                    <div className="text-[11px] font-bold uppercase tracking-wide text-accent mt-1">
                      {r.status}
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted/50 group-hover:text-accent transition shrink-0" />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
