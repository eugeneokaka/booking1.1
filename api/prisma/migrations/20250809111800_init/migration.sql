/*
  Warnings:

  - You are about to drop the column `workerId` on the `TimeSlot` table. All the data in the column will be lost.
  - Added the required column `workerId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."TimeSlot" DROP CONSTRAINT "TimeSlot_workerId_fkey";

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "workerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."TimeSlot" DROP COLUMN "workerId";

-- AlterTable
ALTER TABLE "public"."Worker" ADD COLUMN     "serviceId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Worker" ADD CONSTRAINT "Worker_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
