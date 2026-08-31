import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prismaClient";
import { DEFAULT_SETTINGS } from "../src/schemas/settings.schema";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@thaimango.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";

const CATEGORY_DEFAULTS = [
    { slug: "classic-cuts", name_en: "Classic Cuts", name_th: "แบบดั้งเดิม" },
    { slug: "spiced-zesty", name_en: "Spiced & Zesty", name_th: "เผ็ดแซ่บ" },
    { slug: "glazed-sweet", name_en: "Glazed & Sweet", name_th: "เคลือบหวาน" },
    { slug: "fusion-blends", name_en: "Fusion Blends", name_th: "ฟิวชันเบลนด์" },
    { slug: "gift-sets", name_en: "Gift Sets", name_th: "ชุดของขวัญ" },
];

const SITE_CONTENT_DEFAULTS = [
    { id: "announcement", section: "Announcement Bar", location: "All pages", content: "Welcome to Thai Mango — Enjoy 15% off your first order" },
    { id: "hero", section: "Homepage Hero", location: "Home", content: "THAI MANGO — Where orchard tradition meets modern craft." },
    { id: "hero_title", section: "Hero Title", location: "Home", content: "THAI MANGO" },
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
}

main()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
