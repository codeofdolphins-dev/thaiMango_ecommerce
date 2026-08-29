"use client";

import { useEffect } from "react";

/**
 * Port of the .reveal / .img-reveal IntersectionObserver from app.js.
 * A MutationObserver picks up elements added by client-side navigation,
 * so pages don't need any per-page wiring — they just use the classes.
 */
export default function ScrollEffects() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const observeAll = (root: ParentNode) => {
      root
        .querySelectorAll?.(".reveal:not(.active), .img-reveal:not(.active)")
        .forEach((el) => io.observe(el));
    };

    observeAll(document);

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const el = node as Element;
          if (el.matches?.(".reveal, .img-reveal")) io.observe(el);
          observeAll(el);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
