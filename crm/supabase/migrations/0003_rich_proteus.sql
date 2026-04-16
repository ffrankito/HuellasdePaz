CREATE TABLE "configuracion_general" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clave" text NOT NULL,
	"valores" jsonb NOT NULL,
	"descripcion" text,
	"actualizado_en" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "configuracion_general_clave_unique" UNIQUE("clave")
);
