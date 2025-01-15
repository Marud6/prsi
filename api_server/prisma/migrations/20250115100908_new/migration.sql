/*
  Warnings:

  - You are about to drop the `decks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `decks`;

-- CreateTable
CREATE TABLE `Card` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageSrc` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Card_imageSrc_key`(`imageSrc`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Deck` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeckCard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `deckId` INTEGER NOT NULL,
    `cardId` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,

    UNIQUE INDEX `DeckCard_deckId_order_key`(`deckId`, `order`),
    UNIQUE INDEX `DeckCard_deckId_cardId_key`(`deckId`, `cardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DeckCard` ADD CONSTRAINT `DeckCard_deckId_fkey` FOREIGN KEY (`deckId`) REFERENCES `Deck`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeckCard` ADD CONSTRAINT `DeckCard_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `Card`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
