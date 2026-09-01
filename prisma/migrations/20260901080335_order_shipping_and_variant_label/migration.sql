/*
  Warnings:

  - Added the required column `ship_city` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ship_line1` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ship_name` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ship_phone` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ship_pincode` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ship_state` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "charge_currency" TEXT NOT NULL DEFAULT 'THB',
ADD COLUMN     "charge_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "payment_ref" TEXT,
ADD COLUMN     "ship_city" TEXT NOT NULL,
ADD COLUMN     "ship_country" TEXT NOT NULL DEFAULT 'India',
ADD COLUMN     "ship_line1" TEXT NOT NULL,
ADD COLUMN     "ship_name" TEXT NOT NULL,
ADD COLUMN     "ship_phone" TEXT NOT NULL,
ADD COLUMN     "ship_pincode" TEXT NOT NULL,
ADD COLUMN     "ship_state" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "variant_label" TEXT;
