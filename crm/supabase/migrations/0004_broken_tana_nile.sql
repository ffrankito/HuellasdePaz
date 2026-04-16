ALTER TABLE "clientes" ADD COLUMN "token_portal" text;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_token_portal_unique" UNIQUE("token_portal");