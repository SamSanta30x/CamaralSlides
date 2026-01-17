-- Limpiar invitaciones duplicadas o antiguas
-- Ejecutar en Supabase SQL Editor

-- 1. Ver todas las invitaciones actuales
SELECT 
  id,
  organization_name,
  invited_email,
  status,
  created_at,
  expires_at
FROM team_invitations
ORDER BY created_at DESC;

-- 2. Eliminar invitaciones pendientes que ya expiraron
DELETE FROM team_invitations
WHERE status = 'pending'
AND expires_at < NOW();

-- 3. Si necesitas eliminar una invitación específica (reemplaza con el email correcto)
-- DELETE FROM team_invitations
-- WHERE invited_email = 'email@example.com'
-- AND status = 'pending';

-- 4. O eliminar TODAS las invitaciones pendientes para reiniciar
-- DELETE FROM team_invitations WHERE status = 'pending';

-- 5. Verificar después de limpiar
SELECT 
  id,
  organization_name,
  invited_email,
  status,
  created_at
FROM team_invitations
ORDER BY created_at DESC;
