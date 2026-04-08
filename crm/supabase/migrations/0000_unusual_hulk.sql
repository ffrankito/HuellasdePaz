CREATE TYPE "public"."rol" AS ENUM('admin', 'contadora', 'televenta', 'transporte', 'cremacion', 'entrega');--> statement-breakpoint
CREATE TYPE "public"."estado_servicio" AS ENUM('ingresado', 'retiro_pendiente', 'en_transporte', 'recibido', 'en_cremacion', 'cremado', 'listo_entrega', 'entregado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."tipo_servicio" AS ENUM('cremacion_individual', 'cremacion_comunitaria', 'entierro');--> statement-breakpoint
CREATE TYPE "public"."estado_plan" AS ENUM('activo', 'pausado', 'cancelado', 'utilizado');--> statement-breakpoint
CREATE TYPE "public"."estado_lead" AS ENUM('nuevo', 'contactado', 'interesado', 'cotizado', 'convertido', 'perdido');--> statement-breakpoint
CREATE TYPE "public"."categoria_inventario" AS ENUM('urna', 'bolsa', 'caja', 'accesorio', 'insumo', 'otro');--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"rol" "rol" NOT NULL,
	"activo" text DEFAULT 'true' NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"apellido" text NOT NULL,
	"email" text,
	"telefono" text NOT NULL,
	"direccion" text,
	"localidad" text,
	"provincia" text DEFAULT 'Santa Fe',
	"origen" text,
	"notas" text,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mascotas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"especie" text NOT NULL,
	"raza" text,
	"color" text,
	"fecha_nacimiento" date,
	"fecha_fallecimiento" date,
	"foto" text,
	"notas" text,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "servicios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"mascota_id" uuid NOT NULL,
	"tipo" "tipo_servicio" NOT NULL,
	"estado" "estado_servicio" DEFAULT 'ingresado' NOT NULL,
	"precio" numeric(10, 2),
	"descuento" numeric(10, 2) DEFAULT '0',
	"responsable_transporte_id" uuid,
	"responsable_cremacion_id" uuid,
	"responsable_entrega_id" uuid,
	"fecha_retiro" timestamp,
	"fecha_cremacion" timestamp,
	"fecha_entrega" timestamp,
	"notas" text,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"mascota_id" uuid,
	"plan_config_id" uuid NOT NULL,
	"estado" "estado_plan" DEFAULT 'activo' NOT NULL,
	"cuota_mensual" numeric(10, 2) NOT NULL,
	"cuotas_pagadas" integer DEFAULT 0 NOT NULL,
	"cuotas_totales" integer NOT NULL,
	"porcentaje_cobertura" numeric(5, 2) DEFAULT '0',
	"fecha_inicio" timestamp DEFAULT now() NOT NULL,
	"fecha_vencimiento" timestamp,
	"notas" text,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"telefono" text NOT NULL,
	"email" text,
	"mensaje" text,
	"origen" text DEFAULT 'landing',
	"estado" "estado_lead" DEFAULT 'nuevo' NOT NULL,
	"asignado_a_id" uuid,
	"notas" text,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"categoria" "categoria_inventario" NOT NULL,
	"stock_actual" integer DEFAULT 0 NOT NULL,
	"stock_minimo" integer DEFAULT 5 NOT NULL,
	"precio_unitario" numeric(10, 2),
	"proveedor" text,
	"notas" text,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planes_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"cuota_mensual" numeric(10, 2) NOT NULL,
	"cuotas_totales" integer NOT NULL,
	"beneficios" jsonb,
	"cobertura_escalonada" jsonb,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates_msg" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"canal" text NOT NULL,
	"evento" text NOT NULL,
	"contenido" text NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mascotas" ADD CONSTRAINT "mascotas_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_mascota_id_mascotas_id_fk" FOREIGN KEY ("mascota_id") REFERENCES "public"."mascotas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_responsable_transporte_id_usuarios_id_fk" FOREIGN KEY ("responsable_transporte_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_responsable_cremacion_id_usuarios_id_fk" FOREIGN KEY ("responsable_cremacion_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_responsable_entrega_id_usuarios_id_fk" FOREIGN KEY ("responsable_entrega_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planes" ADD CONSTRAINT "planes_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planes" ADD CONSTRAINT "planes_mascota_id_mascotas_id_fk" FOREIGN KEY ("mascota_id") REFERENCES "public"."mascotas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_asignado_a_id_usuarios_id_fk" FOREIGN KEY ("asignado_a_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;