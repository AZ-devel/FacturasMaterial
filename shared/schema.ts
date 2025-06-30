import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabla de usuarios
export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  rol: text("rol").notNull().default("usuario"), // "admin", "usuario"
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabla de clientes
export const clientes = pgTable("clientes", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email"),
  telefono: text("telefono"),
  direccion: text("direccion"),
  ciudad: text("ciudad"),
  codigoPostal: text("codigo_postal"),
  pais: text("pais").default("España"),
  nif: text("nif"),
  activo: boolean("activo").notNull().default(true),
  usuarioId: integer("usuario_id").references(() => usuarios.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabla de productos
export const productos = pgTable("productos", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  precio: decimal("precio", { precision: 10, scale: 2 }).notNull(),
  categoria: text("categoria"),
  codigo: text("codigo"),
  stock: integer("stock").default(0),
  activo: boolean("activo").notNull().default(true),
  usuarioId: integer("usuario_id").references(() => usuarios.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabla de facturas
export const facturas = pgTable("facturas", {
  id: serial("id").primaryKey(),
  numero: text("numero").notNull().unique(),
  clienteId: integer("cliente_id").references(() => clientes.id).notNull(),
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
  fecha: timestamp("fecha").defaultNow(),
  fechaVencimiento: timestamp("fecha_vencimiento"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  iva: decimal("iva", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  estado: text("estado").notNull().default("pendiente"), // "pendiente", "pagada", "vencida", "cancelada"
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabla de líneas de factura
export const lineasFactura = pgTable("lineas_factura", {
  id: serial("id").primaryKey(),
  facturaId: integer("factura_id").references(() => facturas.id).notNull(),
  productoId: integer("producto_id").references(() => productos.id),
  descripcion: text("descripcion").notNull(),
  cantidad: integer("cantidad").notNull(),
  precio: decimal("precio", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

// Tabla de configuración de empresa
export const configuracionEmpresa = pgTable("configuracion_empresa", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  direccion: text("direccion"),
  telefono: text("telefono"),
  email: text("email"),
  nif: text("nif"),
  logo: text("logo"), // URL del logo
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
});

// Tabla de logs
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id),
  accion: text("accion").notNull(),
  entidad: text("entidad"), // "factura", "cliente", "producto", etc.
  entidadId: integer("entidad_id"),
  detalles: json("detalles"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas de inserción
export const insertUsuarioSchema = createInsertSchema(usuarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClienteSchema = createInsertSchema(clientes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductoSchema = createInsertSchema(productos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFacturaSchema = createInsertSchema(facturas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLineaFacturaSchema = createInsertSchema(lineasFactura).omit({
  id: true,
});

export const insertConfiguracionEmpresaSchema = createInsertSchema(configuracionEmpresa).omit({
  id: true,
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  createdAt: true,
});

// Schemas de login
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registroSchema = insertUsuarioSchema.extend({
  confirmarPassword: z.string(),
}).refine((data) => data.password === data.confirmarPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarPassword"],
});

// Tipos
export type Usuario = typeof usuarios.$inferSelect;
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;
export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = z.infer<typeof insertClienteSchema>;
export type Producto = typeof productos.$inferSelect;
export type InsertProducto = z.infer<typeof insertProductoSchema>;
export type Factura = typeof facturas.$inferSelect;
export type InsertFactura = z.infer<typeof insertFacturaSchema>;
export type LineaFactura = typeof lineasFactura.$inferSelect;
export type InsertLineaFactura = z.infer<typeof insertLineaFacturaSchema>;
export type ConfiguracionEmpresa = typeof configuracionEmpresa.$inferSelect;
export type InsertConfiguracionEmpresa = z.infer<typeof insertConfiguracionEmpresaSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

// Tipos extendidos para relaciones
export type FacturaCompleta = Factura & {
  cliente: Cliente;
  usuario: Usuario;
  lineas: LineaFactura[];
};

export type ClienteConFacturas = Cliente & {
  facturas: Factura[];
};
