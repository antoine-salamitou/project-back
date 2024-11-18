-- CreateTable
CREATE TABLE "onboarding_components" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "page_number" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "onboarding_components_pkey" PRIMARY KEY ("id")
);
