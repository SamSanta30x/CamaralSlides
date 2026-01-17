# 🔴 Solución Final para Error 401

## 📋 El Problema

El error `FunctionsHttpError: Edge Function returned a non-2xx status code` está **ocultando el error real**. Supabase envuelve todos los errores HTTP en esta clase genérica.

## 🔍 Paso 1: Ver el Error Real en el Dashboard

**ESTO ES LO MÁS IMPORTANTE:**

1. Ve a: https://supabase.com/dashboard/project/vogxtprdcnmlzvuxmbss/functions/process-pdf

2. Haz clic en la pestaña **"Logs"**

3. **Sube un PDF** en tu app

4. **Observa los logs en tiempo real** en el Dashboard

5. Busca mensajes como:
   - ❌ "No authorization header provided"
   - ❌ "Authentication failed"
   - ❌ "Failed to download PDF"
   - ❌ Cualquier otro error

**Los logs te dirán EXACTAMENTE qué está fallando.**

---

## 🧪 Paso 2: Prueba Manual (Opcional)

Para probar la Edge Function directamente sin la app:

```bash
# 1. Obtén tu ANON_KEY de .env.local
cat .env.local | grep ANON_KEY

# 2. Prueba la función directamente
curl -i --location --request POST \
  'https://vogxtprdcnmlzvuxmbss.supabase.co/functions/v1/process-pdf' \
  --header 'apikey: TU_ANON_KEY_AQUI' \
  --header 'Content-Type: application/json' \
  --data '{
    "presentationId": "test-123",
    "pdfPath": "temp/test/test.pdf"
  }'
```

Esto te mostrará la respuesta exacta del servidor.

---

## 🔧 Paso 3: Posibles Causas y Soluciones

### Causa 1: El archivo PDF no existe en Storage

**Síntoma en logs**: "Failed to download PDF"

**Solución**:
1. Ve a: https://supabase.com/dashboard/project/vogxtprdcnmlzvuxmbss/storage/buckets/slides
2. Verifica que el archivo existe en `temp/[presentation-id]/[filename].pdf`
3. Si no existe, el problema está en el upload

**Fix**:
```javascript
// Verifica que el upload fue exitoso antes de llamar a la Edge Function
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('slides')
  .upload(tempPath, pdfFile)

console.log('Upload result:', uploadData, uploadError)
```

---

### Causa 2: Permisos de Storage (RLS)

**Síntoma en logs**: "Permission denied" o "Access denied"

**Solución**:
1. Ve a: https://supabase.com/dashboard/project/vogxtprdcnmlzvuxmbss/storage/policies
2. Verifica que existe la política: **"Service role can upload slides"**

**SQL para crear la política**:
```sql
-- Permite al SERVICE_ROLE leer archivos
CREATE POLICY "Service role can read slides"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'slides' AND (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role'));

-- Permite al SERVICE_ROLE escribir archivos
CREATE POLICY "Service role can write slides"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'slides' AND (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role'));
```

---

### Causa 3: Variables de Entorno Faltantes

**Síntoma en logs**: "undefined" o "null" en las URLs

**Solución**:
Las Edge Functions tienen acceso automático a:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

**Verifica en el Dashboard**:
1. Ve a: https://supabase.com/dashboard/project/vogxtprdcnmlzvuxmbss/settings/api
2. Copia el **service_role key** (no el anon key)
3. Las Edge Functions ya tienen acceso a esta key automáticamente

---

### Causa 4: CORS Issues

**Síntoma**: Error en el navegador antes de llegar a la función

**Solución**: Ya está implementado en el código:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

---

## 📊 Paso 4: Debugging Avanzado

### En la Consola del Navegador:

```javascript
// 1. Verifica la sesión
const { createClient } = await import('./lib/supabase/client')
const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)

// 2. Verifica que puedes subir archivos
const testFile = new Blob(['test'], { type: 'text/plain' })
const { data, error } = await supabase.storage
  .from('slides')
  .upload('test/test.txt', testFile)
console.log('Upload test:', data, error)

// 3. Verifica que puedes llamar a la función
const { data: funcData, error: funcError } = await supabase.functions.invoke('process-pdf', {
  body: { presentationId: 'test', pdfPath: 'test/test.txt' }
})
console.log('Function test:', funcData, funcError)
```

---

## 🎯 Checklist de Verificación

Antes de continuar, verifica:

- [ ] El archivo `.env.local` tiene las variables correctas
- [ ] El servidor de Next.js está corriendo (`npm run dev`)
- [ ] Estás autenticado en la app
- [ ] El bucket `slides` existe en Storage
- [ ] El bucket `slides` es público
- [ ] Las políticas RLS permiten al service_role leer/escribir
- [ ] La Edge Function está desplegada (verifica en Dashboard)
- [ ] Los logs del Dashboard muestran que la función se está ejecutando

---

## 🆘 Si Nada Funciona

**Comparte conmigo:**

1. **Los logs del Dashboard** (copia/pega el texto)
2. **La respuesta del curl** (si lo ejecutaste)
3. **Los logs de la consola del navegador** (F12)
4. **El contenido de tu `.env.local`** (sin mostrar las keys completas)

Con esa información podré darte la solución exacta.

---

## 💡 Nota Importante

El error 401 generalmente significa una de estas cosas:

1. **No estás autenticado** → Haz logout/login
2. **El archivo no existe** → Verifica el upload
3. **Permisos de Storage** → Verifica las políticas RLS
4. **Variables de entorno** → Reinicia el servidor

**El Dashboard de Supabase te dirá exactamente cuál es.** 🎯
