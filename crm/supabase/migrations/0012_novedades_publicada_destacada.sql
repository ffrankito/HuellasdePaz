ALTER TABLE "noticias_cementerio" ADD COLUMN IF NOT EXISTS "publicada" boolean NOT NULL DEFAULT true;
ALTER TABLE "noticias_cementerio" ADD COLUMN IF NOT EXISTS "destacada" boolean NOT NULL DEFAULT false;
