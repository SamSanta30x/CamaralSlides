-- Script para ACTUALIZAR DEFINITIVAMENTE la cuenta sam@camaral.ai como Organización
-- Ejecutar en Supabase Dashboard > SQL Editor

-- 1. Ver estado actual
SELECT 
  email,
  raw_user_meta_data,
  raw_user_meta_data->>'is_organization' as is_org_before,
  raw_user_meta_data->>'organization_name' as org_name_before
FROM auth.users
WHERE email = 'sam@camaral.ai';

-- 2. Actualizar is_organization a TRUE (boolean)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{is_organization}',
  'true'::jsonb,
  true
)
WHERE email = 'sam@camaral.ai';

-- 3. Actualizar organization_name
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{organization_name}',
  '"Camaral"'::jsonb,
  true
)
WHERE email = 'sam@camaral.ai';

-- 4. Verificar que se actualizó correctamente
SELECT 
  email,
  raw_user_meta_data,
  raw_user_meta_data->>'is_organization' as is_org_after,
  raw_user_meta_data->>'organization_name' as org_name_after,
  (raw_user_meta_data->>'is_organization')::boolean as is_org_boolean
FROM auth.users
WHERE email = 'sam@camaral.ai';

-- 5. IMPORTANTE: Verificar el tipo de dato
SELECT 
  email,
  jsonb_typeof(raw_user_meta_data->'is_organization') as is_org_type,
  raw_user_meta_data->'is_organization' as is_org_raw_value
FROM auth.users
WHERE email = 'sam@camaral.ai';
