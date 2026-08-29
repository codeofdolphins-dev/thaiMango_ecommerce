"use client";

import { Bell, PanelLeft, Search } from "lucide-react";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F5F4F1]">
      <AdminSidebar
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="h-[72px] sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-stone-200/70 flex items-center gap-3 md:gap-4 px-4 md:px-6">
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-peach-soft hover:text-peach transition"
            aria-label="Toggle sidebar"
            onClick={() => {
              // On mobile, open the drawer; on desktop, collapse in place.
              if (window.matchMedia("(min-width: 1024px)").matches) {
                setCollapsed((c) => !c);
              } else {
                setMobileOpen(true);
              }
            }}
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          {/* Global search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Global search..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#F5F4F1] border border-stone-200/70 text-sm focus:outline-none focus:border-peach focus:bg-white transition placeholder:text-slate-400"
            />
          </div>

          <div className="ml-auto flex items-center gap-3 md:gap-5">
            <button
              className="relative w-10 h-10 rounded-full border border-stone-200/80 bg-white flex items-center justify-center text-slate-500 hover:text-peach hover:border-peach transition"
              aria-label="Notifications"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-peach ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right leading-tight hidden sm:block">
                <span className="block text-xs font-bold tracking-wide text-ink uppercase">
                  Admin
                </span>
                <span className="block text-[10px] tracking-[0.15em] uppercase text-peach font-semibold">
                  Verified Sanctuary Lead
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-peach-soft ring-1 ring-peach/40 flex items-center justify-center shrink-0">
                <img
                  src="/images/logo.png"
                  alt="Admin"
                  className="w-7 h-7 object-contain rounded-full"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
