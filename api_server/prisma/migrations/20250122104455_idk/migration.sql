/*
  Warnings:

  - The primary key for the `rooms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `rooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `rooms` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`room_code`);
