-- Script para verificar y actualizar la metadata del usuario sam@camaral.ai
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar el usuario actual
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at
FROM auth.users
WHERE email = 'sam@camaral.ai';

-- 2. Actualizar metadata para que sea organización
-- NOTA: Este script debe ejecutarse en Supabase Dashboard SQL Editor
-- La metadata se actualiza normalmente desde el cliente con auth.updateUser()
-- pero podemos verificarla aquí

-- Para actualizar directamente (solo usar si es necesario):
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_set(
--   COALESCE(raw_user_meta_data, '{}'::jsonb),
--   '{is_organization}',
--   'true'::jsonb
-- )
-- WHERE email = 'sam@camaral.ai';

-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_set(
--   raw_user_meta_data,
--   '{organization_name}',
--   '"Camaral"'::jsonb
-- )
-- WHERE email = 'sam@camaral.ai';

-- 3. Verificar que se actualizó correctamente
SELECT 
  email,
  raw_user_meta_data->>'is_organization' as is_org,
  raw_user_meta_data->>'organization_name' as org_name,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE email = 'sam@camaral.ai';
