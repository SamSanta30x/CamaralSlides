# Sistema de Organizaciones - Documentación Final

## 📋 Arquitectura

### Base de Datos

```sql
-- Tabla principal de organizaciones
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) UNIQUE,
  name TEXT NOT NULL,
  is_organization BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de invitaciones
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES auth.users(id),
  organization_name TEXT NOT NULL,
  invited_email TEXT NOT NULL,
  invited_by_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'Member',
  status TEXT DEFAULT 'pending',
  invitation_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de miembros del equipo
CREATE TABLE team_members (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'Member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS habilitadas:
- Users can view their own organization
- Users can create/update their own organization
- Team members can view organization members
- Organization owners can manage team members

---

## 🔧 Funcionalidad Principal

### 1. Conversión a Organización

**Ubicación:** `app/settings/page.tsx` → `handleConvertToOrganization`

```typescript
// Crea un registro en la tabla organizations
await supabase.from('organizations').insert({
  owner_id: user.id,
  name: 'My Organization',
  is_organization: true
})
```

**Características:**
- Maneja duplicados (constraint violation)
- Actualiza estado local inmediatamente
- Muestra toast de confirmación

### 2. Carga de Organización

**Ubicación:** `app/settings/page.tsx` → `useEffect`

```typescript
// Lee desde la tabla organizations
const { data: orgData } = await supabase
  .from('organizations')
  .select('*')
  .eq('owner_id', user.id)
  .single()

if (orgData) {
  setIsOrganization(true)
  setOrganizationName(orgData.name)
}
```

**Características:**
- Solo se ejecuta una vez (hasInitialized flag)
- Logs detallados para debugging
- Manejo de errores robusto

### 3. Actualización de Nombre

**Ubicación:** `app/settings/page.tsx` → `handleSaveOrganizationName`

```typescript
// Actualiza el nombre en la tabla
await supabase
  .from('organizations')
  .update({ name: organizationName })
  .eq('owner_id', user.id)
```

### 4. Invitaciones de Equipo

**Edge Function:** `supabase/functions/send-team-invitation/index.ts`

```typescript
// Envía email con Resend API
const resend = new Resend(apiKey)
await resend.emails.send({
  from: 'Camaral <no-reply@camaral.ai>',
  to: [invited_email],
  subject: 'Team Invitation',
  html: emailTemplate
})
```

**Características:**
- Autenticación con JWT
- Template HTML profesional
- Expiración en 7 días
- Tokens únicos

---

## 🚀 Flujo de Usuario

### Primera vez (Cuenta Personal)
1. Usuario se registra → Solo existe en `auth.users`
2. Ve "Personal Account" en Settings
3. Puede convertir a Organización

### Conversión a Organización
1. Click "Convert to Organization"
2. Confirmación → Crea registro en `organizations`
3. UI actualiza inmediatamente
4. Badge cambia a "Organization Account"

### Después de recargar
1. `useEffect` se ejecuta
2. Query a `organizations` por `owner_id`
3. Si existe → `isOrganization = true`
4. Estado persiste correctamente ✅

### Invitar Miembros
1. Solo disponible para organizaciones
2. Input de email + Click "Send invite"
3. Edge Function envía email
4. Miembro recibe link con token
5. Acepta → Se agrega a `team_members`

---

## 🔍 Debugging

### Console Logs

Cuando la página carga:
```javascript
🔍 Loading user data: { email: "...", userId: "..." }
🏢 Organization data from DB: { 
  orgData: { name: "...", is_organization: true },
  orgError: null
}
✅ Found organization: Camaral
```

Si no hay organización:
```javascript
❌ No organization found, setting as personal account
```

### Verificar en DB

```sql
-- Ver organización de un usuario
SELECT 
  o.name,
  o.is_organization,
  u.email
FROM organizations o
JOIN auth.users u ON o.owner_id = u.id
WHERE u.email = 'user@example.com';
```

---

## ⚙️ Variables de Entorno

### Supabase Dashboard
```
RESEND_API_KEY = re_xxx...
SITE_URL = https://your-domain.com
```

### Vercel
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 📦 Archivos Clave

```
app/settings/page.tsx               # UI principal de Settings
app/auth/accept-invitation/page.tsx # Aceptar invitaciones
supabase/functions/
  └─ send-team-invitation/index.ts  # Edge Function para emails
supabase/
  └─ team-invitations-schema.sql    # Schema completo
```

---

## ✅ Estado Actual

- ✅ Conversión a organización funciona
- ✅ Persistencia correcta en base de datos
- ✅ Carga correctamente al recargar
- ✅ Actualización de nombre funciona
- ✅ Sistema de invitaciones implementado
- ✅ Emails enviados con Resend
- ✅ RLS configurado correctamente
- ✅ Logs de debugging completos
- ✅ Código limpio (sin archivos de debug)

---

## 🔄 Mantenimiento

### Para agregar un nuevo miembro manualmente:
```sql
INSERT INTO team_members (organization_id, user_id, role)
VALUES (
  (SELECT id FROM organizations WHERE owner_id = 'owner_user_id'),
  'new_member_user_id',
  'Member'
);
```

### Para cambiar el owner de una organización:
```sql
UPDATE organizations
SET owner_id = 'new_owner_id'
WHERE id = 'org_id';
```

### Para ver todas las invitaciones pendientes:
```sql
SELECT * FROM team_invitations
WHERE status = 'pending'
AND expires_at > NOW();
```

---

## 🎯 Próximos Pasos (Futuro)

- [ ] Implementar roles (Admin, Member, Viewer)
- [ ] Agregar permisos por rol
- [ ] Dashboard de analytics para organizaciones
- [ ] Límites por plan (Free, Pro, Enterprise)
- [ ] Facturación por miembro
- [ ] Audit logs
- [ ] Webhooks para eventos de equipo

---

## 📞 Soporte

Si hay problemas con la persistencia:
1. Verificar que la tabla `organizations` existe
2. Verificar RLS policies están habilitadas
3. Revisar console logs del navegador
4. Verificar datos en Supabase Dashboard
