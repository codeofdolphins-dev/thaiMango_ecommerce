import { z } from "zod";

/* Fixed FAQ topics — ids are stored on Faq rows; labels/blurbs render on the
   public page and the admin form. Icons live with the pages (this file is
   imported by prisma/seed.ts, which must stay free of React). */
export const FAQ_CATEGORY_IDS = ["ingredients", "snacks", "shipping"] as const;

export type FaqCategoryId = (typeof FAQ_CATEGORY_IDS)[number];

export const FAQ_CATEGORIES: {
    id: FaqCategoryId;
    label: string;
    blurb: string;
}[] = [
    {
        id: "ingredients",
        label: "Ingredients & Allergens",
        blurb: "What goes into every pouch — and what never does.",
    },
    {
        id: "snacks",
        label: "Thai Mango Snacks",
        blurb: "Craft, shelf life, and who our chews are made for.",
    },
    {
        id: "shipping",
        label: "Shipping & Orders",
        blurb: "Dispatch times, tracking, and payment on delivery.",
    },
];

export const faqSchema = z.object({
    category: z.enum(FAQ_CATEGORY_IDS),
    question: z.string().trim().min(1, "Question is required").max(300),
    answer: z.string().trim().min(1, "Answer is required").max(5000),
    /* Sort order within a category — lower shows first. */
    position: z.coerce.number<number | string>().int().min(0).default(0),
    is_active: z.boolean().default(true),
});

export type FaqValues = z.infer<typeof faqSchema>;

export const faqPatchSchema = faqSchema.partial();

/* The launch FAQ set (formerly hardcoded on the public page) — seeded once by
   prisma/seed.ts when the table is empty, and the public page's fallback while
   the API loads. Admin edits/deletions are never overwritten by reseeding. */
export const FAQ_DEFAULTS: FaqValues[] = [
    {
        category: "ingredients",
        position: 0,
        is_active: true,
        question: "Do Thai Mango snacks contain any allergens?",
        answer:
            "All Thai Mango products are processed in a facility that also handles tree nuts and sulfites, so trace cross-contact is possible. Some lines use a small amount of sulfites as a preservative to maintain color and freshness — always check the pack label for the specific batch's allergen statement before serving to anyone with a known sensitivity.",
    },
    {
        category: "ingredients",
        position: 1,
        is_active: true,
        question: "How spicy are the Chili Lime Bites?",
        answer:
            "Our Chili Lime Bites carry a mild-to-medium heat — a bright, tangy kick from Thai chili and lime rather than an overwhelming burn. If you prefer no spice at all, we recommend our Classic Sun-Dried Strips or Honey Glazed Slices instead.",
    },
    {
        category: "ingredients",
        position: 2,
        is_active: true,
        question: "Do your snacks contain added sugar?",
        answer:
            "Our Classic Sun-Dried Strips have no added sugar — just the natural sweetness of sun-ripened mango. Honey Glazed Slices are lightly finished with real honey for extra sweetness. Check each product page for the full nutritional breakdown.",
    },
    {
        category: "snacks",
        position: 0,
        is_active: true,
        question: "What makes Thai Mango Beetroot Fusion Chews unique?",
        answer:
            "We select only tree-ripened Thai mangoes and infuse them with natural beetroot juice before gently dehydrating them at low temperatures. This preserves the soft, chewy texture, vibrant ruby hue, and vital phytonutrients without adding artificial colors or chemical preservatives.",
    },
    {
        category: "snacks",
        position: 1,
        is_active: true,
        question: "What is the shelf life of the fruit pouches?",
        answer:
            "Unopened pouches maintain peak freshness for roughly 12 months when stored in a cool, dry place away from direct sunlight. Once opened, reseal the pouch and consume within 7 days.",
    },
    {
        category: "snacks",
        position: 2,
        is_active: true,
        question: "Is Thai Mango suitable for children?",
        answer:
            "Yes! It is crafted for all ages (เหมาะสำหรับทุกวัย) as a wholesome lunchbox treat or guilt-free snack. We recommend the milder Classic Cuts and Glazed & Sweet lines for younger kids, and saving Spiced & Zesty for older snackers.",
    },
    {
        category: "snacks",
        position: 3,
        is_active: true,
        question: "Do you offer bulk or wholesale ordering?",
        answer:
            'Yes. We supply cafes, gift retailers, and corporate clients with bulk cases across all five collections — Classic Cuts, Spiced & Zesty, Glazed & Sweet, Fusion Blends, and Gift Sets. Reach out through our Contact page and select "Bulk & Wholesale Orders" for pricing.',
    },
    {
        category: "shipping",
        position: 0,
        is_active: true,
        question: "How long does shipping take?",
        answer:
            "Orders are dispatched within 24 hours. Metro deliveries typically arrive in 2–3 business days, while non-metro locations take 4–5 business days. You will receive an SMS and email with live tracking details.",
    },
    {
        category: "shipping",
        position: 1,
        is_active: true,
        question: "Do you accept Cash on Delivery (COD)?",
        answer:
            "Yes, Cash on Delivery is available across most serviceable pincodes across India.",
    },
];
