ALTER TABLE convenios ADD COLUMN IF NOT EXISTS token_portal uuid DEFAULT gen_random_uuid();
ALTER TABLE convenios ADD COLUMN IF NOT EXISTS portal_activo boolean NOT NULL DEFAULT false;
UPDATE convenios SET token_portal = gen_random_uuid() WHERE token_portal IS NULL;
