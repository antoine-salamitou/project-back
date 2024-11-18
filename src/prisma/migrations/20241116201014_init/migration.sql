-- AlterTable
ALTER TABLE "users" ADD COLUMN     "about_me" TEXT,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zip" TEXT;
