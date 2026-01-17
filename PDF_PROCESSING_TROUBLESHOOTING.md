# PDF Processing - Troubleshooting Guide

## ✅ Cambios Implementados

### 1. **Autenticación Corregida**
- La Edge Function ahora verifica el header de Authorization
- El cliente envía el token de sesión en cada llamada
- Se agregó validación de autenticación con respuesta 401 clara

### 2. **Mejor Manejo de Errores**
- Logging detallado en cada paso del proceso
- Mensajes de error más descriptivos
- Stack traces completos en desarrollo
- No se limpian archivos temporales si falla (para debugging)

### 3. **Sistema de Notificaciones (Toast)**
- Nuevo componente `Toast.tsx` para notificaciones visuales
- Reemplaza los `alert()` con notificaciones elegantes
- Tipos: success, error, info
- Auto-dismiss después de 5 segundos

### 4. **Validaciones Agregadas**
- Validación de tamaño de archivo (máx 50MB)
- Validación de tipo de archivo
- Verificación de datos antes de procesar

### 5. **Edge Function Mejorada**
- Verificación de Authorization header
- Logging detallado de cada paso
- Mejor manejo de errores con stack traces
- Validación de datos descargados

## 🔍 Cómo Verificar que Funciona

### Paso 1: Verificar Deployment
```bash
npx supabase functions list
```
Deberías ver `process-pdf` en la lista.

### Paso 2: Verificar Variables de Entorno
En tu archivo `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://vogxtprdcnmlzvuxmbss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### Paso 3: Verificar Storage Bucket
1. Ve a https://supabase.com/dashboard/project/vogxtprdcnmlzvuxmbss/storage/buckets
2. Verifica que el bucket `slides` existe
3. Verifica que es público (public: true)

### Paso 4: Verificar Políticas de Storage
En Supabase Dashboard → Storage → Policies:
```sql
-- Debe existir esta política:
CREATE POLICY "Service role can upload slides"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'slides' AND auth.jwt() ->> 'role' = 'service_role');
```

### Paso 5: Probar Upload
1. Inicia sesión en tu app
2. Sube un PDF pequeño (1-2 páginas)
3. Abre la consola del navegador (F12)
4. Observa los logs:
   - "PDF uploaded, processing..."
   - "Edge function error:" (si hay error)

## 🐛 Errores Comunes y Soluciones

### Error 401: Authentication Required
**Causa**: No se está enviando el token de autenticación
**Solución**: 
- Verifica que el usuario está autenticado
- Revisa que `getSession()` retorna un token válido
- Prueba hacer logout/login

### Error 500: Edge Function Failed
**Causa**: Error interno en la Edge Function
**Solución**:
```bash
# Ver logs detallados
npx supabase functions logs process-pdf --limit 50
```

Busca en los logs:
- "Failed to download PDF" → Problema con Storage
- "Failed to upload slide" → Problema con permisos
- "Error processing PDF" → PDF corrupto o formato inválido

### Error: Failed to download PDF
**Causa**: El archivo no existe en Storage o no hay permisos
**Solución**:
1. Verifica que el archivo se subió correctamente
2. Revisa las políticas de Storage
3. Verifica que el path es correcto: `temp/{presentationId}/{filename}`

### Error: Permission Denied
**Causa**: Las políticas RLS no permiten la operación
**Solución**:
```sql
-- Agrega esta política si no existe:
CREATE POLICY "Service role can insert slides"
  ON slides FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
```

## 📊 Monitoreo en Tiempo Real

### Ver Logs en Vivo
```bash
npx supabase functions logs process-pdf --follow
```

### Verificar Realtime Updates
1. Abre la página de presentación
2. Abre la consola del navegador
3. Busca: "New slide added:" en los logs
4. Deberías ver cada slide aparecer en tiempo real

## 🔧 Debugging Avanzado

### Test Manual de la Edge Function
```bash
curl -i --location --request POST \
  'https://vogxtprdcnmlzvuxmbss.supabase.co/functions/v1/process-pdf' \
  --header 'Authorization: Bearer TU_ACCESS_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "presentationId": "test-id",
    "pdfPath": "temp/test-id/test.pdf"
  }'
```

### Verificar Storage Directamente
```typescript
// En la consola del navegador:
const { data, error } = await supabase.storage
  .from('slides')
  .list('temp')
console.log('Files:', data, 'Error:', error)
```

## 📝 Próximos Pasos (Opcional)

### 1. Agregar Campo de Estado
```sql
ALTER TABLE presentations 
ADD COLUMN status TEXT DEFAULT 'completed';

-- Valores posibles: 'processing', 'completed', 'failed'
```

### 2. Agregar Indicador de Progreso
Modificar Edge Function para enviar eventos de progreso:
```typescript
// En cada iteración del loop:
console.log(`Progress: ${i + 1}/${pageCount}`)
```

### 3. Conversión a PNG
Si necesitas imágenes en lugar de PDFs:
- Opción 1: Usar Cloudinary API
- Opción 2: Usar pdf.co API
- Opción 3: Implementar conversión con Canvas en el cliente

## 🆘 Soporte

Si sigues teniendo problemas:

1. **Revisa los logs completos**:
   ```bash
   npx supabase functions logs process-pdf --limit 100
   ```

2. **Verifica la consola del navegador**: Busca errores en rojo

3. **Revisa el Dashboard de Supabase**:
   - Functions → process-pdf → Logs
   - Storage → slides → Archivos
   - Database → Tables → presentations, slides

4. **Prueba con un PDF simple**: Crea un PDF de 1 página con solo texto

## ✨ Estado Actual

- ✅ Edge Function desplegada
- ✅ Autenticación implementada
- ✅ Manejo de errores mejorado
- ✅ Sistema de notificaciones (Toast)
- ✅ Validaciones de archivo
- ✅ Logging detallado
- ⏳ Conversión a PNG (opcional)
- ⏳ Indicador de progreso (opcional)
- ⏳ Campo de estado en DB (opcional)
