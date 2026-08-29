"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FileText,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Ticket,
  Users,
  X,
} from "lucide-react";

const NAV: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: LayoutGrid },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/reviews", label: "Reviews", Icon: MessageSquare },
  { href: "/admin/coupons", label: "Coupons", Icon: Ticket },
  { href: "/admin/site-content", label: "Site Content", Icon: FileText },
  { href: "/admin/customers", label: "Customers", Icon: Users },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export default function AdminSidebar({
  mobileOpen,
  collapsed,
  onClose,
}: {
  mobileOpen: boolean;
  collapsed: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen shrink-0 bg-white border-r border-stone-200/80 flex flex-col transition-all duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-[248px] lg:w-[84px]" : "w-[248px]"}`}
      >
        {/* Brand */}
        <div
          className={`h-[72px] flex items-center gap-3 border-b border-stone-200/70 shrink-0 ${
            collapsed ? "lg:justify-center px-4" : "px-5"
          }`}
        >
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 min-w-0"
          >
            <img
              src="/images/logo.png"
              alt="Thai Mango"
              className="w-10 h-10 object-contain rounded-full shadow-sm shrink-0"
            />
            <div className={`leading-tight ${collapsed ? "lg:hidden" : ""}`}>
              <span className="block text-sm font-bold tracking-wide text-ink uppercase">
                Thai Mango
              </span>
              <span className="block text-[10px] tracking-[0.2em] uppercase text-peach font-semibold">
                Command Center
              </span>
            </div>
          </Link>
          <button
            className="lg:hidden ml-auto p-1.5 text-slate-400 hover:text-ink"
            aria-label="Close menu"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-5 space-y-1.5">
          <p
            className={`px-3 mb-2 text-[10px] tracking-[0.2em] uppercase text-slate-400 font-semibold ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            Navigation
          </p>
          {NAV.map(({ href, label, Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold uppercase tracking-wide transition group ${
                  collapsed ? "lg:justify-center" : ""
                } ${
                  active
                    ? "bg-gradient-to-r from-peach to-peach-deep text-white shadow-md shadow-peach/30"
                    : "text-slate-600 hover:bg-peach-soft"
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    active ? "text-white" : "text-peach"
                  }`}
                />
                <span className={collapsed ? "lg:hidden" : ""}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-stone-200/70 shrink-0 space-y-1">
          <Link
            href="/"
            target="_blank"
            title={collapsed ? "Public Site" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold uppercase tracking-wide text-slate-600 hover:bg-peach-soft transition ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            <ExternalLink className="w-[18px] h-[18px] text-peach shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Public Site</span>
          </Link>
          <Link
            href="/login"
            title={collapsed ? "Sign Out" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold uppercase tracking-wide text-rose-500 hover:bg-rose-50 transition ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Sign Out</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
