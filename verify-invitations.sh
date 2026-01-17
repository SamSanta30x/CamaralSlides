#!/bin/bash

# Script de Verificación del Sistema de Invitaciones
# Este script verifica que todo esté configurado correctamente

echo "🔍 Verificando Sistema de Invitaciones de Camaral..."
echo "=================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Función para checks
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1"
        ((FAILED++))
    fi
}

# 1. Verificar Node.js
echo "📦 Verificando dependencias..."
node --version > /dev/null 2>&1
check "Node.js instalado"

npm --version > /dev/null 2>&1
check "npm instalado"

# 2. Verificar archivos clave
echo ""
echo "📁 Verificando archivos..."

test -f "app/settings/page.tsx"
check "app/settings/page.tsx existe"

test -f "app/auth/accept-invitation/page.tsx"
check "app/auth/accept-invitation/page.tsx existe"

test -f "supabase/functions/send-team-invitation/index.ts"
check "Edge Function send-team-invitation existe"

test -f "supabase/team-invitations-schema.sql"
check "Schema SQL existe"

# 3. Verificar configuración
echo ""
echo "⚙️  Verificando configuración..."

if grep -q "send-team-invitation" supabase/config.toml; then
    echo -e "${GREEN}✓${NC} Edge Function configurada en config.toml"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Edge Function NO configurada en config.toml"
    ((FAILED++))
fi

if grep -q "RESEND_API_KEY" supabase/config.toml; then
    echo -e "${GREEN}✓${NC} RESEND_API_KEY configurada en config.toml"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} RESEND_API_KEY NO configurada en config.toml"
    ((FAILED++))
fi

# 4. Verificar .env.local
echo ""
echo "🔐 Verificando variables de entorno locales..."

if [ -f ".env.local" ]; then
    if grep -q "RESEND_API_KEY" .env.local; then
        echo -e "${GREEN}✓${NC} RESEND_API_KEY en .env.local"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC}  RESEND_API_KEY no encontrada en .env.local"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_URL en .env.local"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} NEXT_PUBLIC_SUPABASE_URL no encontrada en .env.local"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠${NC}  .env.local no existe (crear desde .env.example)"
fi

# 5. Verificar Supabase CLI
echo ""
echo "🔧 Verificando Supabase CLI..."

if command -v npx &> /dev/null; then
    if npx supabase --version > /dev/null 2>&1; then
        VERSION=$(npx supabase --version)
        echo -e "${GREEN}✓${NC} Supabase CLI instalado: $VERSION"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Supabase CLI no está instalado"
        echo "   Instalar: npm install -g supabase"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} npx no disponible"
    ((FAILED++))
fi

# 6. Verificar estructura del código
echo ""
echo "🧩 Verificando implementación..."

if grep -q "handleInviteMember.*async" app/settings/page.tsx; then
    echo -e "${GREEN}✓${NC} handleInviteMember es async"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} handleInviteMember NO es async"
    ((FAILED++))
fi

if grep -q "supabase.functions.invoke.*send-team-invitation" app/settings/page.tsx; then
    echo -e "${GREEN}✓${NC} Llama a Edge Function desde frontend"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} NO llama a Edge Function desde frontend"
    ((FAILED++))
fi

if grep -q "api.resend.com" supabase/functions/send-team-invitation/index.ts; then
    echo -e "${GREEN}✓${NC} Edge Function integrada con Resend"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Edge Function NO integrada con Resend"
    ((FAILED++))
fi

# 7. Resumen
echo ""
echo "=================================================="
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "=================================================="
echo ""
echo -e "Pruebas pasadas: ${GREEN}$PASSED${NC}"
echo -e "Pruebas fallidas: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Todo parece estar configurado correctamente!${NC}"
    echo ""
    echo "📋 PRÓXIMOS PASOS:"
    echo "1. Asegúrate de tener las variables en Supabase Dashboard:"
    echo "   - RESEND_API_KEY"
    echo "   - SITE_URL"
    echo ""
    echo "2. Despliega la Edge Function:"
    echo "   npx supabase functions deploy send-team-invitation"
    echo ""
    echo "3. Prueba enviando una invitación:"
    echo "   - Ir a http://localhost:3000/settings?tab=team"
    echo "   - Convertir a organización"
    echo "   - Enviar invitación a tu email"
    echo ""
    echo "4. Verifica el email en:"
    echo "   - Tu inbox"
    echo "   - Resend Dashboard: https://resend.com/emails"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Hay algunos problemas que necesitan ser corregidos${NC}"
    echo ""
    echo "Por favor revisa los errores arriba y:"
    echo "- Verifica que todos los archivos existen"
    echo "- Configura las variables de entorno"
    echo "- Instala dependencias faltantes"
    echo ""
    exit 1
fi
