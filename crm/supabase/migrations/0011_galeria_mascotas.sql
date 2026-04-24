ALTER TABLE "mascotas" ADD COLUMN IF NOT EXISTS "galeria" jsonb DEFAULT '[]'::jsonb;
