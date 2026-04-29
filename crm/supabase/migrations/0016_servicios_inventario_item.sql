ALTER TABLE "servicios" ADD COLUMN IF NOT EXISTS "inventario_item_id" uuid REFERENCES "inventario"("id");
