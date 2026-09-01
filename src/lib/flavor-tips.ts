/**
 * Snack suggestions shown on the dashboard's Flavor Profile tab, keyed by the
 * flavor preference the shopper picked at registration (`User.flavor_preference`,
 * whose allowed values are set by `signupSchema.choice`).
 *
 * Site copy rather than user data, but it is selected by the shopper's own
 * preference so the "Your Flavor Profile" heading is accurate — a visitor who
 * chose Spicy sees chili-lime suggestions, not the generic set.
 */

export const FLAVOR_PREFERENCES = [
    "Classic",
    "Spicy",
    "Sweet & Glazed",
    "Fusion",
] as const;

export type FlavorPreference = (typeof FLAVOR_PREFERENCES)[number];

export interface FlavorTip {
    title: string;
    body: string;
}

export interface FlavorTips {
    /** Product this preference maps to, used for the copy's voice. */
    morning: FlavorTip[];
    evening: FlavorTip[];
}

const TIPS: Record<FlavorPreference, FlavorTips> = {
    Classic: {
        morning: [
            {
                title: "Straight Up",
                body: "A handful of Classic Sun-Dried Strips alongside your morning tea.",
            },
            {
                title: "Stir It In",
                body: "Chop a few strips into porridge or overnight oats for natural sweetness.",
            },
            {
                title: "On The Go",
                body: "Tuck a resealable pouch into your bag for the commute.",
            },
        ],
        evening: [
            {
                title: "Cheese Board",
                body: "Classic strips cut the salt on a sharp cheddar or aged gouda.",
            },
            {
                title: "Slow Wind-Down",
                body: "Pair with jasmine tea when you want something sweet but not heavy.",
            },
            {
                title: "Share A Bowl",
                body: "The no-sugar-added strips are the safest crowd-pleaser on the table.",
            },
        ],
    },
    Spicy: {
        morning: [
            {
                title: "Wake Up Sharp",
                body: "Chili Lime Bites with black coffee — the heat clears the head fast.",
            },
            {
                title: "Savory Breakfast",
                body: "Scatter over avocado toast for a sweet-sour-spicy lift.",
            },
            {
                title: "Desk Snack",
                body: "Keep a pouch at your desk for the mid-morning slump.",
            },
        ],
        evening: [
            {
                title: "Movie Night",
                body: "A bowl of Chili Lime Bites beats popcorn and lasts longer.",
            },
            {
                title: "With A Cold One",
                body: "The chili-lime edge works the way a salted rim does on a drink.",
            },
            {
                title: "Salad Topper",
                body: "Slice into a green papaya or cucumber salad for crunch and heat.",
            },
        ],
    },
    "Sweet & Glazed": {
        morning: [
            {
                title: "Yogurt Bowl",
                body: "Toss Honey Glazed Slices into breakfast yogurt with a few nuts.",
            },
            {
                title: "Bake It In",
                body: "Fold chopped glazed slices through muffin or scone batter.",
            },
            {
                title: "Sweet Start",
                body: "Two or three slices with coffee when you want dessert for breakfast.",
            },
        ],
        evening: [
            {
                title: "Dessert, Sorted",
                body: "Glazed slices over vanilla ice cream — no other pudding needed.",
            },
            {
                title: "Sweet Tooth",
                body: "Nibble a few slices when a chocolate craving hits.",
            },
            {
                title: "Cheese & Honey",
                body: "The wildflower glaze sits beautifully next to a soft blue cheese.",
            },
        ],
    },
    Fusion: {
        morning: [
            {
                title: "Smoothie Boost",
                body: "Blend Beetroot Fusion Chews into a berry smoothie for color and depth.",
            },
            {
                title: "Post-Workout",
                body: "The beetroot infusion makes these an easy morning-training snack.",
            },
            {
                title: "Bright Bowl",
                body: "Scatter over granola for an earthy-sweet contrast.",
            },
        ],
        evening: [
            {
                title: "Grazing Board",
                body: "The ruby color earns the chews a place on any evening board.",
            },
            {
                title: "Naturally Sweet",
                body: "Fusion chews satisfy a sweet craving without added sugar.",
            },
            {
                title: "Herbal Tea",
                body: "Pair with hibiscus or rooibos for a calm end to the day.",
            },
        ],
    },
};

/** Tips for a saved preference, or null when it is unset or unrecognised. */
export function tipsForPreference(
    preference: string | null | undefined
): FlavorTips | null {
    if (!preference) return null;
    return TIPS[preference as FlavorPreference] ?? null;
}
