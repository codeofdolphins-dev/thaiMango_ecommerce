"use client";

import Link from "next/link";
import { useStore } from "./store";

export default function AnnouncementBar() {
  const { t } = useStore();
  return (
    <div
      id="top-bar"
      className="bg-charcoal text-ivory text-xs tracking-[0.2em] py-2.5 overflow-hidden uppercase relative flex items-center z-50"
    >
      <div className="marquee-content whitespace-nowrap flex space-x-12 px-4">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="marquee-item-text">
            {t("marquee_welcome")}{" "}
            <Link
              href="/shop"
              className="underline ml-2 hover:text-accent transition"
            >
              {t("shop_now")}
            </Link>
          </span>
        ))}
      </div>
    </div>
  );
}
