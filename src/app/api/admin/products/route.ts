import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import { productSchema, normalizeVariants } from "@/schemas/product.schema";

export async function GET() {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const products = await prisma.product.findMany({
            orderBy: { created_at: "desc" },
            include: {
                category: { select: { id: true, slug: true, name_en: true } },
                productVariant: { orderBy: { position: "asc" } },
            },
        });

        const apiResponse = new ApiResponse(200, products, "Products fetched successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin products fetch failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

export async function POST(req: Request) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const body = await req.json();
        const parsed = productSchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { variants, ...productData } = parsed.data;

        const slugTaken = await prisma.product.findUnique({ where: { slug: productData.slug } });
        if (slugTaken) {
            const apiError = new ApiError(409, "A product with this slug already exists");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const skuTaken = await prisma.productVariant.findFirst({
            where: { sku: { in: variants.map((v) => v.sku) } },
        });
        if (skuTaken) {
            const apiError = new ApiError(
                409,
                `SKU "${skuTaken.sku}" is already used by another product`
            );
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const product = await prisma.product.create({
            data: {
                ...productData,
                productVariant: {
                    create: normalizeVariants(variants).map(({ id: _id, ...v }, i) => ({
                        ...v,
                        position: i,
                    })),
                },
            },
            include: {
                category: { select: { id: true, slug: true, name_en: true } },
                productVariant: { orderBy: { position: "asc" } },
            },
        });

        const apiResponse = new ApiResponse(201, product, "Product created successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin product create failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
