# Dockerfile para FacturasApp
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Instalar dependencias
RUN npm ci --production=false

# Copiar código fuente
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/

# Construir aplicación
RUN npm run build

# Imagen de producción
FROM node:20-alpine AS production

WORKDIR /app

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --production=true && npm cache clean --force

# Copiar archivos construidos
COPY --from=builder /app/dist ./dist

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=5000

# Exponer puerto
EXPOSE 5000

# Usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Comando de inicio
CMD ["node", "dist/index.js"]