-- Apply after `prisma migrate` to enforce audit-log immutability at the database layer.
-- The API already avoids update/delete on activity_log; this trigger is the final guard.

CREATE OR REPLACE FUNCTION activity_log_block_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'activity_log rows are immutable (operation: %)', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_activity_log_no_update ON activity_log;
DROP TRIGGER IF EXISTS trg_activity_log_no_delete ON activity_log;

CREATE TRIGGER trg_activity_log_no_update
  BEFORE UPDATE ON activity_log
  FOR EACH ROW EXECUTE FUNCTION activity_log_block_mutation();

CREATE TRIGGER trg_activity_log_no_delete
  BEFORE DELETE ON activity_log
  FOR EACH ROW EXECUTE FUNCTION activity_log_block_mutation();
