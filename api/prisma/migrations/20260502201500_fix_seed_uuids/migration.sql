-- Original SQL was buggy: it rewrote child FKs (projects.clientId) before
-- updating the parent (clients.id), violating projects_clientId_fkey. The
-- same goal — rewriting non-RFC-4122 seed UUIDs so class-validator's
-- @IsUUID() accepts them — is now handled correctly by
-- 20260502230000_heal_non_rfc4122_uuids, which relies on ON UPDATE CASCADE.
--
-- Intentionally a no-op so prod databases stuck on this failed migration
-- can move past it (after `prisma migrate resolve --rolled-back`).
SELECT 1;
