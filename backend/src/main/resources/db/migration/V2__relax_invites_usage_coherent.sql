-- invites_usage_coherent enforced (used_at IS NULL) = (used_by IS NULL), but
-- invites.used_by references users(id) ON DELETE SET NULL: hard-deleting a
-- user who consumed an invite sets used_by to NULL while used_at stays set,
-- violating the old check. used_at alone is the source of truth for "was
-- this invite used" — used_by is only "by whom, if we still know".
ALTER TABLE invites DROP CONSTRAINT invites_usage_coherent;

ALTER TABLE invites ADD CONSTRAINT invites_usage_coherent
  CHECK (used_by IS NULL OR used_at IS NOT NULL);
