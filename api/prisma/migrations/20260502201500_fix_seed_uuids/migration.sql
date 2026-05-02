-- Replace non-RFC-4122 seed UUIDs (zeroed pattern) with real v4 UUIDs.
-- The seed previously hardcoded `00000000-0000-0000-0000-000000000001`
-- (Maison Arielle client) and `00000000-0000-0000-0000-000000000101`
-- (its sample project). class-validator's `IsUUID()` rejects those because
-- the version/variant nibbles must be 1-5 / 8-b respectively, breaking
-- POST /projects { clientId: ... } from the UI.
DO $$
DECLARE
  new_client_id  uuid := gen_random_uuid();
  new_project_id uuid := gen_random_uuid();
BEGIN
  IF EXISTS (SELECT 1 FROM clients WHERE id = '00000000-0000-0000-0000-000000000001') THEN
    UPDATE projects     SET "clientId" = new_client_id WHERE "clientId" = '00000000-0000-0000-0000-000000000001';
    UPDATE fin_records  SET "clientId" = new_client_id WHERE "clientId" = '00000000-0000-0000-0000-000000000001';
    UPDATE file_objects SET "clientId" = new_client_id WHERE "clientId" = '00000000-0000-0000-0000-000000000001';
    UPDATE activity_log SET "entityId" = new_client_id::text
      WHERE "entityType" = 'Client' AND "entityId" = '00000000-0000-0000-0000-000000000001';
    UPDATE clients SET id = new_client_id WHERE id = '00000000-0000-0000-0000-000000000001';
  END IF;

  IF EXISTS (SELECT 1 FROM projects WHERE id = '00000000-0000-0000-0000-000000000101') THEN
    UPDATE project_members SET "projectId" = new_project_id WHERE "projectId" = '00000000-0000-0000-0000-000000000101';
    UPDATE project_tasks   SET "projectId" = new_project_id WHERE "projectId" = '00000000-0000-0000-0000-000000000101';
    UPDATE fin_records     SET "projectId" = new_project_id WHERE "projectId" = '00000000-0000-0000-0000-000000000101';
    UPDATE file_objects    SET "projectId" = new_project_id WHERE "projectId" = '00000000-0000-0000-0000-000000000101';
    UPDATE activity_log    SET "entityId" = new_project_id::text
      WHERE "entityType" = 'Project' AND "entityId" = '00000000-0000-0000-0000-000000000101';
    UPDATE projects SET id = new_project_id WHERE id = '00000000-0000-0000-0000-000000000101';
  END IF;
END $$;
