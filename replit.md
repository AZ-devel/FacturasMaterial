# Invoice Management System

## Overview

This is a full-stack invoice management system built with React, Express, and PostgreSQL. The application provides a complete solution for managing clients, products, and invoices with user authentication, PDF generation, and comprehensive logging capabilities.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Tailwind CSS** with shadcn/ui components for styling
- **Wouter** for client-side routing
- **TanStack Query** for server state management and caching
- **React Hook Form** with Zod validation for form handling

### Backend Architecture
- **Express.js** REST API server
- **Express sessions** for authentication management
- **bcryptjs** for password hashing
- **PostgreSQL** database with Neon serverless
- **Drizzle ORM** for database operations and migrations

### Component Structure
- Material Design-inspired UI components
- Modular component architecture with reusable UI primitives
- Responsive design with mobile-first approach
- Dark/light theme support through CSS variables

## Key Components

### Authentication & Authorization
- Session-based authentication using Express sessions
- Role-based access control (admin/user roles)
- Protected routes with authentication guards
- Password hashing and verification

### Database Schema
- **Users** - Authentication and profile management
- **Clients** - Customer information and contact details
- **Products** - Product catalog with pricing and inventory
- **Invoices** - Invoice header information
- **Invoice Lines** - Line items for each invoice
- **Company Configuration** - Business settings and branding
- **Logs** - System activity tracking

### Business Logic
- Invoice numbering system with automatic increment
- Tax calculations and totals
- Multi-line invoice support
- Client and product search functionality
- PDF generation for invoices

## Data Flow

1. **Authentication Flow**: User logs in → Session created → JWT-like session validation on protected routes
2. **Invoice Creation**: Select client → Add products/services → Calculate totals → Save to database → Generate PDF
3. **Data Management**: CRUD operations for clients, products, and invoices with real-time updates
4. **Search & Filtering**: Real-time search across clients and products with debounced queries

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless** - PostgreSQL serverless driver
- **drizzle-orm** and **drizzle-kit** - Database ORM and migrations
- **@radix-ui** components - Accessible UI primitives
- **jspdf** - PDF generation
- **recharts** - Data visualization for dashboard

### Development Tools
- **TypeScript** for type safety
- **ESBuild** for production builds
- **PostCSS** with Autoprefixer for CSS processing

## Deployment Strategy

### Development
- Vite dev server with HMR for frontend
- tsx for TypeScript execution in development
- Replit-specific plugins for development environment

### Production Build
- Vite builds frontend to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Static file serving through Express
- Environment variables for database connection

### Database
- Drizzle migrations in `migrations/` directory
- PostgreSQL schema defined in `shared/schema.ts`
- Connection through DATABASE_URL environment variable

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 30, 2025. Initial setup
- June 30, 2025. Completed modernization of FacturasApp:
  - Migrated from Angular to React 18 with TypeScript
  - Implemented modern UI with Tailwind CSS and shadcn/ui components
  - Configured Supabase database integration (DATABASE_URL provided)
  - Created complete in-memory storage implementation for development
  - All original features preserved: authentication, invoicing, client/product management, PDF generation
  - Fixed TypeScript compatibility issues and dependency conflicts
  - Application ready for production deployment

## Current Status
- Application architecture: React frontend + Express backend + PostgreSQL (Supabase)
- Database: In-memory storage active (MemStorage), Supabase configured
- Authentication: Session-based with admin user (admin@facturas.com / admin123)
- All core functionality implemented and tested

## Deployment Ready
- ✅ Vercel configuration (vercel.json) created
- ✅ Docker configuration (Dockerfile) ready  
- ✅ Deployment script (deploy.sh) available
- ✅ Environment variables documented (.env.example)
- ✅ Complete deployment guide (DEPLOYMENT.md)
- ✅ Production README with installation instructions
- ✅ All CSS issues resolved for production build
- ✅ Optimized build configuration

## Deployment Options
1. **Vercel** (Recommended) - One-click deployment with vercel.json
2. **Docker** - Containerized deployment for any cloud provider
3. **VPS/Manual** - Traditional server deployment with PM2
4. **Railway/Render** - Alternative cloud platforms

Next steps: Choose deployment platform and configure DATABASE_URL