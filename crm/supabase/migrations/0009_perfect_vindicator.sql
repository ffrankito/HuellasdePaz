CREATE TYPE "public"."tipo_convenio" AS ENUM('veterinaria', 'petshop', 'refugio', 'clinica', 'otro');--> statement-breakpoint
ALTER TABLE "veterinarias" RENAME TO "convenios";--> statement-breakpoint
ALTER TABLE "clientes" DROP CONSTRAINT "clientes_veterinaria_id_veterinarias_id_fk";
--> statement-breakpoint
ALTER TABLE "leads" DROP CONSTRAINT "leads_veterinaria_id_veterinarias_id_fk";
--> statement-breakpoint
ALTER TABLE "convenios" ADD COLUMN "tipo" "tipo_convenio" DEFAULT 'veterinaria' NOT NULL;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_veterinaria_id_convenios_id_fk" FOREIGN KEY ("veterinaria_id") REFERENCES "public"."convenios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_veterinaria_id_convenios_id_fk" FOREIGN KEY ("veterinaria_id") REFERENCES "public"."convenios"("id") ON DELETE no action ON UPDATE no action;