CREATE TABLE "comunicaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"servicio_id" uuid,
	"template_id" uuid,
	"canal" text NOT NULL,
	"mensaje" text NOT NULL,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comunicaciones" ADD CONSTRAINT "comunicaciones_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comunicaciones" ADD CONSTRAINT "comunicaciones_servicio_id_servicios_id_fk" FOREIGN KEY ("servicio_id") REFERENCES "public"."servicios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comunicaciones" ADD CONSTRAINT "comunicaciones_template_id_templates_msg_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates_msg"("id") ON DELETE no action ON UPDATE no action;