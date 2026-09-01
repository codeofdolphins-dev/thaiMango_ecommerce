"use client";

import { Bell, PanelLeft, Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<{ name: string; email: string; role: string } | null> => {
      const res = await fetch("/api/me");
      if (!res.ok) return null;
      return (await res.json()).data;
    },
    staleTime: Infinity,
  });

  return (
    <div className="min-h-screen flex bg-ivory">
      <AdminSidebar
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="h-[72px] sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-cream flex items-center gap-3 md:gap-4 px-4 md:px-6">
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:bg-cream hover:text-accent transition"
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
            <Search className="w-4 h-4 text-muted/70 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Global search..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-ivory border border-cream text-sm focus:outline-none focus:border-accent focus:bg-white transition placeholder:text-muted/70"
            />
          </div>

          <div className="ml-auto flex items-center gap-3 md:gap-5">
            <button
              className="relative w-10 h-10 rounded-full border border-cream bg-white flex items-center justify-center text-muted hover:text-accent hover:border-accent transition"
              aria-label="Notifications"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-accent ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right leading-tight hidden sm:block">
                <span className="block text-[10px] tracking-[0.2em] uppercase text-accent font-bold">
                  {meQuery.data ? "Administrator" : ""}
                </span>
                <span className="block text-sm font-bold text-charcoal">
                  {meQuery.data?.name ?? "…"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-burgundy text-gold flex items-center justify-center shrink-0 font-serif text-lg font-bold shadow-sm">
                {(meQuery.data?.name?.[0] ?? "A").toUpperCase()}
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
