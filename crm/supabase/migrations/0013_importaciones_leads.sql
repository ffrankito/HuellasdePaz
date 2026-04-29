-- Tabla para registrar cada importación masiva de leads
create table if not exists importaciones_leads (
  id uuid primary key default gen_random_uuid(),
  nombre_archivo text not null,
  total_importados integer not null default 0,
  total_duplicados integer not null default 0,
  total_errores integer not null default 0,
  creado_en timestamptz not null default now()
);

-- Vincular leads a su importación de origen
alter table leads
  add column if not exists importacion_id uuid references importaciones_leads(id) on delete set null;
