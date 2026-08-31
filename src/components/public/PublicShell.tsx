"use client";

import { usePathname } from "next/navigation";
import AnnouncementBar from "./AnnouncementBar";
import BottomNav from "./BottomNav";
import CartDrawer from "./CartDrawer";
import ChatWidget from "./ChatWidget";
import MobileMenu from "./MobileMenu";
import QuickViewModal from "./QuickViewModal";
import ScrollEffects from "./ScrollEffects";
import SearchOverlay from "./SearchOverlay";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import { useStore } from "./store";

/* Per-page body classes + color palette ported from the static pages
   (each HTML page shipped its own tailwind.config palette) */
function wrapperClass(pathname: string) {
  if (pathname === "/") {
    return "bg-ivory text-charcoal min-h-screen overflow-x-hidden selection:bg-accent selection:text-white pb-[68px] lg:pb-0";
  }
  if (["/login", "/register", "/dashboard"].includes(pathname)) {
    return "palette-account bg-ivory text-charcoal flex flex-col min-h-screen";
  }
  const base =
    "palette-shop bg-ivory text-charcoal min-h-screen selection:bg-accent selection:text-white pb-16 lg:pb-0";
  if (["/cart", "/checkout"].includes(pathname)) {
    return `${base} flex flex-col`;
  }
  return base;
}

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const variant = pathname === "/" ? "hero" : "solid";

  const { settings } = useStore();

  return (
    <div className={wrapperClass(pathname)}>
      {settings?.show_announcement && <AnnouncementBar />}
      <SiteHeader variant={variant} />
      {children}
      <SiteFooter />
      <CartDrawer />
      <SearchOverlay />
      <MobileMenu />
      <QuickViewModal />
      <ChatWidget />
      <BottomNav />
      <ScrollEffects />
    </div>
  );
}
