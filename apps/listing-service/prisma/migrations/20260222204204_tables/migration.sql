/*
  Warnings:

  - You are about to drop the column `toolId` on the `images` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tools` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerDay` on the `tools` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tools` table. All the data in the column will be lost.
  - You are about to drop the `_CategoryToTool` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tool_id` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_per_day` to the `tools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tools` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToTool" DROP CONSTRAINT "_CategoryToTool_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToTool" DROP CONSTRAINT "_CategoryToTool_B_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_toolId_fkey";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "images" DROP COLUMN "toolId",
ADD COLUMN     "tool_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tools" DROP COLUMN "createdAt",
DROP COLUMN "pricePerDay",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "price_per_day" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "_CategoryToTool";

-- CreateTable
CREATE TABLE "tool_categories" (
    "tool_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "tool_categories_pkey" PRIMARY KEY ("tool_id","category_id")
);

-- AddForeignKey
ALTER TABLE "tool_categories" ADD CONSTRAINT "tool_categories_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_categories" ADD CONSTRAINT "tool_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
