# Guía de Deployment - FacturasApp

Esta guía te ayudará a desplegar FacturasApp en diferentes plataformas de hosting.

## 📋 Requisitos Previos

1. **Base de datos Supabase configurada**
   - Proyecto creado en [supabase.com](https://supabase.com)
   - DATABASE_URL obtenida del dashboard de Supabase

2. **Variables de entorno necesarias:**
   ```bash
   DATABASE_URL=postgresql://postgres.xyz:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   SESSION_SECRET=tu-secreto-super-seguro-aqui
   NODE_ENV=production
   ```

## 🚀 Opción 1: Vercel (Recomendado)

### Deployment Automático
1. **Conectar repositorio a Vercel:**
   - Ir a [vercel.com](https://vercel.com)
   - Conectar cuenta de GitHub/GitLab
   - Importar repositorio de FacturasApp

2. **Configurar variables de entorno:**
   - En dashboard de Vercel → Settings → Environment Variables
   - Agregar: `DATABASE_URL`, `SESSION_SECRET`

3. **Deploy automático:**
   - Vercel detectará automáticamente el `vercel.json`
   - El deployment se ejecutará automáticamente

### Deployment Manual
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login a Vercel
vercel login

# Deploy
vercel --prod
```

## 🐳 Opción 2: Docker

### Build y ejecución local
```bash
# Construir imagen
docker build -t facturasapp .

# Ejecutar contenedor
docker run -p 5000:5000 \
  -e DATABASE_URL="your_database_url" \
  -e SESSION_SECRET="your_session_secret" \
  facturasapp
```

### Docker Compose
Crear `docker-compose.yml`:
```yaml
version: '3.8'
services:
  facturasapp:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SESSION_SECRET=${SESSION_SECRET}
      - NODE_ENV=production
    restart: unless-stopped
```

```bash
# Ejecutar con Docker Compose
docker-compose up -d
```

## ☁️ Opción 3: Railway

1. **Crear cuenta en [railway.app](https://railway.app)**

2. **Conectar repositorio:**
   - New Project → Deploy from GitHub repo
   - Seleccionar repositorio de FacturasApp

3. **Configurar variables:**
   - Variables → Add variables
   - Agregar: `DATABASE_URL`, `SESSION_SECRET`

4. **Deploy automático**

## 🌐 Opción 4: Render

1. **Crear cuenta en [render.com](https://render.com)**

2. **Nuevo Web Service:**
   - Connect repository
   - Build Command: `npm run build`
   - Start Command: `npm start`

3. **Variables de entorno:**
   - Environment → Add environment variable
   - Agregar todas las variables necesarias

## 🔧 Opción 5: VPS/Servidor Propio

### Prerrequisitos
- Node.js 20+ instalado
- PM2 para manejo de procesos
- Nginx como reverse proxy (opcional)

### Pasos de instalación:
```bash
# 1. Clonar repositorio
git clone <tu-repositorio>
cd facturasapp

# 2. Instalar dependencias
npm ci --production

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Construir aplicación
npm run build

# 5. Instalar PM2
npm install -g pm2

# 6. Iniciar aplicación con PM2
pm2 start dist/index.js --name "facturasapp"
pm2 save
pm2 startup
```

### Configuración Nginx (opcional):
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🛠️ Script de Deployment Automatizado

Usar el script incluido para deployment automatizado:

```bash
# Hacer ejecutable
chmod +x deploy.sh

# Configurar variables de entorno
export DATABASE_URL="tu_database_url"
export SESSION_SECRET="tu_session_secret"

# Ejecutar deployment
./deploy.sh
```

## ✅ Verificación Post-Deployment

1. **Verificar que la aplicación está ejecutándose:**
   ```bash
   curl https://tu-dominio.com/api/health
   ```

2. **Verificar conexión a base de datos:**
   - Acceder a la aplicación
   - Intentar login con: admin@facturas.com / admin123

3. **Verificar funcionalidades básicas:**
   - Dashboard carga correctamente
   - Se pueden crear clientes
   - Se pueden generar facturas PDF

## 🔍 Troubleshooting

### Error de conexión a base de datos
- Verificar que DATABASE_URL es correcta
- Asegurar que la IP del servidor está whitelisteada en Supabase

### Error de build
- Verificar que todas las dependencias están instaladas
- Ejecutar `npm run check` para verificar tipos TypeScript

### Error 500 en producción
- Revisar logs del servidor
- Verificar variables de entorno
- Verificar que el puerto está disponible

### Performance lenta
- Habilitar compresión gzip en el servidor
- Usar CDN para archivos estáticos
- Optimizar queries de base de datos

## 📊 Monitoreo

### Logs de aplicación
```bash
# Con PM2
pm2 logs facturasapp

# Con Docker
docker logs container_name

# Con Vercel
vercel logs
```

### Métricas básicas
- Tiempo de respuesta de API
- Uso de memoria
- Conexiones activas a base de datos
- Errores de aplicación

## 🔒 Seguridad en Producción

1. **Variables de entorno:**
   - Usar secretos únicos y seguros
   - No commitear archivos .env al repositorio

2. **Base de datos:**
   - Habilitar SSL para conexiones
   - Configurar backups automáticos

3. **Servidor:**
   - Usar HTTPS con certificados SSL
   - Configurar firewall apropiadamente
   - Mantener dependencias actualizadas

## 📞 Soporte

Si encuentras problemas durante el deployment:
1. Revisar logs de la aplicación
2. Verificar configuración de variables de entorno
3. Consultar la documentación de la plataforma de hosting
4. Crear un issue en el repositorio con detalles del error