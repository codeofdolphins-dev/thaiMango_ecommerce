"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";
import {
  ExternalLink,
  FileText,
  FolderTree,
  HelpCircle,
  Inbox,
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
  { href: "/admin/categories", label: "Categories", Icon: FolderTree },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/reviews", label: "Reviews", Icon: MessageSquare },
  { href: "/admin/inquiries", label: "Inquiries", Icon: Inbox },
  { href: "/admin/coupons", label: "Coupons", Icon: Ticket },
  { href: "/admin/site-content", label: "Site Content", Icon: FileText },
  { href: "/admin/faqs", label: "FAQs", Icon: HelpCircle },
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
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen shrink-0 bg-white border-r border-cream flex flex-col transition-all duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-62 lg:w21" : "w-62"}`}
      >
        {/* Brand */}
        <div
          className={`h-18 flex items-center gap-3 border-b border-cream shrink-0 ${
            collapsed ? "lg:justify-center px-4" : "px-5"
          }`}
        >
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 min-w-0"
          >
            <img
              src="/brand/logo.svg"
              alt="Bangkok Mango"
              className={`h-11 w-auto shrink-0 ${collapsed ? "lg:h-9" : ""}`}
            />
            <div className={`leading-tight ${collapsed ? "lg:hidden" : ""}`}>
              <span className="block text-[10px] tracking-[0.2em] uppercase text-accent font-bold">
                Command Center
              </span>
            </div>
          </Link>
          <button
            className="lg:hidden ml-auto p-1.5 text-muted/70 hover:text-charcoal"
            aria-label="Close menu"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-5 space-y-1.5">
          <p
            className={`px-3 mb-2 text-[10px] tracking-[0.2em] uppercase text-muted/70 font-semibold ${
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
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-semibold tracking-wide transition ${
                  collapsed ? "lg:justify-center" : ""
                } ${
                  active
                    ? "bg-accent text-white"
                    : "text-charcoal hover:bg-cream/40"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? "text-white" : "text-muted"
                  }`}
                />
                <span className={collapsed ? "lg:hidden" : ""}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-cream shrink-0 space-y-1">
          <Link
            href="/"
            target="_blank"
            title={collapsed ? "Public Site" : undefined}
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-semibold tracking-wide text-charcoal hover:bg-cream/40 transition ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            <ExternalLink className="w-4 h-4 text-muted shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Public Site</span>
          </Link>
          <button
            type="button"
            title={collapsed ? "Sign Out" : undefined}
            onClick={async () => {
              try {
                await axios.post("/api/logout");
              } catch {}
              window.location.href = "/login";
            }}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-semibold tracking-wide text-accent hover:bg-cream/40 transition ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
