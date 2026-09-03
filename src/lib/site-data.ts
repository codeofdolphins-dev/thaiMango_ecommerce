import { formatMoney } from "@/lib/currency";

// Shared site data ported from resources/js/app.js

export type Lang = "en" | "th";

export const translations: Record<Lang, Record<string, string>> = {
  en: {
    marquee_welcome: "Welcome to Thai Mango — Enjoy 15% off your first order",
    shop_now: "Shop Now",
    menu: "Menu",
    hero_title_1: "BANGKOK",
    hero_title_2: "MANGO",
    hero_desc:
      "Where orchard tradition meets modern craft. Discover naturally sun-dried mango, hand-selected in Thailand for timeless tropical sweetness.",
    shop_products: "Shop Products",
    skin_consultation: "Talk to Us",
    the_selection: "THE SELECTION",
    discover_more: "Discover More",
    shop_by_category: "SHOP BY CATEGORY",
    category_serums: "Spiced & Zesty",
    category_sunscreen: "Fusion Blends",
    category_mango: "Classic Cuts",
    join_circle_title: "Enter the Inner Circle",
    join_circle_desc:
      "Receive snacking rituals, new launches and exclusive offers directly in your inbox.",
    join_circle_btn: "Join the Circle",
    search_placeholder: "Search products, recipes, ingredients...",
    your_bag: "Your Bag",
    subtotal: "Subtotal",
    checkout: "Checkout",
    add_to_cart: "Add to Bag",
    quick_view: "Quick View",
    footer_brand_desc: "Sun-ripened in Thailand, sun-dried the traditional way.",
    footer_shop: "Shop",
    footer_discover: "Discover",
    footer_help: "Help & Policies",
    shipping_calc: "Shipping & taxes calculated at checkout.",
    nav_01: "Home",
    nav_02: "Shop",
    nav_03: "Our Story",
    nav_04: "Ingredients",
    nav_05: "Rituals",
    nav_06: "FAQ",
    nav_07: "Contact",
  },
  th: {
    marquee_welcome:
      "ยินดีต้อนรับสู่ Thai Mango — รับส่วนลด 15% สำหรับการสั่งซื้อครั้งแรก",
    shop_now: "ช้อปเลย",
    menu: "เมนู",
    hero_title_1: "BANGKOK",
    hero_title_2: "MANGO",
    hero_desc:
      "ที่ซึ่งภูมิปัญญาแห่งสวนมะม่วงผสานงานฝีมือสมัยใหม่ เพื่อความหวานเหนือกาลเวลา",
    shop_products: "เลือกซื้อสินค้า",
    skin_consultation: "ติดต่อเรา",
    the_selection: "สินค้าแนะนำพิเศษ",
    discover_more: "ดูเพิ่มเติม",
    shop_by_category: "เลือกซื้อตามหมวดหมู่",
    category_serums: "รสเผ็ดจี๊ดจ๊าด",
    category_sunscreen: "สูตรผสมพิเศษ",
    category_mango: "มะม่วงแท้คลาสสิก",
    join_circle_title: "เข้าร่วมคอมมูนิตี้สุดพิเศษ",
    join_circle_desc:
      "รับเคล็ดลับการกินมะม่วงและข้อเสนอสุดพิเศษส่งตรงถึงคุณก่อนใคร",
    join_circle_btn: "สมัครรับข่าวสาร",
    search_placeholder: "ค้นหาสินค้า สูตรอาหาร ส่วนผสม...",
    your_bag: "ตะกร้าสินค้าของคุณ",
    subtotal: "ยอดรวมย่อย",
    checkout: "ดำเนินการชำระเงิน",
    add_to_cart: "เพิ่มลงตะกร้า",
    quick_view: "ดูตัวอย่างด่วน",
    footer_brand_desc: "ตากแดดในไทย ตากแห้งแบบดั้งเดิม",
    footer_shop: "ช้อปปิ้ง",
    footer_discover: "ค้นพบ",
    footer_help: "ช่วยเหลือและนโยบาย",
    shipping_calc: "Shipping & taxes calculated at checkout.",
    nav_01: "หน้าแรก",
    nav_02: "ร้านค้า",
    nav_03: "เรื่องราวของเรา",
    nav_04: "ส่วนผสมสำคัญ",
    nav_05: "สูตรและเคล็ดลับ",
    nav_06: "คำถามที่พบบ่อย",
    nav_07: "ติดต่อเรา",
  },
};

/* Site search now queries /api/products live; static content-page entries live
   in SearchOverlay.tsx. */

export const menuPromoData = {
  shop: {
    img: "/images/products/bangkok-mango-chili-lime.png",
    tag: "New Arrivals",
    title: "Discover our newest mango creations.",
    btn: "Shop Now",
    url: "/shop",
  },
  guides: {
    img: "/images/products/bangkok-mango-beetroot.png",
    tag: "Mango Stories & Ideas",
    title: "Discover our heritage, ingredients, and serving inspiration.",
    btn: "Explore Stories",
    url: "/rituals",
  },
  customerCare: {
    img: "/images/products/bangkok-mango-original.jpeg",
    tag: "Customer Care",
    title: "Help with mango products, orders, and delivery.",
    btn: "Contact Us",
    url: "/contact",
  },
} as const;

export type MenuTab = keyof typeof menuPromoData;

/** @deprecated static fallback — client components should take formatPrice
 *  from useStore() so it follows the store currency setting. */
export const formatPrice = (price: number) => formatMoney(Number(price));

export const FREE_SHIPPING_THRESHOLD = 1500;
export const STANDARD_SHIPPING = 99;

export interface AuthUser {
  isLoggedIn: boolean;
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  skinType?: string;
  tier?: string;
  points?: number;
  memberSince?: string;
}
