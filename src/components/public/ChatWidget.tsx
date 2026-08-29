"use client";

import Link from "next/link";
import {
  ChevronRight,
  MessageCircle,
  Package,
  Search,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "./store";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  useStore(); // keeps the widget inside the provider tree

  return (
    <>
      <button
        id="chat-fab"
        className="fixed bottom-[92px] right-5 lg:bottom-6 z-40 w-14 h-14 rounded-full bg-charcoal text-ivory flex items-center justify-center shadow-xl hover:scale-105 transition"
        aria-label="Open help chat"
        onClick={() => setOpen((o) => !o)}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <div
        id="chat-panel"
        className={`fixed inset-x-4 bottom-[160px] lg:inset-x-auto lg:bottom-24 lg:right-8 lg:w-[380px] max-h-[65vh] lg:max-h-[600px] bg-charcoal text-ivory rounded-3xl shadow-2xl z-50 transition-all duration-300 flex flex-col overflow-hidden border border-ivory/10 ${
          open
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="p-6 pb-4 shrink-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-sans font-extrabold text-xl tracking-tight uppercase">
              How Can We Help?
            </h3>
            <button
              id="close-chat"
              className="w-8 h-8 rounded-full bg-ivory/10 hover:bg-ivory/20 flex items-center justify-center transition shrink-0"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-accent font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Quick Help
          </p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-2.5">
          <button className="chat-quick-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-ivory/5 hover:bg-ivory/10 transition text-left">
            <Search className="w-4 h-4 text-accent shrink-0" />
            <span className="flex-1 text-[11px] tracking-wide uppercase font-bold">
              Recommend a Product for Me
            </span>
            <ChevronRight className="w-4 h-4 text-ivory/40 shrink-0" />
          </button>
          <button className="chat-quick-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-ivory/5 hover:bg-ivory/10 transition text-left">
            <UserRound className="w-4 h-4 text-accent shrink-0" />
            <span className="flex-1 text-[11px] tracking-wide uppercase font-bold">
              Meet Our Founder
            </span>
            <ChevronRight className="w-4 h-4 text-ivory/40 shrink-0" />
          </button>
          <button className="chat-quick-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-ivory/5 hover:bg-ivory/10 transition text-left">
            <Sparkles className="w-4 h-4 text-accent shrink-0" />
            <span className="flex-1 text-[11px] tracking-wide uppercase font-bold">
              Talk to Our Mango Expert
            </span>
            <ChevronRight className="w-4 h-4 text-ivory/40 shrink-0" />
          </button>
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-ivory/5 hover:bg-ivory/10 transition text-left"
            onClick={() => setOpen(false)}
          >
            <span className="w-9 h-9 rounded-xl bg-ivory/10 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-ivory/70" />
            </span>
            <span className="flex-1">
              <span className="block text-[11px] tracking-wide uppercase font-bold">
                Track and Manage My Orders
              </span>
              <span className="block text-[9px] text-ivory/40 uppercase tracking-wide">
                Order Process
              </span>
            </span>
            <ChevronRight className="w-4 h-4 text-ivory/40 shrink-0" />
          </Link>

          <Link
            href="/contact"
            className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-accent text-white mt-4"
            onClick={() => setOpen(false)}
          >
            <span className="flex -space-x-2 shrink-0">
              <span className="w-8 h-8 rounded-full border-2 border-ivory overflow-hidden">
                <img
                  src="/images/bangkok-mango-beetroot-1.png"
                  className="w-full h-full object-cover"
                  alt=""
                />
              </span>
              <span className="w-8 h-8 rounded-full border-2 border-ivory overflow-hidden">
                <img
                  src="/images/bangkok-mango-beetroot-2.png"
                  className="w-full h-full object-cover"
                  alt=""
                />
              </span>
            </span>
            <span className="flex-1">
              <span className="block text-[11px] tracking-wide uppercase font-extrabold">
                Thai Mango Support
              </span>
              <span className="block text-[9px] uppercase tracking-wide font-semibold opacity-80">
                Personal Assistance
              </span>
            </span>
            <Send className="w-4 h-4 shrink-0" />
          </Link>
        </div>

        <div className="border-t border-ivory/10 px-5 py-4 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[10px] text-ivory/50 leading-snug">
            By using this chat, you agree to our{" "}
            <Link
              href="/privacy-policy"
              className="underline hover:text-accent"
              onClick={() => setOpen(false)}
            >
              Privacy Policy
            </Link>
            .
          </p>
          <button
            id="dismiss-chat-note"
            className="text-ivory/40 hover:text-ivory shrink-0"
            aria-label="Dismiss"
            onClick={() => setOpen(false)}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
