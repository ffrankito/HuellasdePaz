-- Indexes for columns used in WHERE/ORDER BY in dashboard and list pages
CREATE INDEX IF NOT EXISTS idx_leads_estado        ON leads (estado);
CREATE INDEX IF NOT EXISTS idx_leads_estado_fecha  ON leads (estado, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_servicios_estado    ON servicios (estado);
CREATE INDEX IF NOT EXISTS idx_servicios_fecha     ON servicios (creado_en DESC);

-- Set a generous statement timeout at the database level (30 seconds).
-- Default in Supabase can be as low as 3-8 seconds depending on the role.
ALTER DATABASE postgres SET statement_timeout = '30000';
