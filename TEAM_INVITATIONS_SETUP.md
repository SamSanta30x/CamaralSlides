# Team Invitations System

Sistema completo de invitaciones por email para equipos en Camaral Slides.

## 📋 Características

- ✉️ Envío de emails de invitación personalizados
- 🔗 Links únicos y seguros para aceptar invitaciones
- ⏰ Invitaciones con expiración de 7 días
- 👥 Gestión de roles (Admin/Member)
- 🔒 Validación de emails y permisos
- 📊 Seguimiento de estado (pending/accepted/rejected/expired)

## 🗄️ Base de Datos

### 1. Aplicar Schema SQL

Ejecuta el schema SQL para crear las tablas necesarias:

```bash
# Opción 1: Desde Supabase Dashboard
# Ve a SQL Editor y ejecuta el contenido de:
supabase/team-invitations-schema.sql

# Opción 2: Con Supabase CLI
supabase db push
```

### Tablas Creadas

1. **`team_invitations`**
   - Almacena invitaciones pendientes y su estado
   - Campos: `invitation_token`, `invited_email`, `organization_name`, `role`, `status`, `expires_at`

2. **`organizations`**
   - Información de las organizaciones
   - Campos: `owner_id`, `name`, `is_organization`

3. **`team_members`**
   - Relación entre usuarios y organizaciones
   - Campos: `organization_id`, `user_id`, `role`

## 🔧 Edge Function

### 1. Desplegar la Edge Function

```bash
# Desde la carpeta del proyecto
npx supabase functions deploy send-team-invitation
```

### 2. Configurar Variables de Entorno

En el Supabase Dashboard > Project Settings > Edge Functions:

```env
SITE_URL=https://tudominio.com
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 3. Habilitar CORS

La función ya incluye headers CORS configurados.

## 📧 Integración con Servicio de Email

Para enviar emails reales, integra con uno de estos servicios:

### Opción 1: Resend (Recomendado)

```typescript
// En send-team-invitation/index.ts
import { Resend } from 'resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

await resend.emails.send({
  from: 'Camaral <no-reply@camaral.ai>',
  to: invitedEmail,
  subject: `You've been invited to join ${organizationName}`,
  html: emailHtml,
})
```

### Opción 2: SendGrid

```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY'))

await sgMail.send({
  to: invitedEmail,
  from: 'no-reply@camaral.ai',
  subject: `You've been invited to join ${organizationName}`,
  html: emailHtml,
})
```

### Opción 3: Supabase Auth Emails

Usa el sistema de emails de Supabase (más limitado):

```typescript
await supabase.auth.admin.inviteUserByEmail(invitedEmail, {
  data: { organization_name: organizationName },
  redirectTo: invitationLink
})
```

## 🚀 Flujo de Invitación

### 1. Enviar Invitación

```typescript
// En Settings > Team
const { data, error } = await supabase.functions.invoke('send-team-invitation', {
  body: {
    invitedEmail: 'user@example.com',
    organizationName: 'My Organization',
    inviterName: 'John Doe',
    role: 'Member'
  }
})
```

### 2. Usuario Recibe Email

El email incluye:
- Nombre del invitador
- Nombre de la organización
- Rol asignado
- Link único para aceptar
- Fecha de expiración

### 3. Aceptar/Rechazar Invitación

El usuario hace click en el link y va a:
```
/auth/accept-invitation?token=UNIQUE_TOKEN
```

Si no tiene cuenta:
- Redirige a `/signup?invitation=TOKEN`
- Después del signup, acepta automáticamente

Si ya tiene cuenta:
- Verifica que el email coincida
- Muestra botones "Accept" / "Decline"

## 🔐 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado:

1. **team_invitations**
   - Los usuarios solo ven invitaciones enviadas por ellos o a su email
   - Solo el invitador puede actualizar sus invitaciones
   - Los invitados pueden actualizar el status (accept/reject)

2. **organizations**
   - Los usuarios solo ven su propia organización
   - Solo el owner puede actualizar

3. **team_members**
   - Los miembros solo ven miembros de su organización
   - Solo el owner puede gestionar miembros

### Validaciones

- Token único por invitación (UUID)
- Expiración automática después de 7 días
- Verificación de email del invitado
- No se pueden enviar invitaciones duplicadas
- Solo cuentas de organización pueden invitar

## 📱 UI/UX

### Estados Visuales

1. **Personal Account** 👤
   - Badge gris
   - Botón para convertir a organización
   - No puede invitar miembros

2. **Organization Account** 🏢
   - Badge verde
   - Puede editar nombre de organización
   - Puede invitar y gestionar miembros

### Gestión de Roles

- **Owner** 🟢: No puede ser cambiado ni eliminado
- **Admin** 🔵: Puede ser cambiado a Member
- **Member** ⚪: Puede ser cambiado a Admin

Click en el badge del rol para editar inline.

## 🧪 Testing

### 1. Probar Localmente

```bash
# Iniciar Supabase local
npx supabase start

# Aplicar migraciones
npx supabase db push

# Desplegar función localmente
npx supabase functions serve send-team-invitation

# En la app
npm run dev
```

### 2. Casos de Prueba

- [ ] Invitar usuario nuevo
- [ ] Invitar usuario existente
- [ ] Aceptar invitación
- [ ] Rechazar invitación
- [ ] Invitación expirada
- [ ] Email inválido
- [ ] Email duplicado
- [ ] Cambiar roles
- [ ] Eliminar miembro
- [ ] Convertir a organización

## 📚 Próximos Pasos

1. **Integrar servicio de email real** (Resend recomendado)
2. **Agregar notificaciones in-app** para invitaciones pendientes
3. **Dashboard de invitaciones** para ver todas las invitaciones enviadas/recibidas
4. **Permisos granulares** basados en roles
5. **Límites de equipo** según el plan (Free/Pro/Enterprise)
6. **Invitaciones por link público** (compartir link en lugar de email)
7. **Two-factor authentication** para miembros de organizaciones

## 🐛 Troubleshooting

### Error: "Missing authorization header"
- Verifica que estás enviando el token JWT en el header
- Asegúrate de que el usuario está autenticado

### Error: "Invitation not found"
- El token puede ser inválido o la invitación fue eliminada
- Verifica que la tabla `team_invitations` existe

### No se envían emails
- Configura un servicio de email (Resend/SendGrid)
- Verifica las variables de entorno en Edge Functions
- Revisa los logs de la Edge Function

### Error: "Row Level Security policy violation"
- Verifica que las políticas RLS están aplicadas correctamente
- El usuario debe tener los permisos necesarios

## 📝 Notas

- Las invitaciones expiran automáticamente después de 7 días
- Un usuario solo puede estar en una organización a la vez
- El owner no puede ser removido de la organización
- Solo las cuentas de organización pueden tener múltiples miembros
