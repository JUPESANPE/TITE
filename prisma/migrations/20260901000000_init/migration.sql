-- TITE — migración inicial (P0)
-- Generada a mano a partir de prisma/schema.prisma y validada con psql
-- contra un Postgres 16 local (ver ENVIRONMENT.md). Al correr
-- `prisma migrate dev` con acceso a npm, Prisma reconocerá este historial.

-- Enums -----------------------------------------------------------------

CREATE TYPE "garment_category" AS ENUM ('REMERAS','CAMISAS','BUZOS','SWEATERS','CAMPERAS','PANTALONES','SHORTS','VESTIDOS','FALDAS','ZAPATILLAS','ZAPATOS','ACCESORIOS','OTROS');
CREATE TYPE "occasion" AS ENUM ('CASUAL','COMODO','FORMAL','ENTRENAMIENTO','SALIR');
CREATE TYPE "outfit_status" AS ENUM ('GENERATED','SELECTED','REJECTED');
CREATE TYPE "outfit_item_role" AS ENUM ('TOP','BOTTOM','FOOTWEAR','OUTERWEAR','ACCESSORY','DRESS');
CREATE TYPE "feedback_rating" AS ENUM ('LOVE','GOOD','NEUTRAL','DISLIKE');
CREATE TYPE "points_action_type" AS ENUM ('ACCOUNT_CREATED','ONBOARDING_COMPLETED','PROFILE_COMPLETED','STYLE_PREFERENCES_SET','SIZES_SET','MICRO_QUESTION_ANSWERED','FIRST_GARMENT_ADDED','GARMENT_ADDED','CATEGORY_25_COMPLETED','CATEGORY_50_COMPLETED','CATEGORY_75_COMPLETED','WARDROBE_100_COMPLETED','OUTFIT_GENERATED','OUTFIT_SELECTED','OUTFIT_FEEDBACK_GIVEN','STREAK_MILESTONE','MANUAL_ADJUSTMENT');
CREATE TYPE "points_entry_status" AS ENUM ('CONFIRMED','REVERSED');
CREATE TYPE "consent_type" AS ENUM ('LOCATION','ANALYTICS','PERSONALIZATION','MARKETING','DATA_SHARING');

-- Tables ------------------------------------------------------------------

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "stylePreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "favoriteColors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avoidedColors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "favoriteBrands" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sizes" JSONB,
    "fitPreference" TEXT,
    "budgetLevel" TEXT,
    "comfortVsAesthetic" INTEGER,
    "onboardingCompletedAt" TIMESTAMP(3),
    "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

CREATE TABLE "wardrobe_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "name" TEXT,
    "category" "garment_category" NOT NULL,
    "subcategory" TEXT,
    "primaryColor" TEXT,
    "secondaryColors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "brand" TEXT,
    "warmth" INTEGER,
    "formality" INTEGER,
    "fit" TEXT,
    "styles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "season" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "material" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION,
    "purchaseDate" TIMESTAMP(3),
    "lastWornAt" TIMESTAMP(3),
    "aiClassified" BOOLEAN NOT NULL DEFAULT false,
    "aiConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "wardrobe_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "wardrobe_items_userId_category_idx" ON "wardrobe_items"("userId", "category");
CREATE INDEX "wardrobe_items_userId_favorite_idx" ON "wardrobe_items"("userId", "favorite");

CREATE TABLE "weather_snapshots" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "temp" DOUBLE PRECISION NOT NULL,
    "feelsLike" DOUBLE PRECISION NOT NULL,
    "tempMin" DOUBLE PRECISION NOT NULL,
    "tempMax" DOUBLE PRECISION NOT NULL,
    "rainChance" INTEGER NOT NULL,
    "windSpeed" DOUBLE PRECISION NOT NULL,
    "condition" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'open-meteo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "weather_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "outfits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "occasion" "occasion" NOT NULL,
    "weatherSnapshotId" TEXT,
    "status" "outfit_status" NOT NULL DEFAULT 'GENERATED',
    "explanation" TEXT,
    "generationGroupId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selectedAt" TIMESTAMP(3),
    CONSTRAINT "outfits_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "outfits_userId_createdAt_idx" ON "outfits"("userId", "createdAt");
CREATE INDEX "outfits_userId_generationGroupId_idx" ON "outfits"("userId", "generationGroupId");

CREATE TABLE "outfit_items" (
    "id" TEXT NOT NULL,
    "outfitId" TEXT NOT NULL,
    "wardrobeItemId" TEXT NOT NULL,
    "role" "outfit_item_role" NOT NULL,
    CONSTRAINT "outfit_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "outfit_items_outfitId_wardrobeItemId_key" ON "outfit_items"("outfitId", "wardrobeItemId");

CREATE TABLE "outfit_feedback" (
    "id" TEXT NOT NULL,
    "outfitId" TEXT NOT NULL,
    "rating" "feedback_rating" NOT NULL,
    "comfortable" BOOLEAN,
    "matchedStyle" BOOLEAN,
    "wouldRepeat" BOOLEAN,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "outfit_feedback_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "outfit_feedback_outfitId_key" ON "outfit_feedback"("outfitId");

CREATE TABLE "favorite_outfits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outfitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "favorite_outfits_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "favorite_outfits_userId_outfitId_key" ON "favorite_outfits"("userId", "outfitId");

CREATE TABLE "streaks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "longestCount" INTEGER NOT NULL DEFAULT 0,
    "lastActionDate" DATE,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "streaks_userId_key" ON "streaks"("userId");

CREATE TABLE "points_ledger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "actionType" "points_action_type" NOT NULL,
    "source" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "metadata" JSONB,
    "status" "points_entry_status" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "points_ledger_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "points_ledger_userId_actionType_referenceId_key" ON "points_ledger"("userId", "actionType", "referenceId");
CREATE INDEX "points_ledger_userId_createdAt_idx" ON "points_ledger"("userId", "createdAt");

CREATE TABLE "points_balances" (
    "userId" TEXT NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "points_balances_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "analytics_events_name_createdAt_idx" ON "analytics_events"("name", "createdAt");
CREATE INDEX "analytics_events_userId_createdAt_idx" ON "analytics_events"("userId", "createdAt");

CREATE TABLE "user_consents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "consent_type" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_consents_userId_type_key" ON "user_consents"("userId", "type");

-- Foreign keys --------------------------------------------------------------

ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wardrobe_items" ADD CONSTRAINT "wardrobe_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outfits" ADD CONSTRAINT "outfits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outfits" ADD CONSTRAINT "outfits_weatherSnapshotId_fkey" FOREIGN KEY ("weatherSnapshotId") REFERENCES "weather_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "outfit_items" ADD CONSTRAINT "outfit_items_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outfit_items" ADD CONSTRAINT "outfit_items_wardrobeItemId_fkey" FOREIGN KEY ("wardrobeItemId") REFERENCES "wardrobe_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outfit_feedback" ADD CONSTRAINT "outfit_feedback_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "favorite_outfits" ADD CONSTRAINT "favorite_outfits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "favorite_outfits" ADD CONSTRAINT "favorite_outfits_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "points_ledger" ADD CONSTRAINT "points_ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "points_balances" ADD CONSTRAINT "points_balances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
