CREATE TYPE "public"."estado_convenio" AS ENUM('sin_convenio', 'en_negociacion', 'activo', 'pausado');--> statement-breakpoint
ALTER TYPE "public"."rol" ADD VALUE 'manager' BEFORE 'contadora';--> statement-breakpoint
CREATE TABLE "veterinarias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"direccion" text,
	"telefono" text,
	"email" text,
	"responsable" text,
	"instagram" text,
	"web" text,
	"estado_convenio" "estado_convenio" DEFAULT 'sin_convenio' NOT NULL,
	"descuento_porcentaje" numeric(5, 2) DEFAULT '0',
	"beneficio_descripcion" text,
	"fecha_inicio_convenio" timestamp,
	"fecha_vencimiento_convenio" timestamp,
	"notas" text,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "usuarios" ALTER COLUMN "rol" SET DEFAULT 'televenta';--> statement-breakpoint
ALTER TABLE "servicios" ALTER COLUMN "mascota_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "permisos" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "veterinaria_id" uuid;--> statement-breakpoint
ALTER TABLE "servicios" ADD COLUMN "numero" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "planes" ADD COLUMN "numero" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "planes" ADD COLUMN "mascota_adicional" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "veterinaria_id" uuid;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_veterinaria_id_veterinarias_id_fk" FOREIGN KEY ("veterinaria_id") REFERENCES "public"."veterinarias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_veterinaria_id_veterinarias_id_fk" FOREIGN KEY ("veterinaria_id") REFERENCES "public"."veterinarias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" DROP COLUMN "activo";--> statement-breakpoint
ALTER TABLE "planes" DROP COLUMN "fecha_inicio";--> statement-breakpoint
ALTER TABLE "planes" DROP COLUMN "fecha_vencimiento";