ALTER TABLE "clientes" ADD COLUMN "auth_user_id" text;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_auth_user_id_unique" UNIQUE("auth_user_id");