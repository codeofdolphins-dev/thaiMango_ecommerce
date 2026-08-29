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
import { ORDERS, PRODUCTS, REVIEWS, formatINR } from "@/components/admin/data";
import {
  Card,
  PageHeader,
  SectionTitle,
  StatCard,
} from "@/components/admin/ui";

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= n ? "text-amber-400 fill-amber-400" : "text-stone-300"
          }`}
        />
      ))}
    </span>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Overview" subtitle="Real-time platform performance" />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-6">
        <StatCard
          Icon={TrendingUp}
          chip="Live"
          label="Total Revenue"
          value="₹4,82,650"
        />
        <StatCard
          Icon={ShoppingBag}
          chip="Total"
          label="Orders"
          value="1,284"
        />
        <StatCard
          Icon={Package}
          chip="Catalog"
          label="Products"
          value={String(PRODUCTS.length)}
        />
        <StatCard
          Icon={Users}
          chip="Growth"
          label="Active Users"
          value="3,942"
        />
      </div>

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
            {ORDERS.slice(0, 4).map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-4 p-3.5 rounded-xl border border-stone-200/70 hover:border-peach/50 hover:bg-peach-soft/40 transition group"
              >
                <span className="w-10 h-10 rounded-full bg-[#F5F4F1] flex items-center justify-center text-slate-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-ink uppercase tracking-wide truncate">
                    Order #{o.id.split("-").pop()}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {formatINR(o.total)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold text-slate-500">
                    {o.date}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-peach">
                    {o.status}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-peach transition shrink-0" />
              </div>
            ))}
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
            {REVIEWS.slice(0, 4).map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-4 p-3.5 rounded-xl border border-stone-200/70 hover:border-peach/50 hover:bg-peach-soft/40 transition group"
              >
                <span className="w-10 h-10 rounded-full bg-[#F5F4F1] flex items-center justify-center text-slate-400 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-ink truncate">
                    {r.product}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {r.customer}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Stars n={r.rating} />
                  <div className="text-[11px] font-bold uppercase tracking-wide text-peach mt-1">
                    {r.status}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-peach transition shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
