"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Award,
  Droplet,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  PackageCheck,
  Plus,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useStore } from "@/components/public/store";
import { defaultDemoUser } from "@/lib/site-data";

type TabKey =
  | "overview"
  | "orders"
  | "wishlist"
  | "addresses"
  | "skin-profile"
  | "settings";

interface AdditionalAddress {
  id: number;
  text: string;
}

export default function DashboardPage() {
  const { user, wishlist, toggleWishlist, addToCart, logout, showToast, mounted } =
    useStore();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [additionalAddresses, setAdditionalAddresses] = useState<
    AdditionalAddress[]
  >([]);

  const activeUser = mounted ? user || defaultDemoUser : defaultDemoUser;

  const tabBtnClass = (tab: TabKey) =>
    `dash-tab-btn w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition text-left ${
      activeTab === tab
        ? "active bg-charcoal text-white"
        : "text-charcoal hover:bg-cream/40"
    }`;

  const tabIconClass = (tab: TabKey) =>
    `w-4 h-4 ${activeTab === tab ? "text-white" : "text-muted"}`;

  const panelClass = (tab: TabKey, spacing: string) =>
    `dash-tab-content ${spacing} ${activeTab === tab ? "active" : "hidden"}`;

  const handleClearWishlist = () => {
    wishlist.forEach((name) => toggleWishlist(name));
    showToast("Wishlist cleared");
  };

  const handleAddAddress = () => {
    const newAddr =
      typeof window !== "undefined"
        ? window.prompt("Enter full shipping address:")
        : null;
    if (newAddr) {
      setAdditionalAddresses((prev) => [
        ...prev,
        { id: Date.now(), text: newAddr },
      ]);
      showToast("New shipping address saved");
    }
  };

  const handleSettingsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    showToast("Thank you! Your request has been received.");
  };

  return (
    <main className="flex-1 py-10 md:py-16 px-4 sm:px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
      {/* Welcome Header Banner */}
      <div className="p-8 md:p-10 rounded-[32px] bg-gradient-to-r from-[#52091E] via-[#640C26] to-[#3D0514] text-white shadow-xl mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-gold/20 text-gold border border-gold/40 text-[10px] uppercase tracking-widest font-bold">
              Gold Member
            </span>
            <span className="text-xs text-white/60">• Member since 2026</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-white mb-2">
            Welcome back, <span id="dash-greeting-name">{activeUser.firstName || "Aarav"}</span>
          </h1>
          <p className="text-xs md:text-sm text-white/75 max-w-xl">
            Your personal hub for favorite mango flavors, order management,
            reward points, and personalized snack recommendations.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gold font-bold block">
              Thai Mango Points
            </span>
            <span className="font-serif text-3xl font-bold text-white">
              480 <span className="text-xs font-sans text-white/70 font-normal">pts</span>
            </span>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <Link
            href="/shop"
            className="px-4 py-2 bg-gold text-charcoal text-xs uppercase tracking-wider font-bold rounded-full hover:bg-white transition shadow-sm"
          >
            Redeem (15% Off)
          </Link>
        </div>
      </div>

      {/* Dashboard Layout Grid (Sidebar + Tab Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Navigation Sidebar (3 cols) */}
        <aside className="lg:col-span-3 bg-white rounded-[28px] border border-cream shadow-sm p-4 sticky top-28">
          <div className="flex items-center gap-3.5 p-3.5 border-b border-cream/70 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#52091E] text-gold flex items-center justify-center font-serif text-xl font-bold shadow-sm user-avatar-initial">
              {(activeUser.firstName || "A")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-charcoal truncate user-name-display">
                {activeUser.name}
              </h3>
              <span className="text-[11px] text-muted truncate block user-email-display">
                {activeUser.email}
              </span>
            </div>
          </div>

          {/* Tab Buttons */}
          <nav className="space-y-1.5" id="dashboard-nav-tabs">
            <button
              className={tabBtnClass("overview")}
              data-tab="overview"
              onClick={() => setActiveTab("overview")}
            >
              <LayoutDashboard className={tabIconClass("overview")} />
              <span>Overview</span>
            </button>
            <button
              className={tabBtnClass("orders")}
              data-tab="orders"
              onClick={() => setActiveTab("orders")}
            >
              <Package className={tabIconClass("orders")} />
              <span>My Orders</span>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-cream text-[10px] font-bold text-charcoal orders-count-badge">
                2
              </span>
            </button>
            <button
              className={tabBtnClass("wishlist")}
              data-tab="wishlist"
              onClick={() => setActiveTab("wishlist")}
            >
              <Heart className={tabIconClass("wishlist")} />
              <span>Saved Wishlist</span>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-cream text-[10px] font-bold text-charcoal wishlist-count-badge">
                {wishlist.length}
              </span>
            </button>
            <button
              className={tabBtnClass("addresses")}
              data-tab="addresses"
              onClick={() => setActiveTab("addresses")}
            >
              <MapPin className={tabIconClass("addresses")} />
              <span>Address Book</span>
            </button>
            <button
              className={tabBtnClass("skin-profile")}
              data-tab="skin-profile"
              onClick={() => setActiveTab("skin-profile")}
            >
              <Sparkles className={tabIconClass("skin-profile")} />
              <span>Flavor Profile &amp; Favorites</span>
            </button>
            <button
              className={tabBtnClass("settings")}
              data-tab="settings"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className={tabIconClass("settings")} />
              <span>Account Settings</span>
            </button>
            <div className="pt-3 mt-3 border-t border-cream">
              <button
                id="logout-btn"
                onClick={() => logout()}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Right Tab Content (9 cols) */}
        <div className="lg:col-span-9 bg-white rounded-[32px] border border-cream shadow-sm p-6 sm:p-8 md:p-10 min-h-[550px]">
          {/* 1. OVERVIEW TAB */}
          <div id="tab-content-overview" className={panelClass("overview", "space-y-8")}>
            <div>
              <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-1">
                Account Snapshot
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-charcoal">
                Account Overview
              </h2>
            </div>

            {/* 4 Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-ivory border border-cream">
                <PackageCheck className="w-5 h-5 text-accent mb-2" />
                <span className="text-[11px] uppercase tracking-wider text-muted font-semibold block">
                  Active Orders
                </span>
                <span className="font-serif text-2xl font-bold text-charcoal mt-1 block">
                  1 Active
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-ivory border border-cream">
                <Heart className="w-5 h-5 text-rose-500 mb-2" />
                <span className="text-[11px] uppercase tracking-wider text-muted font-semibold block">
                  Wishlist Items
                </span>
                <span
                  className="font-serif text-2xl font-bold text-charcoal mt-1 block"
                  id="overview-wishlist-count"
                >
                  {wishlist.length} Items
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-ivory border border-cream">
                <Award className="w-5 h-5 text-gold mb-2" />
                <span className="text-[11px] uppercase tracking-wider text-muted font-semibold block">
                  Tier Level
                </span>
                <span className="font-serif text-2xl font-bold text-charcoal mt-1 block">
                  Gold
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-ivory border border-cream">
                <Droplet className="w-5 h-5 text-blue-500 mb-2" />
                <span className="text-[11px] uppercase tracking-wider text-muted font-semibold block">
                  Flavor Preference
                </span>
                <span
                  className="font-serif text-2xl font-bold text-charcoal mt-1 block"
                  id="overview-skin-type"
                >
                  {activeUser.skinType || "Sweet & Classic"}
                </span>
              </div>
            </div>

            {/* Active Order Live Tracker Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-cream/50 border border-cream">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold tracking-wider">
                    Out for Delivery
                  </span>
                  <h3 className="font-serif text-xl font-bold text-charcoal mt-2">
                    Order #TMG-89421
                  </h3>
                  <span className="text-xs text-muted">
                    Estimated Delivery: Tomorrow by 4:00 PM
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="px-4 py-2 bg-charcoal text-white text-xs uppercase tracking-wider font-bold rounded-full hover:bg-accent transition shadow-sm"
                >
                  Track Order Details
                </button>
              </div>

              {/* Visual Progress Steps */}
              <div className="grid grid-cols-4 gap-2 text-center pt-2">
                <div className="flex flex-col items-center">
                  <span className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs mb-1 font-bold">
                    ✓
                  </span>
                  <span className="text-[10px] font-semibold text-charcoal">
                    Confirmed
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs mb-1 font-bold">
                    ✓
                  </span>
                  <span className="text-[10px] font-semibold text-charcoal">
                    Packed
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs mb-1 font-bold animate-pulse">
                    🚚
                  </span>
                  <span className="text-[10px] font-bold text-accent">
                    In Transit
                  </span>
                </div>
                <div className="flex flex-col items-center opacity-40">
                  <span className="w-7 h-7 rounded-full bg-cream border border-charcoal/30 flex items-center justify-center text-xs mb-1 font-bold">
                    4
                  </span>
                  <span className="text-[10px] font-semibold text-muted">
                    Delivered
                  </span>
                </div>
              </div>
            </div>

            {/* Curated Flavor Recommendation */}
            <div>
              <h3 className="font-serif text-xl text-charcoal mb-4">
                Recommended For Your Flavor Preference
              </h3>
              <div className="p-6 rounded-3xl bg-ivory border border-cream flex flex-col sm:flex-row items-center gap-6">
                <img
                  src="/images/bangkok-mango-beetroot-1.png"
                  alt="Recommended Mango Snack"
                  className="w-24 h-24 object-cover rounded-2xl bg-white shadow-sm shrink-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] uppercase tracking-widest text-accent font-bold">
                    Chef&apos;s Pick: Today&apos;s Favorite
                  </span>
                  <h4 className="font-serif text-xl text-charcoal font-semibold mt-0.5">
                    Thai Mango Honey Glazed Slices
                  </h4>
                  <p className="text-xs text-muted mt-1 max-w-md">
                    Slow sun-dried in small batches, then lightly glazed with
                    wild Thai honey for natural sweetness.
                  </p>
                </div>
                <button
                  onClick={() =>
                    addToCart({
                      name: "Thai Mango Honey Glazed Slices",
                      price: 450,
                      image: "/images/bangkok-mango-beetroot-1.png",
                    })
                  }
                  className="add-to-cart px-6 py-3 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition shrink-0"
                >
                  Add to Bag • ₹450
                </button>
              </div>
            </div>
          </div>

          {/* 2. MY ORDERS TAB */}
          <div id="tab-content-orders" className={panelClass("orders", "space-y-6")}>
            <div>
              <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-1">
                Purchase History
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-charcoal">
                All Orders
              </h2>
            </div>

            <div id="orders-list-container" className="space-y-4">
              {/* Order 1 */}
              <div className="p-6 rounded-3xl bg-ivory border border-cream shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-cream gap-3">
                  <div>
                    <span className="font-serif text-xl font-bold text-charcoal">
                      #TMG-89421
                    </span>
                    <span className="text-xs text-muted ml-3">
                      Placed on Feb 22, 2026
                    </span>
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    Out For Delivery
                  </span>
                </div>
                <div className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src="/images/bangkok-mango-beetroot-1.png"
                      className="w-16 h-16 rounded-xl object-cover bg-white"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-charcoal">
                        Thai Mango Classic Sun-Dried Strips
                      </h4>
                      <span className="text-[11px] text-muted">
                        150g Pouch • Qty: 1
                      </span>
                      <span className="text-xs font-semibold text-accent block mt-1">
                        ₹390 (Paid via UPI)
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        addToCart({
                          name: "Thai Mango Classic Sun-Dried Strips",
                          price: 390,
                          image: "/images/bangkok-mango-beetroot-1.png",
                        })
                      }
                      className="add-to-cart px-4 py-2 bg-charcoal text-white text-xs uppercase tracking-wider font-bold rounded-full hover:bg-accent transition"
                    >
                      Reorder
                    </button>
                    <button
                      onClick={() => showToast("Invoice downloaded successfully")}
                      className="px-4 py-2 border border-cream hover:border-charcoal text-xs uppercase tracking-wider font-bold rounded-full transition"
                    >
                      Receipt
                    </button>
                  </div>
                </div>
              </div>

              {/* Order 2 */}
              <div className="p-6 rounded-3xl bg-ivory border border-cream shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-cream gap-3">
                  <div>
                    <span className="font-serif text-xl font-bold text-charcoal">
                      #TMG-76120
                    </span>
                    <span className="text-xs text-muted ml-3">
                      Placed on Jan 15, 2026
                    </span>
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-charcoal/10 text-charcoal text-[10px] font-bold uppercase tracking-wider">
                    Delivered
                  </span>
                </div>
                <div className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src="/images/bangkok-mango-beetroot-2.png"
                      className="w-16 h-16 rounded-xl object-cover bg-white"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-charcoal">
                        Thai Mango Discovery Gift Box
                      </h4>
                      <span className="text-[11px] text-muted">
                        Gift Set • Qty: 1
                      </span>
                      <span className="text-xs font-semibold text-accent block mt-1">
                        ₹1,450 (Paid via Card)
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        addToCart({
                          name: "Thai Mango Discovery Gift Box",
                          price: 1450,
                          image: "/images/bangkok-mango-beetroot-2.png",
                        })
                      }
                      className="add-to-cart px-4 py-2 bg-charcoal text-white text-xs uppercase tracking-wider font-bold rounded-full hover:bg-accent transition"
                    >
                      Reorder
                    </button>
                    <button
                      onClick={() => showToast("Invoice downloaded successfully")}
                      className="px-4 py-2 border border-cream hover:border-charcoal text-xs uppercase tracking-wider font-bold rounded-full transition"
                    >
                      Receipt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. SAVED WISHLIST TAB */}
          <div id="tab-content-wishlist" className={panelClass("wishlist", "space-y-6")}>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-1">
                  Your Favorite Flavors
                </span>
                <h2 className="font-serif text-2xl md:text-3xl text-charcoal">
                  Saved Wishlist
                </h2>
              </div>
              <button
                id="clear-wishlist-btn"
                onClick={handleClearWishlist}
                className="text-xs text-muted hover:text-rose-600 underline"
              >
                Clear All
              </button>
            </div>

            <div
              id="wishlist-grid-container"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              {wishlist.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-cream/30 rounded-3xl border border-cream">
                  <Heart className="w-10 h-10 text-muted mx-auto mb-3 stroke-[1.5]" />
                  <h4 className="font-serif text-xl text-charcoal mb-2">
                    Your wishlist is currently empty
                  </h4>
                  <p className="text-xs text-muted mb-6">
                    Explore our sun-dried mango flavors to save your
                    favorites.
                  </p>
                  <Link
                    href="/shop"
                    className="px-6 py-3 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition shadow-sm"
                  >
                    Discover Shop
                  </Link>
                </div>
              ) : (
                wishlist.map((name) => (
                  <div
                    key={name}
                    className="p-4 rounded-3xl bg-ivory border border-cream flex flex-col justify-between group"
                  >
                    <div className="relative rounded-2xl overflow-hidden aspect-square bg-white mb-4">
                      <img
                        src="/images/bangkok-mango-beetroot-1.png"
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <button
                        onClick={() => toggleWishlist(name)}
                        className="remove-wishlist-btn absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition shadow-sm"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-accent font-bold">
                        Thai Mango
                      </span>
                      <h4 className="font-serif text-base text-charcoal font-semibold mt-1 mb-3 line-clamp-1">
                        {name}
                      </h4>
                      <button
                        onClick={() =>
                          addToCart({
                            name,
                            price: 410,
                            image: "/images/bangkok-mango-beetroot-1.png",
                          })
                        }
                        className="add-to-cart w-full py-2.5 bg-charcoal text-white rounded-full text-xs uppercase tracking-wider font-bold hover:bg-accent transition"
                      >
                        Move to Bag • ₹410
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 4. ADDRESS BOOK TAB */}
          <div id="tab-content-addresses" className={panelClass("addresses", "space-y-6")}>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-1">
                  Delivery Locations
                </span>
                <h2 className="font-serif text-2xl md:text-3xl text-charcoal">
                  Address Book
                </h2>
              </div>
              <button
                id="add-address-btn"
                onClick={handleAddAddress}
                className="px-5 py-2.5 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            </div>

            <div id="addresses-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Default Address */}
              <div className="p-6 rounded-3xl bg-ivory border-2 border-accent shadow-sm relative">
                <span className="absolute top-5 right-5 px-3 py-0.5 rounded-full bg-accent text-white text-[9px] uppercase font-bold tracking-widest">
                  Default
                </span>
                <h4 className="text-sm font-bold text-charcoal mb-1">
                  Aarav Sharma (Home)
                </h4>
                <p className="text-xs text-muted leading-relaxed mb-4">
                  Flat 402, Royal Palms, Palm Beach Road
                  <br />
                  Bandra West, Mumbai, Maharashtra - 400050
                  <br />
                  Phone: +91 98765 43210
                </p>
                <div className="flex gap-3 text-xs font-semibold pt-2 border-t border-cream">
                  <button
                    onClick={() => showToast("Edit mode opened")}
                    className="text-accent hover:underline"
                  >
                    Edit
                  </button>
                  <span className="text-muted/40">•</span>
                  <button
                    onClick={() => showToast("Cannot delete default address")}
                    className="text-muted hover:text-rose-600"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Work Address */}
              <div className="p-6 rounded-3xl bg-white border border-cream shadow-sm">
                <h4 className="text-sm font-bold text-charcoal mb-1">
                  Aarav Sharma (Studio)
                </h4>
                <p className="text-xs text-muted leading-relaxed mb-4">
                  Level 8, One International Centre
                  <br />
                  Senapati Bapat Marg, Lower Parel, Mumbai - 400013
                  <br />
                  Phone: +91 98765 43210
                </p>
                <div className="flex gap-3 text-xs font-semibold pt-2 border-t border-cream">
                  <button
                    onClick={() => showToast("Set as default address")}
                    className="text-accent hover:underline"
                  >
                    Set As Default
                  </button>
                  <span className="text-muted/40">•</span>
                  <button
                    onClick={() => showToast("Address removed")}
                    className="text-muted hover:text-rose-600"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {additionalAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-6 rounded-3xl bg-white border border-cream shadow-sm"
                >
                  <h4 className="text-sm font-bold text-charcoal mb-1">
                    New Delivery Location
                  </h4>
                  <p className="text-xs text-muted leading-relaxed mb-4">
                    {addr.text}
                  </p>
                  <div className="flex gap-3 text-xs font-semibold pt-2 border-t border-cream">
                    <button
                      onClick={() => showToast("Set as default")}
                      className="text-accent hover:underline"
                    >
                      Set As Default
                    </button>
                    <span className="text-muted/40">•</span>
                    <button
                      onClick={() => {
                        setAdditionalAddresses((prev) =>
                          prev.filter((a) => a.id !== addr.id)
                        );
                        showToast("Address deleted");
                      }}
                      className="text-muted hover:text-rose-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. SKIN PROFILE & RITUALS TAB */}
          <div
            id="tab-content-skin-profile"
            className={panelClass("skin-profile", "space-y-6")}
          >
            <div>
              <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-1">
                Flavor Intelligence
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-charcoal">
                Your Flavor Profile
              </h2>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-cream/40 border border-cream grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted font-bold block mb-1">
                  Flavor Preference
                </span>
                <span className="font-serif text-2xl font-bold text-accent" id="skin-type-badge">
                  {activeUser.skinType || "Sweet & Classic"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted font-bold block mb-1">
                  Favorite Style
                </span>
                <span className="font-serif text-2xl font-bold text-charcoal">
                  Sweet &amp; Glazed Snacking
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted font-bold block mb-1">
                  Recommended Picks
                </span>
                <span className="text-xs font-bold text-charcoal block mt-1">
                  Classic Sun-Dried Strips, Honey Glazed Slices, Beetroot
                  Fusion Chews
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Morning Snack Ideas */}
              <div className="p-6 rounded-3xl bg-white border border-cream shadow-sm">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
                  ☀️ Morning Snack Ideas (3 Ways)
                </span>
                <h4 className="font-serif text-xl font-bold text-charcoal mb-4">
                  Rise &amp; Snack
                </h4>
                <ol className="space-y-3 text-xs text-muted list-decimal list-inside">
                  <li>
                    <strong className="text-charcoal">Straight Up:</strong>{" "}
                    Enjoy a handful of Classic Sun-Dried Strips with your
                    morning tea.
                  </li>
                  <li>
                    <strong className="text-charcoal">Pair It:</strong> Toss
                    Honey Glazed Slices into your breakfast yogurt bowl.
                  </li>
                  <li>
                    <strong className="text-charcoal">On The Go:</strong> Pack
                    a resealable pouch for your morning commute.
                  </li>
                </ol>
              </div>

              {/* Evening Snack Ideas */}
              <div className="p-6 rounded-3xl bg-white border border-cream shadow-sm">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest block mb-1">
                  🌙 Evening Snack Ideas (3 Ways)
                </span>
                <h4 className="font-serif text-xl font-bold text-charcoal mb-4">
                  Wind Down &amp; Snack
                </h4>
                <ol className="space-y-3 text-xs text-muted list-decimal list-inside">
                  <li>
                    <strong className="text-charcoal">Movie Night:</strong>{" "}
                    Share a bowl of Chili Lime Bites while streaming.
                  </li>
                  <li>
                    <strong className="text-charcoal">Sweet Tooth:</strong>{" "}
                    Nibble Beetroot Fusion Chews for a naturally sweet treat.
                  </li>
                  <li>
                    <strong className="text-charcoal">Relax:</strong> Pair
                    with herbal tea for a calm evening treat.
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* 6. ACCOUNT SETTINGS TAB */}
          <div id="tab-content-settings" className={panelClass("settings", "space-y-6")}>
            <div>
              <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-1">
                Personal Details
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-charcoal">
                Account Settings
              </h2>
            </div>

            <form
              id="settings-profile-form"
              className="space-y-5 max-w-xl"
              onSubmit={handleSettingsSubmit}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="settings-firstname"
                    defaultValue="Aarav"
                    className="w-full px-4 py-3 rounded-xl border border-cream bg-white text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="settings-lastname"
                    defaultValue="Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-cream bg-white text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="settings-email"
                  defaultValue="aarav@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-white text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="settings-phone"
                  defaultValue="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-white text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div className="pt-4 border-t border-cream">
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition shadow-sm"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
