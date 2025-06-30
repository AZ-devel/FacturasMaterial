# FacturasApp - Sistema de Gestión de Facturas

Una aplicación moderna de gestión de facturas desarrollada con React, Express y PostgreSQL.

## 🚀 Características

- **Autenticación segura** con sesiones de usuario
- **Dashboard interactivo** con estadísticas de negocio
- **Gestión de clientes** con información completa
- **Catálogo de productos** con inventario
- **Creación de facturas** con generación automática de PDF
- **Sistema de logs** para auditoría
- **Diseño responsive** con Material UI

## 🛠️ Tecnologías

### Frontend
- React 18 con TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query para gestión de estado
- Wouter para routing
- jsPDF para generación de documentos

### Backend
- Express.js con TypeScript
- Sesiones con express-session
- Drizzle ORM
- bcryptjs para encriptación

### Base de Datos
- PostgreSQL (Supabase)
- Esquema completamente tipado

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd facturasapp
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env
DATABASE_URL=your_supabase_connection_string
SESSION_SECRET=your_session_secret
```

4. **Inicializar base de datos**
```bash
npm run db:push
```

5. **Iniciar en desarrollo**
```bash
npm run dev
```

## 🌐 Deployment

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Agregar variable de entorno `DATABASE_URL`
3. Deploy automático

### Docker

```bash
# Construir imagen
docker build -t facturasapp .

# Ejecutar contenedor
docker run -p 5000:5000 -e DATABASE_URL=your_db_url facturasapp
```

### Manual

```bash
# Construir para producción
npm run build

# Iniciar servidor
npm start
```

## 👤 Usuario de Prueba

- **Email:** admin@facturas.com
- **Contraseña:** admin123

## 📁 Estructura del Proyecto

```
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/       # Páginas de la aplicación
│   │   ├── hooks/       # Hooks personalizados
│   │   └── lib/         # Utilidades
├── server/          # Backend Express
│   ├── index.ts     # Servidor principal
│   ├── routes.ts    # Rutas de API
│   └── storage.ts   # Capa de datos
├── shared/          # Tipos compartidos
│   └── schema.ts    # Esquema de base de datos
└── dist/           # Build de producción
```

## 🔧 Scripts Disponibles

- `npm run dev` - Desarrollo
- `npm run build` - Construir para producción
- `npm start` - Servidor de producción
- `npm run db:push` - Aplicar cambios de esquema
- `npm run check` - Verificar tipos

## 📊 Funcionalidades

### Dashboard
- Estadísticas de ventas mensuales
- Gráficos de ingresos
- Resumen de facturas recientes
- Métricas de clientes activos

### Gestión de Clientes
- CRUD completo de clientes
- Búsqueda y filtrado
- Información de contacto y facturación

### Productos
- Catálogo de productos/servicios
- Gestión de precios y stock
- Categorización

### Facturación
- Creación de facturas multipunto
- Cálculo automático de totales e IVA
- Generación de PDF profesionales
- Estados de factura (pendiente, pagada, vencida)

### Seguridad
- Autenticación basada en sesiones
- Encriptación de contraseñas
- Control de acceso por roles
- Logs de auditoría

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

## 🚀 Próximas Características

- [ ] Integración con pasarelas de pago
- [ ] Notificaciones por email
- [ ] Exportación a Excel
- [ ] Multi-moneda
- [ ] API REST completa
- [ ] Aplicación móvil

## 📞 Soporte

Para soporte técnico o consultas, contactar a través de [issues](https://github.com/your-repo/issues).