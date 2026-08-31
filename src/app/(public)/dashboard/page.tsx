"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
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

type TabKey =
  | "overview"
  | "orders"
  | "wishlist"
  | "addresses"
  | "skin-profile"
  | "settings";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface MyOrderItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  product: { slug: string; images: string[] } | null;
}

interface MyOrder {
  id: string;
  order_no: number;
  status: OrderStatus;
  payment: "PREPAID" | "COD";
  total: string;
  created_at: string;
  items: MyOrderItem[];
}

interface MyAddress {
  id: number;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface ShopProduct {
  name_en: string;
  description_en: string;
  images: string[];
  productVariant: { price: string } | null;
}

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Confirmed",
  PROCESSING: "Being Packed",
  SHIPPED: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const ORDER_STATUS_STEP: Record<OrderStatus, number> = {
  PENDING: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: 0,
};

const STATUS_PILL: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-emerald-100 text-emerald-800",
  DELIVERED: "bg-charcoal/10 text-charcoal",
  CANCELLED: "bg-rose-100 text-rose-800",
};

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-cream bg-white text-sm focus:outline-none focus:border-accent";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1";

async function throwOnError(res: Response) {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.errors?.[0] || body.message || "Something went wrong");
  }
  return body.data;
}

export default function DashboardPage() {
  const {
    user,
    setUser,
    wishlist,
    toggleWishlist,
    addToCart,
    logout,
    showToast,
    authLoading,
  } = useStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [addressDraft, setAddressDraft] = useState({
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [profileDraft, setProfileDraft] = useState({
    f_name: "",
    l_name: "",
    email: "",
    ph_no: "",
  });

  const loggedIn = Boolean(user);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setProfileDraft({
        f_name: user.firstName ?? "",
        l_name: user.lastName ?? "",
        email: user.email ?? "",
        ph_no: user.phone ?? "",
      });
    }
  }, [user]);

  const ordersQuery = useQuery({
    queryKey: ["my-orders"],
    enabled: loggedIn,
    queryFn: async (): Promise<MyOrder[]> => {
      const res = await fetch("/api/orders");
      return throwOnError(res);
    },
  });

  const addressesQuery = useQuery({
    queryKey: ["my-addresses"],
    enabled: loggedIn,
    queryFn: async (): Promise<MyAddress[]> => {
      const res = await fetch("/api/addresses");
      return throwOnError(res);
    },
  });

  const recommendedQuery = useQuery({
    queryKey: ["products", "recommended"],
    queryFn: async (): Promise<ShopProduct | null> => {
      const res = await fetch("/api/products?limit=1");
      const data = await throwOnError(res);
      return data.products[0] ?? null;
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (values: typeof addressDraft) => {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      return throwOnError(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
      setAddressFormOpen(false);
      setAddressDraft({ line1: "", city: "", state: "", pincode: "" });
      showToast("New shipping address saved");
    },
    onError: (error: Error) => showToast(error.message),
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/addresses/${id}`, { method: "PATCH" });
      return throwOnError(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
      showToast("Default address updated");
    },
    onError: (error: Error) => showToast(error.message),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      return throwOnError(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
      showToast("Address removed");
    },
    onError: (error: Error) => showToast(error.message),
  });

  const profileMutation = useMutation({
    mutationFn: async (values: typeof profileDraft) => {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      return throwOnError(res);
    },
    onSuccess: (data: { name: string; email: string; phone: string }) => {
      const [firstName, ...rest] = data.name.split(" ");
      setUser({
        ...(user ?? { isLoggedIn: true }),
        isLoggedIn: true,
        firstName,
        lastName: rest.join(" "),
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      showToast("Profile updated successfully");
    },
    onError: (error: Error) => showToast(error.message),
  });

  if (authLoading || !user) {
    return (
      <main className="flex-1 flex items-center justify-center py-32">
        <span className="text-xs uppercase tracking-widest text-muted">
          {authLoading ? "Loading your account..." : "Redirecting to sign in..."}
        </span>
      </main>
    );
  }

  const activeUser = user;
  const orders = ordersQuery.data ?? [];
  const addresses = addressesQuery.data ?? [];
  const activeOrders = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
  );
  const trackedOrder = activeOrders[0] ?? null;
  const recommended = recommendedQuery.data;

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

  return (
    <main className="flex-1 py-10 md:py-16 px-4 sm:px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
      {/* Welcome Header Banner */}
      <div className="p-8 md:p-10 rounded-[32px] bg-gradient-to-r from-[#52091E] via-[#640C26] to-[#3D0514] text-white shadow-xl mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-gold/20 text-gold border border-gold/40 text-[10px] uppercase tracking-widest font-bold">
              Thai Mango Circle
            </span>
            {activeUser.memberSince && (
              <span className="text-xs text-white/60">
                • Member since {activeUser.memberSince}
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-white mb-2">
            Welcome back,{" "}
            <span id="dash-greeting-name">{activeUser.firstName || "Member"}</span>
          </h1>
          <p className="text-xs md:text-sm text-white/75 max-w-xl">
            Your personal hub for favorite mango flavors, order management, and
            personalized snack recommendations.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gold font-bold block">
              Your Orders
            </span>
            <span className="font-serif text-3xl font-bold text-white">
              {ordersQuery.isPending ? "…" : orders.length}
              <span className="text-xs font-sans text-white/70 font-normal ml-1.5">
                total
              </span>
            </span>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <Link
            href="/shop"
            className="px-4 py-2 bg-gold text-charcoal text-xs uppercase tracking-wider font-bold rounded-full hover:bg-white transition shadow-sm"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Dashboard Layout Grid (Sidebar + Tab Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Navigation Sidebar (3 cols) */}
        <aside className="lg:col-span-3 bg-white rounded-[28px] border border-cream shadow-sm p-4 sticky top-28">
          <div className="flex items-center gap-3.5 p-3.5 border-b border-cream/70 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#52091E] text-gold flex items-center justify-center font-serif text-xl font-bold shadow-sm user-avatar-initial">
              {(activeUser.firstName || "M")[0].toUpperCase()}
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
              onClick={() => setActiveTab("overview")}
            >
              <LayoutDashboard className={tabIconClass("overview")} />
              <span>Overview</span>
            </button>
            <button
              className={tabBtnClass("orders")}
              onClick={() => setActiveTab("orders")}
            >
              <Package className={tabIconClass("orders")} />
              <span>My Orders</span>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-cream text-[10px] font-bold text-charcoal orders-count-badge">
                {ordersQuery.isPending ? "…" : orders.length}
              </span>
            </button>
            <button
              className={tabBtnClass("wishlist")}
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
              onClick={() => setActiveTab("addresses")}
            >
              <MapPin className={tabIconClass("addresses")} />
              <span>Address Book</span>
            </button>
            <button
              className={tabBtnClass("skin-profile")}
              onClick={() => setActiveTab("skin-profile")}
            >
              <Sparkles className={tabIconClass("skin-profile")} />
              <span>Flavor Profile</span>
            </button>
            <button
              className={tabBtnClass("settings")}
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
          <div className={panelClass("overview", "space-y-8")}>
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
                  {ordersQuery.isPending ? "…" : activeOrders.length}
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-ivory border border-cream">
                <Heart className="w-5 h-5 text-rose-500 mb-2" />
                <span className="text-[11px] uppercase tracking-wider text-muted font-semibold block">
                  Wishlist Items
                </span>
                <span className="font-serif text-2xl font-bold text-charcoal mt-1 block">
                  {wishlist.length} Item{wishlist.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-ivory border border-cream">
                <Package className="w-5 h-5 text-gold mb-2" />
                <span className="text-[11px] uppercase tracking-wider text-muted font-semibold block">
                  Total Orders
                </span>
                <span className="font-serif text-2xl font-bold text-charcoal mt-1 block">
                  {ordersQuery.isPending ? "…" : orders.length}
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-ivory border border-cream">
                <Droplet className="w-5 h-5 text-blue-500 mb-2" />
                <span className="text-[11px] uppercase tracking-wider text-muted font-semibold block">
                  Flavor Preference
                </span>
                <span className="font-serif text-2xl font-bold text-charcoal mt-1 block">
                  {activeUser.skinType || "Not set"}
                </span>
              </div>
            </div>

            {/* Active Order Live Tracker Card (only when a real active order exists) */}
            {trackedOrder && (
              <div className="p-6 md:p-8 rounded-3xl bg-cream/50 border border-cream">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${STATUS_PILL[trackedOrder.status]}`}
                    >
                      {ORDER_STATUS_LABEL[trackedOrder.status]}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-charcoal mt-2">
                      Order #TM-{String(trackedOrder.order_no).padStart(5, "0")}
                    </h3>
                    <span className="text-xs text-muted">
                      Placed on{" "}
                      {new Date(trackedOrder.created_at).toLocaleDateString("en-IN")}
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
                  {["Confirmed", "Packed", "In Transit", "Delivered"].map(
                    (step, i) => {
                      const stepNo = i + 1;
                      const current = ORDER_STATUS_STEP[trackedOrder.status];
                      const done = stepNo < current;
                      const active = stepNo === current;
                      return (
                        <div
                          key={step}
                          className={`flex flex-col items-center ${
                            !done && !active ? "opacity-40" : ""
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs mb-1 font-bold ${
                              done || active
                                ? "bg-accent text-white"
                                : "bg-cream border border-charcoal/30"
                            } ${active ? "animate-pulse" : ""}`}
                          >
                            {done ? "✓" : stepNo}
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${
                              active ? "text-accent font-bold" : "text-charcoal"
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Curated Flavor Recommendation (first live product from the catalog) */}
            {recommended && recommended.productVariant && (
              <div>
                <h3 className="font-serif text-xl text-charcoal mb-4">
                  From The Catalog
                </h3>
                <div className="p-6 rounded-3xl bg-ivory border border-cream flex flex-col sm:flex-row items-center gap-6">
                  <img
                    src={recommended.images[0] ?? "/images/logo.png"}
                    alt={recommended.name_en}
                    className="w-24 h-24 object-cover rounded-2xl bg-white shadow-sm shrink-0"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-[10px] uppercase tracking-widest text-accent font-bold">
                      Fresh From The Orchard
                    </span>
                    <h4 className="font-serif text-xl text-charcoal font-semibold mt-0.5">
                      {recommended.name_en}
                    </h4>
                    <p className="text-xs text-muted mt-1 max-w-md line-clamp-2">
                      {recommended.description_en}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      addToCart({
                        name: recommended.name_en,
                        price: Number(recommended.productVariant?.price ?? 0),
                        image: recommended.images[0] ?? "/images/logo.png",
                      })
                    }
                    className="add-to-cart px-6 py-3 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition shrink-0"
                  >
                    Add to Bag • ₹{Number(recommended.productVariant.price)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. MY ORDERS TAB */}
          <div className={panelClass("orders", "space-y-6")}>
            <div>
              <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-1">
                Purchase History
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-charcoal">
                All Orders
              </h2>
            </div>

            <div className="space-y-4">
              {ordersQuery.isPending ? (
                <p className="py-12 text-center text-muted text-sm">
                  Loading your orders…
                </p>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center bg-cream/30 rounded-3xl border border-cream">
                  <Package className="w-10 h-10 text-muted mx-auto mb-3 stroke-[1.5]" />
                  <h4 className="font-serif text-xl text-charcoal mb-2">
                    You haven&apos;t placed any orders yet
                  </h4>
                  <p className="text-xs text-muted mb-6">
                    Explore our sun-dried mango flavors and place your first order.
                  </p>
                  <Link
                    href="/shop"
                    className="px-6 py-3 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition shadow-sm"
                  >
                    Discover Shop
                  </Link>
                </div>
              ) : (
                orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-6 rounded-3xl bg-ivory border border-cream shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-cream gap-3">
                      <div>
                        <span className="font-serif text-xl font-bold text-charcoal">
                          #TM-{String(o.order_no).padStart(5, "0")}
                        </span>
                        <span className="text-xs text-muted ml-3">
                          Placed on{" "}
                          {new Date(o.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <span
                        className={`px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_PILL[o.status]}`}
                      >
                        {ORDER_STATUS_LABEL[o.status]}
                      </span>
                    </div>
                    {o.items.map((item) => (
                      <div
                        key={item.id}
                        className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={item.product?.images[0] ?? "/images/logo.png"}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover bg-white"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-charcoal">
                              {item.name}
                            </h4>
                            <span className="text-[11px] text-muted">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-xs font-semibold text-accent block mt-1">
                              ₹{Number(item.price)} ({o.payment === "COD" ? "COD" : "Prepaid"})
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            addToCart({
                              name: item.name,
                              price: Number(item.price),
                              image: item.product?.images[0] ?? "/images/logo.png",
                            })
                          }
                          className="add-to-cart px-4 py-2 bg-charcoal text-white text-xs uppercase tracking-wider font-bold rounded-full hover:bg-accent transition"
                        >
                          Reorder
                        </button>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-cream text-right text-sm font-bold text-charcoal">
                      Total: ₹{Number(o.total)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. SAVED WISHLIST TAB */}
          <div className={panelClass("wishlist", "space-y-6")}>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-1">
                  Your Favorite Flavors
                </span>
                <h2 className="font-serif text-2xl md:text-3xl text-charcoal">
                  Saved Wishlist
                </h2>
              </div>
              {wishlist.length > 0 && (
                <button
                  onClick={handleClearWishlist}
                  className="text-xs text-muted hover:text-rose-600 underline"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {wishlist.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-cream/30 rounded-3xl border border-cream">
                  <Heart className="w-10 h-10 text-muted mx-auto mb-3 stroke-[1.5]" />
                  <h4 className="font-serif text-xl text-charcoal mb-2">
                    Your wishlist is currently empty
                  </h4>
                  <p className="text-xs text-muted mb-6">
                    Explore our sun-dried mango flavors to save your favorites.
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
                    <div className="relative rounded-2xl overflow-hidden aspect-square bg-white mb-4 flex items-center justify-center">
                      <Heart className="w-10 h-10 text-rose-300 fill-rose-200" />
                      <button
                        onClick={() => toggleWishlist(name)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition shadow-sm"
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
                      <Link
                        href="/shop"
                        className="block text-center w-full py-2.5 bg-charcoal text-white rounded-full text-xs uppercase tracking-wider font-bold hover:bg-accent transition"
                      >
                        View in Shop
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 4. ADDRESS BOOK TAB */}
          <div className={panelClass("addresses", "space-y-6")}>
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
                onClick={() => setAddressFormOpen((v) => !v)}
                className="px-5 py-2.5 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition shadow-sm flex items-center gap-1.5"
              >
                {addressFormOpen ? (
                  <X className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>{addressFormOpen ? "Cancel" : "Add Address"}</span>
              </button>
            </div>

            {addressFormOpen && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addAddressMutation.mutate(addressDraft);
                }}
                className="p-6 rounded-3xl bg-ivory border border-cream grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="sm:col-span-2">
                  <label className={labelCls}>Address Line</label>
                  <input
                    className={inputCls}
                    required
                    placeholder="Flat / House no, Street, Area"
                    value={addressDraft.line1}
                    onChange={(e) =>
                      setAddressDraft((d) => ({ ...d, line1: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input
                    className={inputCls}
                    required
                    placeholder="Mumbai"
                    value={addressDraft.city}
                    onChange={(e) =>
                      setAddressDraft((d) => ({ ...d, city: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <input
                    className={inputCls}
                    required
                    placeholder="Maharashtra"
                    value={addressDraft.state}
                    onChange={(e) =>
                      setAddressDraft((d) => ({ ...d, state: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Pincode</label>
                  <input
                    className={inputCls}
                    required
                    placeholder="400050"
                    value={addressDraft.pincode}
                    onChange={(e) =>
                      setAddressDraft((d) => ({ ...d, pincode: e.target.value }))
                    }
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={addAddressMutation.isPending}
                    className="px-6 py-3 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition disabled:opacity-60"
                  >
                    {addAddressMutation.isPending ? "Saving…" : "Save Address"}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addressesQuery.isPending ? (
                <p className="col-span-full py-8 text-center text-muted text-sm">
                  Loading addresses…
                </p>
              ) : addresses.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-cream/30 rounded-3xl border border-cream">
                  <MapPin className="w-10 h-10 text-muted mx-auto mb-3 stroke-[1.5]" />
                  <h4 className="font-serif text-xl text-charcoal mb-2">
                    No saved addresses yet
                  </h4>
                  <p className="text-xs text-muted">
                    Add a shipping address to speed up checkout.
                  </p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-6 rounded-3xl shadow-sm relative ${
                      addr.is_default
                        ? "bg-ivory border-2 border-accent"
                        : "bg-white border border-cream"
                    }`}
                  >
                    {addr.is_default && (
                      <span className="absolute top-5 right-5 px-3 py-0.5 rounded-full bg-accent text-white text-[9px] uppercase font-bold tracking-widest">
                        Default
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-charcoal mb-1">
                      {activeUser.name}
                    </h4>
                    <p className="text-xs text-muted leading-relaxed mb-4">
                      {addr.line1}
                      <br />
                      {addr.city}, {addr.state} - {addr.pincode}
                      <br />
                      Phone: {activeUser.phone}
                    </p>
                    <div className="flex gap-3 text-xs font-semibold pt-2 border-t border-cream">
                      {!addr.is_default && (
                        <>
                          <button
                            onClick={() => setDefaultAddressMutation.mutate(addr.id)}
                            disabled={setDefaultAddressMutation.isPending}
                            className="text-accent hover:underline disabled:opacity-50"
                          >
                            Set As Default
                          </button>
                          <span className="text-muted/40">•</span>
                        </>
                      )}
                      <button
                        onClick={() => {
                          if (confirm("Delete this address?")) {
                            deleteAddressMutation.mutate(addr.id);
                          }
                        }}
                        disabled={deleteAddressMutation.isPending}
                        className="text-muted hover:text-rose-600 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 5. FLAVOR PROFILE TAB */}
          <div className={panelClass("skin-profile", "space-y-6")}>
            <div>
              <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-1">
                Flavor Intelligence
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-charcoal">
                Your Flavor Profile
              </h2>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-cream/40 border border-cream grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted font-bold block mb-1">
                  Flavor Preference
                </span>
                <span className="font-serif text-2xl font-bold text-accent">
                  {activeUser.skinType || "Not set"}
                </span>
                {!activeUser.skinType && (
                  <p className="text-xs text-muted mt-1">
                    Chosen during registration — used for personalized picks.
                  </p>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted font-bold block mb-1">
                  Member Since
                </span>
                <span className="font-serif text-2xl font-bold text-charcoal">
                  {activeUser.memberSince || "—"}
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
                    <strong className="text-charcoal">Straight Up:</strong> Enjoy a
                    handful of sun-dried strips with your morning tea.
                  </li>
                  <li>
                    <strong className="text-charcoal">Pair It:</strong> Toss glazed
                    slices into your breakfast yogurt bowl.
                  </li>
                  <li>
                    <strong className="text-charcoal">On The Go:</strong> Pack a
                    resealable pouch for your morning commute.
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
                    <strong className="text-charcoal">Movie Night:</strong> Share a
                    bowl of chili lime bites while streaming.
                  </li>
                  <li>
                    <strong className="text-charcoal">Sweet Tooth:</strong> Nibble
                    fusion chews for a naturally sweet treat.
                  </li>
                  <li>
                    <strong className="text-charcoal">Relax:</strong> Pair with
                    herbal tea for a calm evening treat.
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* 6. ACCOUNT SETTINGS TAB */}
          <div className={panelClass("settings", "space-y-6")}>
            <div>
              <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-1">
                Personal Details
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-charcoal">
                Account Settings
              </h2>
            </div>

            <form
              className="space-y-5 max-w-xl"
              onSubmit={(e) => {
                e.preventDefault();
                profileMutation.mutate(profileDraft);
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>First Name</label>
                  <input
                    type="text"
                    required
                    value={profileDraft.f_name}
                    onChange={(e) =>
                      setProfileDraft((d) => ({ ...d, f_name: e.target.value }))
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Last Name</label>
                  <input
                    type="text"
                    required
                    value={profileDraft.l_name}
                    onChange={(e) =>
                      setProfileDraft((d) => ({ ...d, l_name: e.target.value }))
                    }
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input
                  type="email"
                  required
                  value={profileDraft.email}
                  onChange={(e) =>
                    setProfileDraft((d) => ({ ...d, email: e.target.value }))
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profileDraft.ph_no}
                  onChange={(e) =>
                    setProfileDraft((d) => ({ ...d, ph_no: e.target.value }))
                  }
                  className={inputCls}
                />
              </div>
              <div className="pt-4 border-t border-cream">
                <button
                  type="submit"
                  disabled={profileMutation.isPending}
                  className="px-8 py-3.5 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition shadow-sm disabled:opacity-60"
                >
                  {profileMutation.isPending ? "Saving…" : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
