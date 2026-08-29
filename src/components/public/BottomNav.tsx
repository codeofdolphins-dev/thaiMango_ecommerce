"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, ShoppingBag } from "lucide-react";
import { useStore } from "./store";

export default function BottomNav() {
  const { openCart, openMenu, totalItems, mounted } = useStore();
  const pathname = usePathname();

  const itemCls = (active: boolean) =>
    `flex-1 flex flex-col items-center justify-center gap-1 py-2.5 ${
      active ? "text-accent" : "text-ivory/70 hover:text-accent"
    } active:text-accent transition`;

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-charcoal text-ivory border-t border-ivory/10 flex items-stretch shadow-[0_-4px_20px_rgba(0,0,0,0.2)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Link href="/" className={itemCls(pathname === "/")} aria-label="Home">
        <Home className="w-5 h-5" />
        <span className="text-[9px] tracking-wide uppercase font-semibold">
          Home
        </span>
      </Link>
      <Link
        href="/shop"
        className={itemCls(pathname === "/shop")}
        aria-label="Shop"
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[9px] tracking-wide uppercase font-semibold">
          Shop
        </span>
      </Link>
      <a
        href="/cart"
        className={`${itemCls(false)} relative`}
        aria-label="Cart"
        onClick={(e) => {
          e.preventDefault();
          openCart();
        }}
      >
        <ShoppingBag className="w-5 h-5" />
        <span
          className={`cart-count absolute top-1 right-1/4 bg-accent text-ivory text-[9px] w-4 h-4 rounded-full flex items-center justify-center ${
            mounted && totalItems > 0 ? "" : "hidden"
          }`}
        >
          {mounted ? totalItems : 0}
        </span>
        <span className="text-[9px] tracking-wide uppercase font-semibold">
          Bag
        </span>
      </a>
      <button
        id="bottom-menu-btn"
        className={itemCls(false)}
        aria-label="Open menu"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          openMenu({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          });
        }}
      >
        <Menu className="w-5 h-5" />
        <span className="text-[9px] tracking-wide uppercase font-semibold">
          Menu
        </span>
      </button>
    </nav>
  );
}
