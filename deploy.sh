#!/bin/bash

# Script de deployment para FacturasApp
echo "🚀 Iniciando deployment de FacturasApp..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecutar desde la raíz del proyecto."
    exit 1
fi

# Verificar variables de entorno requeridas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no está configurada."
    echo "💡 Sugerencia: Exportar DATABASE_URL=your_connection_string"
    exit 1
fi

echo "✅ Variables de entorno verificadas"

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf dist/
rm -rf client/dist/

# Instalar dependencias si es necesario
echo "📦 Verificando dependencias..."
npm ci --production=false

# Build optimizado del frontend
echo "🏗️ Construyendo frontend..."
npx vite build --outDir client/dist --minify --emptyOutDir

# Build del servidor
echo "🏗️ Construyendo servidor..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify

# Verificar que los builds fueron exitosos
if [ ! -d "client/dist" ] || [ ! -f "dist/index.js" ]; then
    echo "❌ Error en el build. Revisar logs anteriores."
    exit 1
fi

echo "✅ Build completado exitosamente"

# Crear directorio de producción
echo "📁 Preparando archivos de producción..."
mkdir -p production/
cp -r dist/ production/
cp -r client/dist/ production/public/
cp package.json production/
cp .env.example production/

echo "🎉 ¡Deployment preparado!"
echo "📂 Archivos listos en: ./production/"
echo ""
echo "Para desplegar:"
echo "  Vercel: vercel --prod"
echo "  Docker: docker build -t facturasapp ."
echo "  Manual: node production/dist/index.js"
echo ""
echo "🔗 No olvides configurar DATABASE_URL en tu plataforma de hosting"