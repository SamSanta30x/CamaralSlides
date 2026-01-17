-- Script para convertir sam@camaral.ai a Organización usando la tabla organizations
-- Ejecutar en Supabase Dashboard > SQL Editor

-- 1. Verificar si el usuario existe
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'sam@camaral.ai';

-- 2. Verificar si ya tiene una organización
SELECT 
  o.id,
  o.owner_id,
  o.name,
  o.is_organization,
  u.email
FROM organizations o
JOIN auth.users u ON o.owner_id = u.id
WHERE u.email = 'sam@camaral.ai';

-- 3. Si NO existe, crear la organización (usar el ID del usuario de la query #1)
-- REEMPLAZA 'USER_ID_AQUI' con el ID real del usuario
INSERT INTO organizations (owner_id, name, is_organization)
SELECT 
  id,
  'Camaral',
  true
FROM auth.users
WHERE email = 'sam@camaral.ai'
ON CONFLICT (owner_id) DO UPDATE
SET 
  name = 'Camaral',
  is_organization = true,
  updated_at = NOW();

-- 4. Verificar que se creó correctamente
SELECT 
  o.id as org_id,
  o.owner_id,
  o.name as org_name,
  o.is_organization,
  o.created_at,
  u.email as owner_email
FROM organizations o
JOIN auth.users u ON o.owner_id = u.id
WHERE u.email = 'sam@camaral.ai';

-- 5. Ver todas las organizaciones (para debug)
SELECT 
  o.id,
  o.name,
  o.is_organization,
  u.email as owner_email
FROM organizations o
JOIN auth.users u ON o.owner_id = u.id
ORDER BY o.created_at DESC;
