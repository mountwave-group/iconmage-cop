-- Heals any client / project rows whose UUIDs are valid Postgres `uuid`
-- values but fail RFC-4122 v1-5 validation (class-validator's `@IsUUID()`).
-- The original seed wrote zero-pattern ids (e.g.
-- 00000000-0000-0000-0000-000000000001) where the version nibble is 0
-- (must be 1-5) and the variant nibble is 0 (must be 8/9/a/b). Postgres
-- accepts those as `uuid`, but the API rejects them at the validation
-- layer — so POST /projects { clientId } returns "clientId must be a UUID".
--
-- All FKs are `ON UPDATE CASCADE`, so a single UPDATE on the parent id
-- propagates to projects, fin_records, file_objects, project_members,
-- project_tasks. `activity_log.entityId` is a plain varchar (not an FK),
-- so it must be rewritten explicitly. Idempotent: a no-op on a clean DB.

DO $$
DECLARE
  rec     record;
  new_id  uuid;
  rfc4122 text :=
    '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
BEGIN
  -- ── Clients ────────────────────────────────────────────────────────────
  FOR rec IN
    SELECT id FROM clients WHERE id::text !~* rfc4122
  LOOP
    new_id := gen_random_uuid();
    UPDATE clients SET id = new_id WHERE id = rec.id;  -- cascades to children
    UPDATE activity_log
       SET "entityId" = new_id::text
     WHERE "entityType" = 'Client' AND "entityId" = rec.id::text;
  END LOOP;

  -- ── Projects ───────────────────────────────────────────────────────────
  FOR rec IN
    SELECT id FROM projects WHERE id::text !~* rfc4122
  LOOP
    new_id := gen_random_uuid();
    UPDATE projects SET id = new_id WHERE id = rec.id;  -- cascades to children
    UPDATE activity_log
       SET "entityId" = new_id::text
     WHERE "entityType" = 'Project' AND "entityId" = rec.id::text;
  END LOOP;
END $$;
