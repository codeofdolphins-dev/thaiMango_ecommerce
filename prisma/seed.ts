import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prismaClient";
import { DEFAULT_SETTINGS } from "../src/schemas/settings.schema";
import { FAQ_DEFAULTS } from "../src/schemas/faq.schema";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@thaimango.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";

const CATEGORY_DEFAULTS = [
    { slug: "classic-cuts", name_en: "Classic Cuts", name_th: "แบบดั้งเดิม" },
    { slug: "spiced-zesty", name_en: "Spiced & Zesty", name_th: "เผ็ดแซ่บ" },
    { slug: "glazed-sweet", name_en: "Glazed & Sweet", name_th: "เคลือบหวาน" },
    { slug: "fusion-blends", name_en: "Fusion Blends", name_th: "ฟิวชันเบลนด์" },
    { slug: "gift-sets", name_en: "Gift Sets", name_th: "ชุดของขวัญ" },
];

/* Products transcribed from the approved static design in `resources/`.
   shop.html is the source of truth: it is the only page carrying all six
   products with their ids, categories and prices (index.html shows different
   prices for two of them, product-detail.html covers only the beetroot chews).
   `images/` ships just two product photos, so — as in the reference — several
   products share one. Files live in public/images/products/, served by us.
   `how_its_made` / `storage_info` / `ingredients` exist verbatim only for the
   beetroot chews; the rest are derived from each product's own description.
   Thai copy has no source anywhere in the design: only UI chrome and category
   names are translated, so `name_th` / `description_th` below are new and want
   a native speaker's review. */
const IMG_1 = "/images/products/bangkok-mango-beetroot.png";
const IMG_2 = "/images/products/bangkok-mango-chili-lime.png";

const STORAGE_INFO =
    "Keep in a cool, dry place away from direct sunlight. The resealable pouch locks in freshness after opening — best enjoyed within 2 weeks. Unopened, it stays fresh for up to 12 months from the pack date.";

interface SeedVariant {
    label: string;
    weight_grams: number;
    sku: string;
    price: number;
    compare_at_price: number;
    stock: number;
}

interface SeedProduct {
    slug: string;
    category_slug: string;
    name_en: string;
    name_th: string;
    description_en: string;
    description_th: string;
    images: string[];
    tags: string[];
    highlights: string[];
    how_its_made?: string;
    storage_info?: string;
    ingredients?: string;
    variants: SeedVariant[];
}

const PRODUCT_DEFAULTS: SeedProduct[] = [
    {
        slug: "classic-sun-dried-strips",
        category_slug: "classic-cuts",
        name_en: "Thai Mango Classic Sun-Dried Strips",
        name_th: "มะม่วงอบแห้งคลาสสิก",
        description_en:
            "Naturally sun-dried Thai mango strips with no sugar added — just soft, chewy, sun-ripened sweetness.",
        description_th:
            "มะม่วงไทยตากแดดแบบธรรมชาติ ไม่เติมน้ำตาล นุ่ม หนึบ หวานจากผลสุกธรรมชาติ",
        images: [IMG_1, IMG_2],
        tags: ["classic", "mango", "natural", "no sugar added", "chewy"],
        highlights: ["Best Seller", "No Sugar Added", "100% Natural"],
        how_its_made:
            "Ripe Thai mangoes are hand-selected, sliced, and slow sun-dried using a centuries-old Thai technique to concentrate their natural sweetness.",
        storage_info: STORAGE_INFO,
        ingredients:
            "Mangifera Indica (Mango). No added sugar, no preservatives, no artificial colors or flavors. May contain natural fruit sulfites.",
        variants: [
            {
                label: "100g Pouch",
                weight_grams: 100,
                sku: "TM-CSD-100",
                price: 390,
                compare_at_price: 430,
                stock: 120,
            },
        ],
    },
    {
        slug: "chili-lime-bites",
        category_slug: "spiced-zesty",
        name_en: "Thai Mango Chili Lime Bites",
        name_th: "มะม่วงอบแห้งพริกมะนาว",
        description_en:
            "Sun-dried mango tossed in Thai chili and lime for a bold sweet-sour-spicy kick in every bite.",
        description_th:
            "มะม่วงอบแห้งคลุกพริกไทยและมะนาว ให้รสหวาน เปรี้ยว เผ็ดจี๊ดจ๊าดในคำเดียว",
        images: [IMG_1, IMG_2],
        tags: ["chili", "lime", "spicy", "zesty", "mango"],
        highlights: ["Sweet, Sour & Spicy", "100% Natural"],
        how_its_made:
            "Slow sun-dried Thai mango is tossed by hand with Thai chili and lime so the spice coats every strip without masking the fruit.",
        storage_info: STORAGE_INFO,
        ingredients:
            "Mangifera Indica (Mango), Thai Chili, Lime. No preservatives, no artificial colors or flavors. May contain natural fruit sulfites.",
        variants: [
            {
                label: "100g Pouch",
                weight_grams: 100,
                sku: "TM-CLB-100",
                price: 430,
                compare_at_price: 430,
                stock: 90,
            },
        ],
    },
    {
        slug: "honey-glazed-slices",
        category_slug: "glazed-sweet",
        name_en: "Thai Mango Honey Glazed Slices",
        name_th: "มะม่วงอบแห้งเคลือบน้ำผึ้ง",
        description_en:
            "Soft, glossy mango slices finished with a wildflower honey glaze for an extra-indulgent bite.",
        description_th:
            "มะม่วงอบแห้งเนื้อนุ่ม เคลือบน้ำผึ้งดอกไม้ป่า ให้รสหวานละมุนเป็นพิเศษ",
        images: [IMG_2, IMG_1],
        tags: ["honey", "glazed", "sweet", "soft", "mango"],
        highlights: ["Wildflower Honey", "Naturally Sweet"],
        how_its_made:
            "Sun-dried mango slices are finished with a delicate wildflower honey glaze, then rested so the glaze sets to a soft shine.",
        storage_info: STORAGE_INFO,
        ingredients:
            "Mangifera Indica (Mango), Wildflower Honey. No preservatives, no artificial colors or flavors. May contain natural fruit sulfites.",
        variants: [
            {
                label: "150g Pack",
                weight_grams: 150,
                sku: "TM-HGS-150",
                price: 450,
                compare_at_price: 450,
                stock: 75,
            },
        ],
    },
    {
        slug: "beetroot-fusion-chews",
        category_slug: "fusion-blends",
        name_en: "Thai Mango Beetroot Fusion Chews",
        name_th: "มะม่วงอบแห้งผสมบีทรูท",
        description_en:
            "Thai Mango Beetroot Fusion Chews pair naturally sun-dried Thai mango with real beetroot for a vibrant, earthy-sweet chew. Slow sun-dried the traditional way and infused with beetroot for color and antioxidants, with no added preservatives — just fruit, sunshine, and time.",
        description_th:
            "มะม่วงไทยตากแดดผสานบีทรูทแท้ ให้สีสันสดใส รสหวานอมดินอ่อน ๆ และสารต้านอนุมูลอิสระ ไม่ใส่วัตถุกันเสีย",
        images: [IMG_1, IMG_2],
        tags: ["beetroot", "fusion", "antioxidant", "mango", "chewy"],
        highlights: ["100% Natural", "No Preservatives", "Naturally Sweet", "Product of Thailand"],
        how_its_made:
            "Ripe Thai mangoes are hand-selected, sliced, and slow sun-dried using a centuries-old Thai technique to concentrate their natural sweetness. Each slice is then infused with real beetroot juice, adding vibrant color, earthy depth of flavor, and a natural boost of antioxidants.",
        storage_info: STORAGE_INFO,
        ingredients:
            "Mangifera Indica (Mango), Beta Vulgaris (Beetroot) Juice Concentrate. No added sugar, no preservatives, no artificial colors or flavors. May contain natural fruit sulfites.",
        variants: [
            {
                label: "100g Standard",
                weight_grams: 100,
                sku: "TM-BFC-100",
                price: 410,
                compare_at_price: 450,
                stock: 140,
            },
            {
                label: "250g Bulk Pack",
                weight_grams: 250,
                sku: "TM-BFC-250",
                price: 950,
                compare_at_price: 950,
                stock: 40,
            },
        ],
    },
    {
        slug: "discovery-gift-box",
        category_slug: "gift-sets",
        name_en: "Thai Mango Discovery Gift Box",
        name_th: "กล่องของขวัญรวมรสชาติ",
        description_en:
            "Can't decide? This variety box bundles all four Thai Mango flavors in one beautifully packaged gift set.",
        description_th:
            "เลือกไม่ถูกใช่ไหม? กล่องนี้รวมมะม่วงอบแห้งครบทั้งสี่รสชาติในชุดของขวัญสุดพิเศษ",
        images: [IMG_1, IMG_2],
        tags: ["gift", "box", "variety", "mango", "bundle"],
        highlights: ["All 4 Flavors", "Gift Box"],
        storage_info: STORAGE_INFO,
        ingredients:
            "Contains all four Thai Mango flavors: Classic Sun-Dried Strips, Chili Lime Bites, Honey Glazed Slices and Beetroot Fusion Chews. See each pouch for its full ingredient list.",
        variants: [
            {
                label: "4 x 100g Pouches",
                weight_grams: 400,
                sku: "TM-DGB-400",
                price: 1450,
                compare_at_price: 1600,
                stock: 30,
            },
        ],
    },
    {
        slug: "duo-gift-set",
        category_slug: "gift-sets",
        name_en: "Thai Mango Duo Gift Set",
        name_th: "ชุดของขวัญคู่",
        description_en:
            "Our Classic Sun-Dried Strips paired with Chili Lime Bites in one gift-ready duo pack.",
        description_th:
            "มะม่วงอบแห้งคลาสสิกคู่กับรสพริกมะนาว ในชุดของขวัญพร้อมมอบให้คนพิเศษ",
        images: [IMG_2, IMG_1],
        tags: ["gift", "duo", "bundle", "mango", "set"],
        highlights: ["Gift Box", "Two Flavors"],
        storage_info: STORAGE_INFO,
        ingredients:
            "Contains Classic Sun-Dried Strips and Chili Lime Bites. See each pouch for its full ingredient list.",
        variants: [
            {
                label: "2 x 100g Duo Pack",
                weight_grams: 200,
                sku: "TM-DUO-200",
                price: 780,
                compare_at_price: 860,
                stock: 45,
            },
        ],
    },
];

const SITE_CONTENT_DEFAULTS = [
    { id: "announcement", section: "Announcement Bar", location: "All pages", content: "Welcome to Thai Mango — Enjoy 15% off your first order" },
    { id: "hero", section: "Homepage Hero", location: "Home", content: "THAI MANGO — Where orchard tradition meets modern craft." },
    { id: "hero_title", section: "Hero Title Accent Word", location: "Home", content: "MANGO" },
    { id: "hero_desc", section: "Hero Description", location: "Home", content: "Where orchard tradition meets modern craft. Discover naturally sun-dried mango, hand-selected in Thailand for timeless tropical sweetness." },
    { id: "founder_quote", section: "Founder Quote", location: "Home", content: "Thai Mango was created to bring my family's three generations of orchard craft to the world — mango dried the way my grandmother did it, with nothing added and nothing hidden." },
    { id: "community_intro", section: "Mango Moments Intro", location: "Home", content: "Join our community of mango lovers. Share your snacking moments with #THAIMANGOMOMENTS." },
    { id: "heritage_title", section: "Heritage Film Title", location: "Home", content: "A Legacy of Golden Orchards" },
    { id: "journal_intro", section: "Journal Intro", location: "Home", content: "Dive into our curated world of snacking rituals, orchard heritage, and mango know-how." },
    { id: "expert_intro", section: "Flavor Expert Intro", location: "Home", content: "Tell us your taste preferences — sweet, spicy, tangy, or classic — and we'll point you toward the flavors that fit, or connect you with our team for bulk and gifting orders." },
    { id: "story", section: "Our Story", location: "About", content: "Sun-ripened in Thailand, sun-dried the traditional way." },
    { id: "ingredients", section: "Ingredients", location: "Ingredients", content: "100% Thai natural ingredients — mango, chili, honey, beetroot." },
    { id: "faq", section: "FAQ", location: "FAQ", content: "9 questions across Ingredients, Snacks and Shipping." },
    { id: "footer", section: "Footer & Newsletter", location: "All pages", content: "Sign up for early access, recipes and mango edits." },
];

async function main() {
    const rounds = Number(process.env.BCRYPT_SALT) || 10;
    const password_hash = await bcrypt.hash(ADMIN_PASSWORD, rounds);

    const admin = await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: { role: "ADMIN" },
        create: {
            email: ADMIN_EMAIL,
            password_hash,
            name: "Thai Mango Admin",
            phone: "+91 00000 00000",
            role: "ADMIN",
        },
    });
    console.log(`Admin ready: ${admin.email} (password: ${ADMIN_PASSWORD})`);

    /* Default product categories — created once, admin edits win afterwards */
    for (const category of CATEGORY_DEFAULTS) {
        await prisma.categories.upsert({
            where: { slug: category.slug },
            update: {},
            create: category,
        });
    }
    console.log(`Categories ready (${CATEGORY_DEFAULTS.length})`);

    /* Reference-site catalogue — created once, admin edits win afterwards.
       Variants are matched on their [product_id, label] unique pair so a
       re-run adds a newly listed size without disturbing existing stock. */
    for (const item of PRODUCT_DEFAULTS) {
        const category = await prisma.categories.findUnique({
            where: { slug: item.category_slug },
        });
        if (!category) {
            throw new Error(
                `Category "${item.category_slug}" is missing — it must be seeded before products.`
            );
        }

        const { variants, category_slug: _category_slug, ...fields } = item;
        const product = await prisma.product.upsert({
            where: { slug: item.slug },
            update: {},
            create: {
                ...fields,
                category_id: category.id,
                status: "ACTIVE",
            },
        });

        for (const [position, variant] of variants.entries()) {
            await prisma.productVariant.upsert({
                where: {
                    product_id_label: { product_id: product.id, label: variant.label },
                },
                update: {},
                create: {
                    ...variant,
                    product_id: product.id,
                    is_default: position === 0,
                    position,
                },
            });
        }
    }
    const variantCount = PRODUCT_DEFAULTS.reduce((n, p) => n + p.variants.length, 0);
    console.log(
        `Products ready (${PRODUCT_DEFAULTS.length} products, ${variantCount} variants)`
    );

    /* Default CMS blocks — created once, admin edits win afterwards */
    for (const block of SITE_CONTENT_DEFAULTS) {
        await prisma.siteContent.upsert({
            where: { id: block.id },
            update: {},
            create: block,
        });
    }
    console.log(`Site content blocks ready (${SITE_CONTENT_DEFAULTS.length})`);

    /* Default store settings — created once, admin edits win afterwards */
    await prisma.storeSettings.upsert({
        where: { id: 1 },
        update: {},
        create: { id: 1, data: DEFAULT_SETTINGS },
    });
    console.log("Store settings ready");

    /* Launch FAQs — seeded only into an empty table (no explicit ids, so the
       autoincrement sequence stays intact). Admin edits/deletions win: a
       reseed never re-adds or overwrites rows once any exist. */
    const faqCount = await prisma.faq.count();
    if (faqCount === 0) {
        await prisma.faq.createMany({ data: FAQ_DEFAULTS });
        console.log(`FAQs seeded (${FAQ_DEFAULTS.length})`);
    } else {
        console.log(`FAQs already present (${faqCount}) — seed skipped`);
    }
}

main()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
