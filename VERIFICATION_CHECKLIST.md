# ✅ Checklist de Verificación del Sistema de Invitaciones

## 📋 Pre-requisitos

Antes de empezar, verifica que tengas:

- [ ] Supabase CLI instalado: `npx supabase --version`
- [ ] Edge Function desplegada: `send-team-invitation`
- [ ] Variables de entorno configuradas en Supabase
- [ ] Aplicación corriendo localmente: `npm run dev`

---

## 🔍 PASO 1: Verificar Edge Function Desplegada

### En Supabase Dashboard:

1. **Ve a:** Project > Edge Functions
2. **Buscar:** `send-team-invitation`
3. **Estado:** Debe aparecer como "Active"

### Desde Terminal:

```bash
# Listar todas las funciones desplegadas
npx supabase functions list

# Deberías ver:
# - process-pdf (Deployed)
# - send-team-invitation (Deployed)
```

### ✅ Verificación:
- [ ] Edge Function aparece en el dashboard
- [ ] Estado: Active/Deployed

---

## 🔍 PASO 2: Verificar Variables de Entorno

### En Supabase Dashboard:

1. **Ve a:** Project Settings > Edge Functions > Environment Variables
2. **Verificar que existan:**
   ```
   RESEND_API_KEY = re_WNbK1mpL_M1sU6prdHkYMw2h4mrKBD6nK
   SITE_URL = https://tudominio.com (o http://localhost:3000)
   ```

### ✅ Verificación:
- [ ] `RESEND_API_KEY` está configurada
- [ ] `SITE_URL` está configurada
- [ ] No hay typos en los valores

---

## 🔍 PASO 3: Verificar Base de Datos

### Ejecutar en SQL Editor de Supabase:

```sql
-- Verificar que la tabla existe
SELECT * FROM team_invitations LIMIT 1;

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'team_invitations';

-- Debería retornar sin errores (puede estar vacía)
```

### ✅ Verificación:
- [ ] Tabla `team_invitations` existe
- [ ] Políticas RLS están activas
- [ ] No hay errores SQL

---

## 🧪 PASO 4: Prueba Completa - Enviar Invitación

### A. Preparar Usuario de Prueba

1. **Abre tu app:** `http://localhost:3000`
2. **Ve a:** Settings > Team
3. **Si es cuenta personal:**
   - Click en "Convert to Organization"
   - Confirmar conversión

### B. Enviar Invitación

1. **Nombre de organización:** "Test Organization"
2. **Email de prueba:** `TU_EMAIL_PERSONAL@gmail.com` (usa tu propio email)
3. **Click:** "Send invite"

### C. Observar Respuesta

**✅ Éxito:**
```
Toast verde: "Invitation email sent successfully!"
```

**❌ Error:**
```
Toast rojo: "Failed to send invitation: [mensaje de error]"
```

### Captura de Consola (F12 > Console):

Deberías ver:
```javascript
Invitation sent: {
  success: true,
  message: "Invitation email sent successfully",
  invitationToken: "uuid-aqui",
  emailId: "resend-email-id"
}
```

### ✅ Verificación:
- [ ] Toast de éxito aparece
- [ ] No hay errores en consola
- [ ] Usuario aparece en la lista de miembros

---

## 📧 PASO 5: Verificar Email en Resend

### En Resend Dashboard:

1. **Ve a:** [https://resend.com/emails](https://resend.com/emails)
2. **Buscar:** Email más reciente
3. **Verificar:**
   - **From:** Camaral <no-reply@camaral.ai>
   - **To:** Tu email de prueba
   - **Subject:** "[Tu nombre] invited you to join Test Organization on Camaral"
   - **Status:** Delivered (puede tardar unos segundos)

### Ver Contenido del Email:

1. Click en el email
2. Tab "HTML" - Ver el template renderizado
3. Tab "Details" - Ver metadata de entrega

### ✅ Verificación:
- [ ] Email aparece en Resend Dashboard
- [ ] Status: Delivered
- [ ] Contenido HTML se ve correcto
- [ ] Link de invitación está presente

---

## 📬 PASO 6: Verificar Recepción del Email

### En tu Email Personal:

1. **Revisar inbox** (puede tardar 1-2 minutos)
2. **Si no está, revisar:**
   - Carpeta de Spam/Correo no deseado
   - Carpeta de Promociones (Gmail)
   - Carpeta de Social (Gmail)

### Contenido del Email Debe Incluir:

```
┌─────────────────────────────────┐
│ 🎉 You've been invited!         │
├─────────────────────────────────┤
│ Hi there,                       │
│                                 │
│ [Tu nombre] has invited you to  │
│ join Test Organization on       │
│ Camaral                         │
│                                 │
│ Role: Member                    │
│                                 │
│ [Accept Invitation] ←── Botón   │
│                                 │
│ Expires in 7 days               │
└─────────────────────────────────┘
```

### ✅ Verificación:
- [ ] Email recibido en inbox o spam
- [ ] Diseño se ve bien (header gradient, botón, etc)
- [ ] Botón "Accept Invitation" es clickeable
- [ ] Link de fallback está presente

---

## 🔗 PASO 7: Probar Link de Aceptación

### A. Hacer Click en el Botón/Link

El link debe ser algo como:
```
http://localhost:3000/auth/accept-invitation?token=uuid-aqui
```

### B. Página de Aceptación Debe Mostrar:

```
┌──────────────────────────────────┐
│   🎉 You're Invited!             │
│                                  │
│  [Tu nombre] has invited you to  │
│  join Test Organization          │
│                                  │
│  Role: Member                    │
│  Email: tu-email@gmail.com       │
│                                  │
│  [Accept Invitation]             │
│  [Decline]                       │
│                                  │
│  Expires on [fecha]              │
└──────────────────────────────────┘
```

### C. Aceptar Invitación

1. **Click:** "Accept Invitation"
2. **Debería:**
   - Actualizar status en DB a "accepted"
   - Redirigir a `/dashboard?invited=true`
   - Mostrar mensaje de bienvenida

### ✅ Verificación:
- [ ] Página de aceptación carga correctamente
- [ ] Muestra información correcta (nombre, org, rol)
- [ ] Botones funcionan
- [ ] Redirección funciona después de aceptar

---

## 🔍 PASO 8: Verificar en Base de Datos

### Ejecutar en SQL Editor:

```sql
-- Ver todas las invitaciones
SELECT 
  id,
  organization_name,
  invited_email,
  role,
  status,
  created_at,
  expires_at
FROM team_invitations
ORDER BY created_at DESC
LIMIT 5;

-- Debería mostrar tu invitación con status 'accepted'
```

### ✅ Verificación:
- [ ] Invitación aparece en la tabla
- [ ] Status cambió de "pending" a "accepted"
- [ ] `accepted_at` tiene timestamp
- [ ] Datos coinciden (email, org, rol)

---

## 📊 PASO 9: Verificar Logs de Edge Function

### Opción A - Desde Supabase Dashboard:

1. **Ve a:** Project > Edge Functions
2. **Click:** `send-team-invitation`
3. **Tab:** Logs
4. **Buscar:** Logs recientes del envío

### Opción B - Desde Terminal:

```bash
# Ver logs en tiempo real
npx supabase functions logs send-team-invitation --follow

# Ver últimos logs
npx supabase functions logs send-team-invitation
```

### Logs Esperados (Éxito):

```
✓ Supabase auth user verified
✓ Invitation created in database
✓ Email sent successfully via Resend: { id: 'email_id' }
✓ Response sent: { success: true, ... }
```

### Logs de Error (Si algo falla):

```
✗ Resend API error: { message: 'API key invalid' }
✗ Error creating invitation: { message: 'duplicate key value' }
```

### ✅ Verificación:
- [ ] Logs muestran éxito (no errores)
- [ ] Se creó el registro en DB
- [ ] Resend respondió con email ID
- [ ] No hay excepciones o errores

---

## 🎯 PASO 10: Prueba de Error - Sin API Key

### Prueba Opcional (para verificar manejo de errores):

1. **Temporalmente remover** `RESEND_API_KEY` de Supabase
2. **Intentar enviar** otra invitación
3. **Debe fallar con mensaje:**
   ```
   "Invitation created (email not sent - RESEND_API_KEY missing)"
   ```
4. **Restaurar** `RESEND_API_KEY`

### ✅ Verificación:
- [ ] Error se maneja correctamente
- [ ] Mensaje descriptivo al usuario
- [ ] No crash de la aplicación

---

## 🎉 RESUMEN DE VERIFICACIÓN

### ✅ Sistema Funcionando Correctamente Si:

1. ✅ Edge Function desplegada y activa
2. ✅ Variables de entorno configuradas
3. ✅ Tabla `team_invitations` existe
4. ✅ Toast de éxito al enviar invitación
5. ✅ Email aparece en Resend Dashboard (Delivered)
6. ✅ Email recibido en inbox (o spam)
7. ✅ Página de aceptación funciona
8. ✅ Invitación se acepta correctamente
9. ✅ Datos correctos en base de datos
10. ✅ Logs sin errores

### ❌ Problemas Comunes y Soluciones:

| Problema | Solución |
|----------|----------|
| Email no se envía | Verificar `RESEND_API_KEY` en Supabase |
| Email no llega | Revisar spam, verificar dominio en Resend |
| Error 401 en función | Verificar que `verify_jwt = true` esté configurado |
| Tabla no existe | Ejecutar `team-invitations-schema.sql` |
| Link de invitación roto | Verificar `SITE_URL` está configurada |

---

## 📞 Si Todo Funciona:

**¡Felicidades! 🎉** El sistema de invitaciones está completamente operativo:

- ✅ Backend funcionando
- ✅ Emails enviándose
- ✅ Links funcionando
- ✅ Base de datos actualizada
- ✅ Logs limpios

### Próximos pasos opcionales:

1. **Verificar dominio** en Resend para mejor entregabilidad
2. **Personalizar template** de email con tu branding
3. **Agregar webhooks** de Resend para tracking
4. **Configurar analytics** de invitaciones

---

## 🐛 Comandos de Debug Útiles

```bash
# Ver todas las funciones
npx supabase functions list

# Ver logs de función específica
npx supabase functions logs send-team-invitation

# Probar función localmente
npx supabase functions serve send-team-invitation

# Ver status de Supabase
npx supabase status

# Redesplegar función si es necesario
npx supabase functions deploy send-team-invitation
```

---

## 📝 Reportar Resultados

Después de completar todos los pasos, reporta:

**✅ Funcionó todo:**
- Invitación enviada ✓
- Email recibido ✓
- Link funciona ✓
- DB actualizada ✓

**❌ Hubo errores:**
- Especificar en qué paso falló
- Compartir mensajes de error
- Compartir logs de consola/Supabase
