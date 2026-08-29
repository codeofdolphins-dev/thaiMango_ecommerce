/**
 * Sample data for the admin portal UI.
 * This is placeholder content so the screens render realistically — it will be
 * replaced by real reads from the API/DB layer (api/admin/*) in a later phase.
 */

export const formatINR = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export const CATEGORIES = [
  "Classic Cuts",
  "Spiced & Zesty",
  "Glazed & Sweet",
  "Fusion Blends",
  "Gift Sets",
] as const;

export type Category = (typeof CATEGORIES)[number];

/* ---- KPIs ---- */
export interface Kpi {
  label: string;
  value: string;
  delta: number; // percent, +/-
  spark: number[];
}

export const KPIS: Kpi[] = [
  { label: "Total Revenue", value: "₹4,82,650", delta: 12.4, spark: [12, 18, 14, 22, 26, 24, 31, 28, 35, 33, 40, 44] },
  { label: "Orders", value: "1,284", delta: 8.1, spark: [20, 24, 22, 28, 26, 30, 29, 34, 32, 38, 36, 41] },
  { label: "Customers", value: "3,942", delta: 5.7, spark: [8, 10, 12, 11, 14, 16, 15, 18, 20, 19, 22, 24] },
  { label: "Avg. Order Value", value: "₹376", delta: -2.3, spark: [30, 28, 31, 29, 27, 28, 26, 27, 25, 26, 24, 25] },
];

/* ---- Monthly revenue (bar chart) ---- */
export const MONTHLY_REVENUE = [
  { month: "Jan", value: 28 },
  { month: "Feb", value: 32 },
  { month: "Mar", value: 30 },
  { month: "Apr", value: 41 },
  { month: "May", value: 38 },
  { month: "Jun", value: 46 },
  { month: "Jul", value: 44 },
  { month: "Aug", value: 52 },
  { month: "Sep", value: 49 },
  { month: "Oct", value: 58 },
  { month: "Nov", value: 63 },
  { month: "Dec", value: 71 },
];

/* ---- Top categories (share of sales) ---- */
export const CATEGORY_SHARE: { name: Category; pct: number }[] = [
  { name: "Classic Cuts", pct: 34 },
  { name: "Fusion Blends", pct: 26 },
  { name: "Spiced & Zesty", pct: 18 },
  { name: "Glazed & Sweet", pct: 14 },
  { name: "Gift Sets", pct: 8 },
];

/* ---- Orders ---- */
export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  items: number;
  total: number;
  status: OrderStatus;
  payment: "Prepaid" | "COD";
}

export const ORDERS: Order[] = [
  { id: "TM-2026-89421", customer: "Aarav Sharma", email: "aarav@example.com", date: "2026-08-28", items: 3, total: 1230, status: "Processing", payment: "Prepaid" },
  { id: "TM-2026-89418", customer: "Diya Patel", email: "diya.p@example.com", date: "2026-08-28", items: 1, total: 410, status: "Pending", payment: "COD" },
  { id: "TM-2026-89407", customer: "Vihaan Rao", email: "vihaan@example.com", date: "2026-08-27", items: 5, total: 2145, status: "Shipped", payment: "Prepaid" },
  { id: "TM-2026-89395", customer: "Ananya Iyer", email: "ananya.iyer@example.com", date: "2026-08-27", items: 2, total: 860, status: "Delivered", payment: "Prepaid" },
  { id: "TM-2026-89380", customer: "Kabir Nair", email: "kabir@example.com", date: "2026-08-26", items: 1, total: 1450, status: "Delivered", payment: "Prepaid" },
  { id: "TM-2026-89377", customer: "Saanvi Menon", email: "saanvi@example.com", date: "2026-08-26", items: 4, total: 1680, status: "Cancelled", payment: "COD" },
  { id: "TM-2026-89361", customer: "Reyansh Gupta", email: "reyansh@example.com", date: "2026-08-25", items: 2, total: 790, status: "Shipped", payment: "Prepaid" },
  { id: "TM-2026-89344", customer: "Aisha Khan", email: "aisha.k@example.com", date: "2026-08-25", items: 3, total: 1290, status: "Processing", payment: "Prepaid" },
  { id: "TM-2026-89330", customer: "Ishaan Verma", email: "ishaan@example.com", date: "2026-08-24", items: 1, total: 390, status: "Delivered", payment: "COD" },
  { id: "TM-2026-89318", customer: "Myra Joshi", email: "myra@example.com", date: "2026-08-24", items: 6, total: 2610, status: "Delivered", payment: "Prepaid" },
];

/* ---- Products ---- */
export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  compareAt?: number;
  stock: number;
  sku: string;
  image: string;
  status: "Active" | "Draft" | "Out of Stock";
}

export const PRODUCTS: Product[] = [
  { id: 1, name: "Thai Mango Classic Sun-Dried Strips", category: "Classic Cuts", price: 390, compareAt: 430, stock: 214, sku: "TM-CLS-100", image: "/images/bangkok-mango-beetroot-1.png", status: "Active" },
  { id: 2, name: "Thai Mango Chili Lime Bites", category: "Spiced & Zesty", price: 430, stock: 156, sku: "TM-CHL-100", image: "/images/bangkok-mango-beetroot-1.png", status: "Active" },
  { id: 3, name: "Thai Mango Honey Glazed Slices", category: "Glazed & Sweet", price: 450, stock: 88, sku: "TM-HNY-100", image: "/images/bangkok-mango-beetroot-1.png", status: "Active" },
  { id: 4, name: "Thai Mango Beetroot Fusion Chews", category: "Fusion Blends", price: 410, stock: 0, sku: "TM-BTR-100", image: "/images/bangkok-mango-beetroot-2.png", status: "Out of Stock" },
  { id: 5, name: "Thai Mango Discovery Gift Box", category: "Gift Sets", price: 1450, stock: 42, sku: "TM-GFT-500", image: "/images/bangkok-mango-beetroot-2.png", status: "Active" },
  { id: 6, name: "Thai Mango Tangy Tamarind Twists", category: "Spiced & Zesty", price: 420, stock: 130, sku: "TM-TAM-100", image: "/images/bangkok-mango-beetroot-1.png", status: "Draft" },
];

/* ---- Customers ---- */
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  joined: string;
  tier: "New" | "Silver" | "Gold";
}

export const CUSTOMERS: Customer[] = [
  { id: 1, name: "Aarav Sharma", email: "aarav@example.com", phone: "+91 98765 43210", orders: 12, spent: 8640, joined: "2026-01-14", tier: "Gold" },
  { id: 2, name: "Diya Patel", email: "diya.p@example.com", phone: "+91 99876 54321", orders: 3, spent: 1230, joined: "2026-03-02", tier: "Silver" },
  { id: 3, name: "Vihaan Rao", email: "vihaan@example.com", phone: "+91 90123 45678", orders: 7, spent: 4980, joined: "2026-02-19", tier: "Gold" },
  { id: 4, name: "Ananya Iyer", email: "ananya.iyer@example.com", phone: "+91 91234 56789", orders: 2, spent: 860, joined: "2026-05-08", tier: "Silver" },
  { id: 5, name: "Kabir Nair", email: "kabir@example.com", phone: "+91 93456 78901", orders: 1, spent: 1450, joined: "2026-06-21", tier: "New" },
  { id: 6, name: "Saanvi Menon", email: "saanvi@example.com", phone: "+91 94567 89012", orders: 5, spent: 3210, joined: "2026-04-11", tier: "Silver" },
  { id: 7, name: "Reyansh Gupta", email: "reyansh@example.com", phone: "+91 95678 90123", orders: 4, spent: 2140, joined: "2026-04-30", tier: "Silver" },
  { id: 8, name: "Aisha Khan", email: "aisha.k@example.com", phone: "+91 96789 01234", orders: 9, spent: 6320, joined: "2026-02-05", tier: "Gold" },
];

/* ---- Reviews ---- */
export type ReviewStatus = "Published" | "Pending";

export interface Review {
  id: number;
  product: string;
  customer: string;
  rating: number;
  text: string;
  date: string;
  status: ReviewStatus;
}

export const REVIEWS: Review[] = [
  { id: 1, product: "Thai Mango Classic Sun-Dried Strips", customer: "Aarav Sharma", rating: 5, text: "Perfectly chewy and not too sweet — exactly like the mangoes I had in Chiang Mai.", date: "2026-08-27", status: "Published" },
  { id: 2, product: "Thai Mango Chili Lime Bites", customer: "Diya Patel", rating: 4, text: "Great tang, could be a touch spicier for my taste but still delicious.", date: "2026-08-26", status: "Published" },
  { id: 3, product: "Thai Mango Beetroot Fusion Chews", customer: "Vihaan Rao", rating: 5, text: "The colour is gorgeous and you can taste how natural it is. Repeat buyer!", date: "2026-08-25", status: "Pending" },
  { id: 4, product: "Thai Mango Honey Glazed Slices", customer: "Ananya Iyer", rating: 3, text: "Tasty but arrived a little stuck together. Packaging could improve.", date: "2026-08-24", status: "Pending" },
  { id: 5, product: "Thai Mango Discovery Gift Box", customer: "Kabir Nair", rating: 5, text: "Gifted this to my parents — beautiful box and every flavour was a hit.", date: "2026-08-22", status: "Published" },
];

/* ---- Coupons (mirrors the codes wired into the storefront checkout) ---- */
export interface Coupon {
  code: string;
  description: string;
  discount: string;
  used: number;
  limit: number;
  status: "Active" | "Expired";
  expires: string;
}

export const COUPONS: Coupon[] = [
  { code: "MANGO15", description: "15% off entire order", discount: "15%", used: 342, limit: 1000, status: "Active", expires: "2026-12-31" },
  { code: "WELCOME15", description: "15% welcome offer for new members", discount: "15%", used: 918, limit: 2000, status: "Active", expires: "2026-12-31" },
  { code: "FIRST15", description: "15% off first order", discount: "15%", used: 511, limit: 1500, status: "Active", expires: "2026-12-31" },
  { code: "MANGO10", description: "10% off entire order", discount: "10%", used: 205, limit: 1000, status: "Active", expires: "2026-10-31" },
  { code: "WELCOME10", description: "10% welcome offer", discount: "10%", used: 640, limit: 2000, status: "Expired", expires: "2026-06-30" },
];

/* ---- Site content blocks (CMS) ---- */
export interface ContentBlock {
  id: string;
  section: string;
  location: string;
  snippet: string;
  updated: string;
}

export const SITE_CONTENT: ContentBlock[] = [
  { id: "announcement", section: "Announcement Bar", location: "All pages", snippet: "Welcome to Thai Mango — Enjoy 15% off your first order", updated: "2026-08-20" },
  { id: "hero", section: "Homepage Hero", location: "Home", snippet: "THAI MANGO — Where orchard tradition meets modern craft.", updated: "2026-08-18" },
  { id: "story", section: "Our Story", location: "About", snippet: "Sun-ripened in Thailand, sun-dried the traditional way.", updated: "2026-07-30" },
  { id: "ingredients", section: "Ingredients", location: "Ingredients", snippet: "100% Thai natural ingredients — mango, chili, honey, beetroot.", updated: "2026-07-22" },
  { id: "faq", section: "FAQ", location: "FAQ", snippet: "9 questions across Ingredients, Snacks and Shipping.", updated: "2026-08-05" },
  { id: "footer", section: "Footer & Newsletter", location: "All pages", snippet: "Sign up for early access, recipes and mango edits.", updated: "2026-06-15" },
];

export const RECENT_ACTIVITY = [
  { text: "New order TM-2026-89421 placed by Aarav Sharma", time: "12 min ago", kind: "order" as const },
  { text: "Beetroot Fusion Chews is out of stock", time: "1 hr ago", kind: "stock" as const },
  { text: "Diya Patel created an account", time: "2 hr ago", kind: "customer" as const },
  { text: "Order TM-2026-89395 marked as Delivered", time: "3 hr ago", kind: "order" as const },
  { text: "Payout of ₹42,300 settled to bank", time: "5 hr ago", kind: "payout" as const },
];
