-- Corrige outfit_items para que borrar una prenda no rompa el historial de
-- outfits (punto 38 del brief): wardrobeItemId pasa a ser opcional con
-- ON DELETE SET NULL (antes era CASCADE, que borraba la fila entera) y se
-- agrega garmentSnapshot para poder seguir mostrando qué era la prenda.

ALTER TABLE "outfit_items" DROP CONSTRAINT "outfit_items_wardrobeItemId_fkey";
ALTER TABLE "outfit_items" ALTER COLUMN "wardrobeItemId" DROP NOT NULL;
ALTER TABLE "outfit_items" ADD COLUMN "garmentSnapshot" JSONB;

-- Backfill de filas existentes (no debería haber en un repo nuevo, pero
-- deja la migración correcta si se corre sobre datos ya cargados).
UPDATE "outfit_items" oi
SET "garmentSnapshot" = jsonb_build_object(
  'category', wi."category",
  'primaryColor', wi."primaryColor",
  'name', wi."name"
)
FROM "wardrobe_items" wi
WHERE oi."wardrobeItemId" = wi."id" AND oi."garmentSnapshot" IS NULL;

ALTER TABLE "outfit_items" ALTER COLUMN "garmentSnapshot" SET NOT NULL;

ALTER TABLE "outfit_items" ADD CONSTRAINT "outfit_items_wardrobeItemId_fkey"
  FOREIGN KEY ("wardrobeItemId") REFERENCES "wardrobe_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
