ALTER TYPE "public"."estado_plan" ADD VALUE 'atrasado';--> statement-breakpoint
ALTER TABLE "planes" ADD COLUMN "fecha_ultimo_pago" timestamp;