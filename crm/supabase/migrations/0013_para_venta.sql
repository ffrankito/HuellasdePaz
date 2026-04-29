-- Migración 0013: agrega para_venta a inventario
-- Aplicar manualmente con postgres.js (no usar drizzle-kit push)

ALTER TABLE inventario ADD COLUMN IF NOT EXISTS para_venta boolean NOT NULL DEFAULT false;

-- Marcar como "para venta" los items que ya se usaban para eso (urnas, cajas, accesorios)
UPDATE inventario SET para_venta = true WHERE categoria IN ('urna', 'caja', 'accesorio');
