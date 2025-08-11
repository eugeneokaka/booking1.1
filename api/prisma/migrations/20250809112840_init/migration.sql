-- DropForeignKey
ALTER TABLE "public"."Worker" DROP CONSTRAINT "Worker_serviceId_fkey";

-- AlterTable
ALTER TABLE "public"."Worker" ALTER COLUMN "serviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Worker" ADD CONSTRAINT "Worker_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
