# Realtime Setup for Live Slide Updates

Para que las slides aparezcan en tiempo real mientras se procesan, necesitas habilitar Realtime en Supabase.

## Pasos:

### 1. Ve al Dashboard de Supabase
https://supabase.com/dashboard/project/vogxtprdcnmlzvuxmbss/database/publications

### 2. Habilita Realtime para la tabla `slides`

1. Click en "Database" en el menú lateral
2. Click en "Publications" 
3. Click en "supabase_realtime"
4. Asegúrate que la tabla `slides` esté marcada ✅

O ejecuta este SQL en el SQL Editor:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE slides;
```

### 3. Verifica que funcione

1. Sube un PDF desde tu app
2. Abre la consola del navegador (F12)
3. Deberías ver logs como: "New slide added: {...}"

## ¿Cómo funciona?

1. Usuario sube PDF
2. Se crea presentación vacía → Redirect inmediato a `/presentation/[id]`
3. Edge Function procesa PDF en background
4. Por cada página convertida:
   - Se crea un registro en la tabla `slides`
   - Realtime notifica al frontend
   - Nueva slide aparece automáticamente
5. Usuario ve las slides aparecer una por una en tiempo real

## Alternativa sin Realtime

Si no quieres usar Realtime, puedes hacer polling:

```typescript
// En lugar de subscribeToSlideUpdates()
useEffect(() => {
  const interval = setInterval(() => {
    loadPresentation() // Recargar cada 2 segundos
  }, 2000)
  
  return () => clearInterval(interval)
}, [])
```

Pero Realtime es mucho más eficiente y da mejor UX.
