CREATE TABLE IF NOT EXISTS "asistente_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuario_id" uuid REFERENCES "usuarios"("id") ON DELETE SET NULL,
  "rol" text,
  "pregunta" text NOT NULL,
  "screen_context" text,
  "tokens_input" integer DEFAULT 0,
  "tokens_output" integer DEFAULT 0,
  "creado_en" timestamp DEFAULT now() NOT NULL
);
