import { z } from "zod";

/** Topic options — drives both the public form's select and validation. */
export const INQUIRY_TOPICS = [
    "Product Recommendation / Flavor Help",
    "Order Status / Shipping Inquiries",
    "Bulk & Wholesale Orders",
    "Corporate Gifting",
    "Press & Collaborations",
    "Other Questions",
] as const;

export const contactInquirySchema = z.object({
    first_name: z.string().trim().min(1, "First name is required").max(100),
    last_name: z.string().trim().min(1, "Last name is required").max(100),
    email: z.email("Enter a valid email"),
    phone: z.string().trim().max(25).default(""),
    topic: z.enum(INQUIRY_TOPICS),
    message: z.string().trim().min(1, "Message is required").max(5000),
});

export type ContactInquiryValues = z.infer<typeof contactInquirySchema>;

export const inquiryPatchSchema = z.object({
    status: z.enum(["NEW", "RESOLVED"]),
});
