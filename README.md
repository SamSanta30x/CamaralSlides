# CamaralSlides

Este es un proyecto de Next.js con integración de Supabase.

## Comenzando

### Prerrequisitos

- Node.js 18.17 o superior
- Una cuenta de Supabase (https://supabase.com)

### Configuración

1. Clona este repositorio
2. Instala las dependencias:

```bash
npm install
```

3. Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

4. Ve a tu proyecto de Supabase y obtén tus credenciales:
   - Ve a Settings > API
   - Copia la URL del proyecto y la clave anon/public
   - Actualiza `.env.local` con tus credenciales:

```
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-proyecto
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
```

### Ejecutar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

## Estructura del Proyecto

- `/app` - Directorio de la aplicación Next.js (App Router)
- `/lib/supabase` - Configuración de clientes Supabase
  - `client.ts` - Cliente de Supabase para componentes del lado del cliente
  - `server.ts` - Cliente de Supabase para Server Components y Route Handlers
  - `middleware.ts` - Utilidades para el middleware de Next.js
- `middleware.ts` - Middleware de Next.js para gestión de sesiones

## Uso de Supabase

### En Componentes del Cliente

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export default function ClientComponent() {
  const supabase = createClient()
  
  // Usa el cliente de Supabase aquí
}
```

### En Server Components

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  
  // Usa el cliente de Supabase aquí
}
```

## Más Información

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Supabase con Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
