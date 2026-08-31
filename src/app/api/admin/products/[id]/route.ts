import { prisma } from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponse, ApiError } from "@/helper/apiResponse";
import { requireAdmin } from "@/lib/adminAuth";
import { Prisma } from "@/generated/prisma/client";
import { productUpdateSchema, normalizeVariants } from "@/schemas/product.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: { select: { id: true, slug: true, name_en: true } },
                productVariant: { orderBy: { position: "asc" } },
            },
        });

        if (!product) {
            const apiError = new ApiError(404, "Product not found");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const apiResponse = new ApiResponse(200, product, "Product fetched successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin product fetch failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

export async function PATCH(req: Request, { params }: Params) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        const body = await req.json();
        const parsed = productUpdateSchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = z.flattenError(parsed.error).fieldErrors;
            const errors = Object.entries(fieldErrors).flatMap(([field, messages]) =>
                (messages ?? []).map((message) => `${field}: ${message}`)
            );
            const apiError = new ApiError(400, "Validation failed", errors);
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { variants, category_id, ...productData } = parsed.data;

        /* Uniqueness checks scoped to other products, so a clear 409 comes back
           instead of an opaque Prisma constraint error. */
        if (productData.slug) {
            const slugTaken = await prisma.product.findFirst({
                where: { slug: productData.slug, id: { not: id } },
            });
            if (slugTaken) {
                const apiError = new ApiError(409, "A product with this slug already exists");
                return NextResponse.json(apiError, { status: apiError.statusCode });
            }
        }

        let variantWrites: Prisma.ProductVariantUpdateManyWithoutProductNestedInput | undefined;

        if (variants) {
            const skuTaken = await prisma.productVariant.findFirst({
                where: { sku: { in: variants.map((v) => v.sku) }, product_id: { not: id } },
            });
            if (skuTaken) {
                const apiError = new ApiError(
                    409,
                    `SKU "${skuTaken.sku}" is already used by another product`
                );
                return NextResponse.json(apiError, { status: apiError.statusCode });
            }

            /* Diff the incoming set against what's stored: rows carrying an id are
               updated, new rows are created, and anything missing is removed. */
            const existing = await prisma.productVariant.findMany({
                where: { product_id: id },
                select: { id: true },
            });
            const incoming = normalizeVariants(variants);
            const keptIds = new Set(
                incoming.map((v) => v.id).filter((vid): vid is number => typeof vid === "number")
            );
            const removedIds = existing
                .map((v) => v.id)
                .filter((existingId) => !keptIds.has(existingId));

            variantWrites = {
                ...(removedIds.length > 0
                    ? { deleteMany: { id: { in: removedIds } } }
                    : {}),
                update: incoming
                    .map((v, i) => ({ v, i }))
                    .filter(({ v }) => typeof v.id === "number")
                    .map(({ v, i }) => {
                        const { id: variantId, ...data } = v;
                        return {
                            where: { id: variantId as number },
                            data: { ...data, position: i },
                        };
                    }),
                create: incoming
                    .map((v, i) => ({ v, i }))
                    .filter(({ v }) => typeof v.id !== "number")
                    .map(({ v, i }) => {
                        const { id: _id, ...data } = v;
                        return { ...data, position: i };
                    }),
            };
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...productData,
                ...(category_id !== undefined
                    ? { category: { connect: { id: category_id } } }
                    : {}),
                ...(variantWrites ? { productVariant: variantWrites } : {}),
            },
            include: {
                category: { select: { id: true, slug: true, name_en: true } },
                productVariant: { orderBy: { position: "asc" } },
            },
        });

        const apiResponse = new ApiResponse(200, product, "Product updated successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin product update failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    try {
        const session = await requireAdmin();
        if (!session) {
            const apiError = new ApiError(403, "Admin access required");
            return NextResponse.json(apiError, { status: apiError.statusCode });
        }

        const { id } = await params;
        await prisma.product.delete({ where: { id } });

        const apiResponse = new ApiResponse(200, null, "Product deleted successfully");
        return NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    } catch (error) {
        console.error("Admin product delete failed:", error);
        const apiError = new ApiError(500, "Something went wrong. Please try again.");
        return NextResponse.json(apiError, { status: apiError.statusCode });
    }
}
