# Configuración de Resend para Envío de Emails

## 📧 API Key de Resend

Tu API Key: `re_WNbK1mpL_M1sU6prdHkYMw2h4mrKBD6nK`

⚠️ **Importante**: Esta API key ya está configurada en:
- ✅ `.env.local` (desarrollo local)
- ✅ Vercel (producción)

## 🔧 Configuración en Supabase

### 1. Variables de Entorno en Supabase Dashboard

Ve a: **Project Settings > Edge Functions > Environment Variables**

Agregar:
```
RESEND_API_KEY=re_WNbK1mpL_M1sU6prdHkYMw2h4mrKBD6nK
SITE_URL=https://tudominio.com (o http://localhost:3000 para desarrollo)
```

### 2. Desplegar la Edge Function

```bash
# Desde la carpeta del proyecto
npx supabase functions deploy send-team-invitation

# O desplegar todas las funciones
npx supabase functions deploy
```

### 3. Verificar Configuración Local

En tu archivo `.env.local`:
```env
RESEND_API_KEY=re_WNbK1mpL_M1sU6prdHkYMw2h4mrKBD6nK
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 📨 Configuración de Email en Resend

### Dominio de Envío

Por defecto, los emails se envían desde:
```
Camaral <no-reply@camaral.ai>
```

Para usar tu propio dominio:

1. **Ir a Resend Dashboard** → Domains
2. **Agregar tu dominio** (ej: `camaral.ai`)
3. **Verificar DNS records**:
   - TXT record para verificación
   - MX records para recepción (opcional)
   - DKIM records para autenticación

4. **Actualizar la Edge Function**:
```typescript
from: 'Camaral <no-reply@tudominio.com>',
```

### Email de Testing

Para desarrollo, Resend acepta emails de prueba:
- Los emails enviados a dominios no verificados se capturan en el Dashboard
- Puedes ver el contenido HTML y verificar que todo funciona

## 🧪 Probar el Sistema

### 1. Probar Localmente

```bash
# Iniciar Supabase local
npx supabase start

# Iniciar la aplicación
npm run dev

# Ir a Settings > Team
# Convertir a Organización
# Invitar un email de prueba
```

### 2. Ver el Email en Resend

1. Ve a [Resend Dashboard](https://resend.com/emails)
2. Deberías ver el email en la lista de "Emails"
3. Click para ver el contenido HTML

### 3. Probar el Link de Invitación

El email incluye un link como:
```
http://localhost:3000/auth/accept-invitation?token=UUID
```

Click en el link o copia/pega en tu navegador para probar el flujo completo.

## 📊 Estructura del Email

El email HTML incluye:

```html
┌─────────────────────────────────┐
│ 🎉 You've been invited!         │ ← Header con gradient
├─────────────────────────────────┤
│ Hi there,                       │
│                                 │
│ [Name] has invited you to join │
│ [Organization] on Camaral       │
│                                 │
│ Role: [Admin/Member]            │ ← Badge con color
│                                 │
│     [Accept Invitation] ←── Botón
│                                 │
│ ⏰ Expires in 7 days             │
│                                 │
│ Link: https://...               │ ← Fallback link
├─────────────────────────────────┤
│ © 2026 Camaral                  │ ← Footer
└─────────────────────────────────┘
```

## 🔐 Seguridad de la API Key

### Buenas Prácticas

1. **Nunca commitear la API key** en git
2. **Usar variables de entorno** siempre
3. **Rotar la key** si se expone accidentalmente
4. **Monitorear uso** en Resend Dashboard

### Si necesitas rotar la key:

1. Ir a [Resend Dashboard](https://resend.com/api-keys)
2. Crear nueva API key
3. Actualizar en:
   - Vercel (Environment Variables)
   - Supabase (Edge Functions > Env Vars)
   - `.env.local` (local)
4. Revocar la key antigua

## 📈 Límites de Resend

### Plan Free:
- **100 emails/día**
- **1 dominio verificado**
- **Retención de logs: 3 días**

### Plan Pro:
- **50,000 emails/mes**
- **Dominios ilimitados**
- **Retención de logs: 90 días**
- **Webhooks**
- **Soporte prioritario**

## 🐛 Troubleshooting

### Error: "RESEND_API_KEY not configured"

**Solución:**
1. Verificar que la variable está en Supabase Edge Functions
2. Redesplegar la función: `npx supabase functions deploy send-team-invitation`

### Error: "Failed to send email"

**Posibles causas:**
1. API key inválida
2. Límite de emails excedido
3. Dominio no verificado (para emails custom)

**Solución:**
- Verificar logs en Resend Dashboard
- Verificar logs de Edge Function en Supabase

### Los emails no llegan

**Verificar:**
1. Carpeta de spam/correo no deseado
2. Dominio verificado en Resend
3. DNS records configurados correctamente
4. Logs en Resend Dashboard para ver el status

### Email HTML no se ve bien

**Solución:**
- El template está optimizado para la mayoría de clientes de email
- Probar en diferentes clientes: Gmail, Outlook, Apple Mail
- Usar [Litmus](https://litmus.com/) para testing avanzado

## 🎨 Personalizar el Template

El template HTML está en:
```
/supabase/functions/send-team-invitation/index.ts
```

Variables dinámicas:
- `${inviterName}` - Nombre del invitador
- `${organizationName}` - Nombre de la organización
- `${role}` - Rol asignado (Admin/Member)
- `${invitationLink}` - Link único de aceptación
- `${new Date().getFullYear()}` - Año actual

Para modificar:
1. Editar el HTML en `emailHtml`
2. Redesplegar: `npx supabase functions deploy send-team-invitation`
3. Probar enviando una invitación de prueba

## 📝 Logs y Monitoreo

### Ver logs de Edge Function:

```bash
# Logs en tiempo real
npx supabase functions logs send-team-invitation

# O en Supabase Dashboard:
# Project > Edge Functions > send-team-invitation > Logs
```

### Ver emails enviados:

1. [Resend Dashboard](https://resend.com/emails)
2. Ver status: Delivered, Bounced, Complained
3. Ver contenido HTML enviado
4. Ver metadata de entrega

## ✅ Checklist de Setup

- [x] API Key de Resend obtenida
- [x] Variable `RESEND_API_KEY` en `.env.local`
- [x] Variable `RESEND_API_KEY` en Vercel
- [ ] Variable `RESEND_API_KEY` en Supabase Edge Functions
- [ ] Variable `SITE_URL` en Supabase Edge Functions
- [ ] Edge Function `send-team-invitation` desplegada
- [ ] Tabla `team_invitations` creada en Supabase
- [ ] Página `/auth/accept-invitation` funcionando
- [ ] Dominio verificado en Resend (opcional, para producción)
- [ ] Probar envío de invitación de prueba
- [ ] Verificar email recibido en Resend Dashboard

## 🚀 Próximos Pasos

1. **Verificar dominio en Resend** para producción
2. **Agregar webhooks** para tracking de entregas
3. **Personalizar template** con branding de Camaral
4. **Configurar email de respuesta** (reply-to)
5. **Agregar analytics** para tasa de apertura
6. **Implementar reintentos** para emails fallidos
