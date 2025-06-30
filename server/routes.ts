import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, registroSchema, 
  insertClienteSchema, insertProductoSchema, 
  insertFacturaSchema, insertLineaFacturaSchema,
  insertConfiguracionEmpresaSchema
} from "@shared/schema";
import session from "express-session";
import * as bcrypt from "bcryptjs";

// Configurar sesiones
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar sesiones
  app.use(session({
    secret: process.env.SESSION_SECRET || "facturas-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // cambiar a true en producción con HTTPS
      maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
  }));

  // Middleware de autenticación
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "No autorizado" });
    }
    next();
  };

  // Rutas de autenticación
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const usuario = await storage.verificarPassword(data.email, data.password);
      
      if (!usuario) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      req.session.userId = usuario.id;
      
      // Log de login
      await storage.createLog({
        usuarioId: usuario.id,
        accion: "login",
        entidad: "usuario",
        entidadId: usuario.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ 
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.post("/api/auth/registro", async (req, res) => {
    try {
      const data = registroSchema.parse(req.body);
      
      // Verificar si el email ya existe
      const existingUser = await storage.getUsuarioByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "El email ya está registrado" });
      }

      const usuario = await storage.createUsuario({
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        apellido: data.apellido,
        rol: data.rol || "usuario",
        activo: true
      });

      req.session.userId = usuario.id;

      // Log de registro
      await storage.createLog({
        usuarioId: usuario.id,
        accion: "registro",
        entidad: "usuario",
        entidadId: usuario.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ 
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const usuario = await storage.getUsuario(req.session.userId!);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json({
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol
      });
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Rutas de clientes
  app.get("/api/clientes", requireAuth, async (req, res) => {
    try {
      const clientes = await storage.getClientes(req.session.userId!);
      res.json(clientes);
    } catch (error) {
      console.error("Error obteniendo clientes:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.get("/api/clientes/buscar", requireAuth, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Query requerido" });
      }
      
      const clientes = await storage.buscarClientes(query, req.session.userId!);
      res.json(clientes);
    } catch (error) {
      console.error("Error buscando clientes:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.post("/api/clientes", requireAuth, async (req, res) => {
    try {
      const data = insertClienteSchema.parse({
        ...req.body,
        usuarioId: req.session.userId
      });
      
      const cliente = await storage.createCliente(data);
      
      // Log de creación
      await storage.createLog({
        usuarioId: req.session.userId!,
        accion: "crear",
        entidad: "cliente",
        entidadId: cliente.id,
        detalles: { nombre: cliente.nombre },
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(cliente);
    } catch (error) {
      console.error("Error creando cliente:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.put("/api/clientes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertClienteSchema.partial().parse(req.body);
      
      const cliente = await storage.updateCliente(id, data, req.session.userId!);
      if (!cliente) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      // Log de actualización
      await storage.createLog({
        usuarioId: req.session.userId!,
        accion: "actualizar",
        entidad: "cliente",
        entidadId: cliente.id,
        detalles: { nombre: cliente.nombre },
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(cliente);
    } catch (error) {
      console.error("Error actualizando cliente:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.delete("/api/clientes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCliente(id, req.session.userId!);
      
      if (!success) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      // Log de eliminación
      await storage.createLog({
        usuarioId: req.session.userId!,
        accion: "eliminar",
        entidad: "cliente",
        entidadId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error eliminando cliente:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Rutas de productos
  app.get("/api/productos", requireAuth, async (req, res) => {
    try {
      const productos = await storage.getProductos(req.session.userId!);
      res.json(productos);
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.get("/api/productos/buscar", requireAuth, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Query requerido" });
      }
      
      const productos = await storage.buscarProductos(query, req.session.userId!);
      res.json(productos);
    } catch (error) {
      console.error("Error buscando productos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.post("/api/productos", requireAuth, async (req, res) => {
    try {
      const data = insertProductoSchema.parse({
        ...req.body,
        usuarioId: req.session.userId
      });
      
      const producto = await storage.createProducto(data);
      
      // Log de creación
      await storage.createLog({
        usuarioId: req.session.userId!,
        accion: "crear",
        entidad: "producto",
        entidadId: producto.id,
        detalles: { nombre: producto.nombre },
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(producto);
    } catch (error) {
      console.error("Error creando producto:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.put("/api/productos/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertProductoSchema.partial().parse(req.body);
      
      const producto = await storage.updateProducto(id, data, req.session.userId!);
      if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      // Log de actualización
      await storage.createLog({
        usuarioId: req.session.userId!,
        accion: "actualizar",
        entidad: "producto",
        entidadId: producto.id,
        detalles: { nombre: producto.nombre },
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(producto);
    } catch (error) {
      console.error("Error actualizando producto:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.delete("/api/productos/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProducto(id, req.session.userId!);
      
      if (!success) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      // Log de eliminación
      await storage.createLog({
        usuarioId: req.session.userId!,
        accion: "eliminar",
        entidad: "producto",
        entidadId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error eliminando producto:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Rutas de facturas
  app.get("/api/facturas", requireAuth, async (req, res) => {
    try {
      const facturas = await storage.getFacturas(req.session.userId!);
      res.json(facturas);
    } catch (error) {
      console.error("Error obteniendo facturas:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.get("/api/facturas/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const factura = await storage.getFactura(id, req.session.userId!);
      
      if (!factura) {
        return res.status(404).json({ error: "Factura no encontrada" });
      }

      res.json(factura);
    } catch (error) {
      console.error("Error obteniendo factura:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.post("/api/facturas", requireAuth, async (req, res) => {
    try {
      const { factura: facturaData, lineas } = req.body;
      
      // Obtener próximo número de factura
      const numero = await storage.getProximoNumeroFactura(req.session.userId!);
      
      const facturaCompleta = insertFacturaSchema.parse({
        ...facturaData,
        numero,
        usuarioId: req.session.userId
      });
      
      const lineasValidadas = lineas.map((linea: any) => 
        insertLineaFacturaSchema.parse(linea)
      );
      
      const factura = await storage.createFactura(facturaCompleta, lineasValidadas);
      
      // Log de creación
      await storage.createLog({
        usuarioId: req.session.userId!,
        accion: "crear",
        entidad: "factura",
        entidadId: factura.id,
        detalles: { numero: factura.numero, total: factura.total },
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(factura);
    } catch (error) {
      console.error("Error creando factura:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.get("/api/facturas/proximo-numero", requireAuth, async (req, res) => {
    try {
      const numero = await storage.getProximoNumeroFactura(req.session.userId!);
      res.json({ numero });
    } catch (error) {
      console.error("Error obteniendo próximo número:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Rutas de configuración de empresa
  app.get("/api/configuracion-empresa", requireAuth, async (req, res) => {
    try {
      const config = await storage.getConfiguracionEmpresa(req.session.userId!);
      res.json(config || null);
    } catch (error) {
      console.error("Error obteniendo configuración:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.post("/api/configuracion-empresa", requireAuth, async (req, res) => {
    try {
      const data = insertConfiguracionEmpresaSchema.parse({
        ...req.body,
        usuarioId: req.session.userId
      });
      
      const config = await storage.saveConfiguracionEmpresa(data);
      
      // Log de configuración
      await storage.createLog({
        usuarioId: req.session.userId!,
        accion: "configurar",
        entidad: "empresa",
        entidadId: config.id,
        detalles: { nombre: config.nombre },
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(config);
    } catch (error) {
      console.error("Error guardando configuración:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  // Rutas de logs
  app.get("/api/logs", requireAuth, async (req, res) => {
    try {
      const logs = await storage.getLogs(req.session.userId!);
      res.json(logs);
    } catch (error) {
      console.error("Error obteniendo logs:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Rutas de estadísticas
  app.get("/api/estadisticas", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getEstadisticas(req.session.userId!);
      res.json(stats);
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
