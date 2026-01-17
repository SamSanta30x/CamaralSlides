# 🔴 Debug Error 401 - Paso a Paso

## ✅ Cambios Aplicados

1. **Edge Function actualizada** - Ahora verifica correctamente el token del usuario
2. **Cliente actualizado** - Usa la instancia correcta de Supabase
3. **Redespliegue exitoso** - La función está actualizada en el servidor

---

## 🧪 Pasos para Probar

### Paso 1: Verifica tus Variables de Entorno

Abre `.env.local` y verifica que tienes:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vogxtprdcnmlzvuxmbss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

**¿No tienes el ANON_KEY?**
1. Ve a: https://supabase.com/dashboard/project/vogxtprdcnmlzvuxmbss/settings/api
2. Copia el valor de "anon public"
3. Pégalo en `.env.local`

---

### Paso 2: Reinicia el Servidor de Desarrollo

**IMPORTANTE**: Debes reiniciar Next.js para que lea las variables de entorno:

```bash
# En la terminal donde corre npm run dev:
# Presiona Ctrl+C para detener
# Luego ejecuta de nuevo:
npm run dev
```

---

### Paso 3: Limpia la Sesión del Navegador

1. **Abre la Consola del Navegador** (F12)
2. **Ve a la pestaña "Application" o "Almacenamiento"**
3. **Limpia todo**:
   - Cookies
   - Local Storage
   - Session Storage
4. **Refresca la página** (Cmd+R o Ctrl+R)
5. **Inicia sesión de nuevo**

---

### Paso 4: Verifica la Sesión

En la consola del navegador (F12), ejecuta:

```javascript
const { createClient } = await import('./lib/supabase/client')
const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

**Deberías ver:**
- ✅ `session` con datos del usuario
- ✅ `access_token` presente

**Si ves `null`:**
- ❌ No estás autenticado
- → Haz logout y login de nuevo

---

### Paso 5: Prueba Subir un PDF

1. **Abre la consola del navegador** (F12) antes de subir
2. **Sube un PDF pequeño** (1-2 páginas)
3. **Observa los logs** en la consola

**✅ Si funciona, verás:**
```
Uploading PDF to: temp/...
PDF uploaded, processing...
Calling Edge Function with auth token...
```

**❌ Si falla, verás:**
```
No active session found
```
→ Vuelve al Paso 3

---

## 🔍 Test Manual de Autenticación

He creado un archivo `test-auth.html` para probar la autenticación:

1. **Abre `test-auth.html`**
2. **Reemplaza `TU_ANON_KEY_AQUI`** con tu ANON_KEY real
3. **Abre el archivo en el navegador**
4. **Verifica los resultados**

---

## 🐛 Errores Comunes

### Error: "No active session found"

**Causa**: La sesión no está guardada correctamente

**Solución**:
1. Limpia el Local Storage (Paso 3)
2. Haz logout
3. Haz login de nuevo
4. Intenta subir el PDF

---

### Error: "Invalid authentication token"

**Causa**: El token expiró o es inválido

**Solución**:
1. Haz logout
2. Haz login de nuevo
3. Intenta inmediatamente después de login

---

### Error: "Authentication required"

**Causa**: El header Authorization no se está enviando

**Solución**:
1. Verifica que `.env.local` tiene las variables correctas
2. Reinicia el servidor de desarrollo
3. Refresca el navegador

---

## 📊 Verificar en el Dashboard de Supabase

### 1. Verifica que la Edge Function está desplegada:
https://supabase.com/dashboard/project/vogxtprdcnmlzvuxmbss/functions

Deberías ver `process-pdf` en la lista.

### 2. Verifica los logs:
1. Haz clic en `process-pdf`
2. Ve a la pestaña "Logs"
3. Intenta subir un PDF
4. Observa los logs en tiempo real

**Busca estos mensajes:**
- ✅ "Authorization header present"
- ✅ "User authenticated: [user-id]"
- ✅ "Processing PDF for presentation..."

**Si ves:**
- ❌ "No authorization header provided"
  → El header no se está enviando desde el cliente
  → Verifica que reiniciaste el servidor

---

## 🔧 Última Opción: Verificación Manual

Si todo lo anterior falla, vamos a verificar manualmente:

### 1. Verifica el token en la consola:

```javascript
// En la consola del navegador:
const supabase = window.__NEXT_DATA__.props.pageProps.supabase
const { data: { session } } = await supabase.auth.getSession()
console.log('Token:', session?.access_token)
```

### 2. Prueba la Edge Function manualmente:

```bash
curl -i --location --request POST \
  'https://vogxtprdcnmlzvuxmbss.supabase.co/functions/v1/process-pdf' \
  --header 'Authorization: Bearer TU_TOKEN_AQUI' \
  --header 'Content-Type: application/json' \
  --data '{
    "presentationId": "test-123",
    "pdfPath": "temp/test/test.pdf"
  }'
```

Reemplaza `TU_TOKEN_AQUI` con el token que obtuviste en el paso 1.

---

## ✅ Checklist Final

Antes de decir que no funciona, verifica:

- [ ] `.env.local` tiene las variables correctas
- [ ] Reiniciaste el servidor de desarrollo (`npm run dev`)
- [ ] Limpiaste el Local Storage del navegador
- [ ] Hiciste logout y login de nuevo
- [ ] Refrescaste la página después de login
- [ ] La Edge Function está desplegada (verifica en Dashboard)
- [ ] Estás viendo la consola del navegador mientras subes

---

## 🆘 Si Nada Funciona

Comparte:
1. Los logs de la consola del navegador (F12)
2. Los logs del Dashboard de Supabase
3. El contenido de tu `.env.local` (sin el ANON_KEY completo, solo los primeros caracteres)

---

**La Edge Function está correctamente desplegada. El problema es de autenticación en el cliente.** 🔐
