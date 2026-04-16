CREATE TABLE "lead_interacciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"usuario_id" uuid,
	"tipo" text NOT NULL,
	"descripcion" text NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "primer_respuesta_en" timestamp;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "ultima_interaccion_en" timestamp;--> statement-breakpoint
ALTER TABLE "lead_interacciones" ADD CONSTRAINT "lead_interacciones_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_interacciones" ADD CONSTRAINT "lead_interacciones_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;