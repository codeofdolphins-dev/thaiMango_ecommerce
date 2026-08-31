-- Allow a product to have multiple variants: the one-variant-per-product
-- constraint is dropped, replaced by uniqueness of label within a product.

-- DropIndex
DROP INDEX "ProductVariant_product_id_key";

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_product_id_label_key" ON "ProductVariant"("product_id", "label");
