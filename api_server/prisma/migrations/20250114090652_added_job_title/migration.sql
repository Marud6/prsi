/*
  Warnings:

  - The primary key for the `decks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `decks` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `decks` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[card_id]` on the table `decks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order]` on the table `decks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `card_id` to the `decks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `game_id` to the `decks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `decks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `decks` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `value`,
    ADD COLUMN `card_id` INTEGER NOT NULL,
    ADD COLUMN `game_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `order` INTEGER NOT NULL,
    ADD COLUMN `used` BOOLEAN NOT NULL DEFAULT false,
    ADD PRIMARY KEY (`game_id`);

-- CreateIndex
CREATE UNIQUE INDEX `decks_card_id_key` ON `decks`(`card_id`);

-- CreateIndex
CREATE UNIQUE INDEX `decks_order_key` ON `decks`(`order`);
