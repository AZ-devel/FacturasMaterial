import { 
  usuarios, clientes, productos, facturas, lineasFactura, 
  configuracionEmpresa, logs,
  type Usuario, type InsertUsuario,
  type Cliente, type InsertCliente,
  type Producto, type InsertProducto,
  type Factura, type InsertFactura, type FacturaCompleta,
  type LineaFactura, type InsertLineaFactura,
  type ConfiguracionEmpresa, type InsertConfiguracionEmpresa,
  type Log, type InsertLog
} from "@shared/schema";
import * as bcrypt from "bcryptjs";

export interface IStorage {
  // Usuarios
  getUsuario(id: number): Promise<Usuario | undefined>;
  getUsuarioByEmail(email: string): Promise<Usuario | undefined>;
  createUsuario(usuario: InsertUsuario): Promise<Usuario>;
  updateUsuario(id: number, usuario: Partial<InsertUsuario>): Promise<Usuario | undefined>;
  verificarPassword(email: string, password: string): Promise<Usuario | null>;

  // Clientes
  getClientes(usuarioId: number): Promise<Cliente[]>;
  getCliente(id: number, usuarioId: number): Promise<Cliente | undefined>;
  createCliente(cliente: InsertCliente): Promise<Cliente>;
  updateCliente(id: number, cliente: Partial<InsertCliente>, usuarioId: number): Promise<Cliente | undefined>;
  deleteCliente(id: number, usuarioId: number): Promise<boolean>;
  buscarClientes(query: string, usuarioId: number): Promise<Cliente[]>;

  // Productos
  getProductos(usuarioId: number): Promise<Producto[]>;
  getProducto(id: number, usuarioId: number): Promise<Producto | undefined>;
  createProducto(producto: InsertProducto): Promise<Producto>;
  updateProducto(id: number, producto: Partial<InsertProducto>, usuarioId: number): Promise<Producto | undefined>;
  deleteProducto(id: number, usuarioId: number): Promise<boolean>;
  buscarProductos(query: string, usuarioId: number): Promise<Producto[]>;

  // Facturas
  getFacturas(usuarioId: number): Promise<FacturaCompleta[]>;
  getFactura(id: number, usuarioId: number): Promise<FacturaCompleta | undefined>;
  createFactura(factura: InsertFactura, lineas: InsertLineaFactura[]): Promise<FacturaCompleta>;
  updateFactura(id: number, factura: Partial<InsertFactura>, usuarioId: number): Promise<FacturaCompleta | undefined>;
  deleteFactura(id: number, usuarioId: number): Promise<boolean>;
  getProximoNumeroFactura(usuarioId: number): Promise<string>;

  // Configuración de empresa
  getConfiguracionEmpresa(usuarioId: number): Promise<ConfiguracionEmpresa | undefined>;
  saveConfiguracionEmpresa(config: InsertConfiguracionEmpresa): Promise<ConfiguracionEmpresa>;

  // Logs
  createLog(log: InsertLog): Promise<Log>;
  getLogs(usuarioId: number): Promise<Log[]>;

  // Estadísticas
  getEstadisticas(usuarioId: number): Promise<any>;
}

export class MemStorage implements IStorage {
  private usuarios: Map<number, Usuario>;
  private clientes: Map<number, Cliente>;
  private productos: Map<number, Producto>;
  private facturas: Map<number, Factura>;
  private lineasFactura: Map<number, LineaFactura>;
  private configuracionEmpresas: Map<number, ConfiguracionEmpresa>;
  private logs: Map<number, Log>;
  private currentId: number;

  constructor() {
    this.usuarios = new Map();
    this.clientes = new Map();
    this.productos = new Map();
    this.facturas = new Map();
    this.lineasFactura = new Map();
    this.configuracionEmpresas = new Map();
    this.logs = new Map();
    this.currentId = 1;

    // Crear usuario administrador por defecto
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminUser: Usuario = {
      id: this.currentId++,
      email: "admin@facturas.com",
      password: hashedPassword,
      nombre: "Administrador",
      apellido: "Sistema",
      rol: "admin",
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.usuarios.set(adminUser.id, adminUser);
  }

  // Usuarios
  async getUsuario(id: number): Promise<Usuario | undefined> {
    return this.usuarios.get(id);
  }

  async getUsuarioByEmail(email: string): Promise<Usuario | undefined> {
    return Array.from(this.usuarios.values()).find(u => u.email === email);
  }

  async createUsuario(insertUsuario: InsertUsuario): Promise<Usuario> {
    const hashedPassword = await bcrypt.hash(insertUsuario.password, 10);
    const usuario: Usuario = {
      id: this.currentId++,
      email: insertUsuario.email,
      password: hashedPassword,
      nombre: insertUsuario.nombre,
      apellido: insertUsuario.apellido,
      rol: insertUsuario.rol || "user",
      activo: insertUsuario.activo ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.usuarios.set(usuario.id, usuario);
    return usuario;
  }

  async updateUsuario(id: number, updateData: Partial<InsertUsuario>): Promise<Usuario | undefined> {
    const usuario = this.usuarios.get(id);
    if (!usuario) return undefined;

    const updatedUsuario = {
      ...usuario,
      ...updateData,
      updatedAt: new Date(),
    };
    this.usuarios.set(id, updatedUsuario);
    return updatedUsuario;
  }

  async verificarPassword(email: string, password: string): Promise<Usuario | null> {
    const usuario = await this.getUsuarioByEmail(email);
    if (!usuario) return null;

    const isValid = await bcrypt.compare(password, usuario.password);
    return isValid ? usuario : null;
  }

  // Clientes
  async getClientes(usuarioId: number): Promise<Cliente[]> {
    return Array.from(this.clientes.values())
      .filter(c => c.usuarioId === usuarioId && c.activo);
  }

  async getCliente(id: number, usuarioId: number): Promise<Cliente | undefined> {
    const cliente = this.clientes.get(id);
    return cliente && cliente.usuarioId === usuarioId ? cliente : undefined;
  }

  async createCliente(insertCliente: InsertCliente): Promise<Cliente> {
    const cliente: Cliente = {
      id: this.currentId++,
      email: insertCliente.email ?? null,
      nombre: insertCliente.nombre,
      activo: insertCliente.activo ?? true,
      usuarioId: insertCliente.usuarioId ?? null,
      telefono: insertCliente.telefono ?? null,
      direccion: insertCliente.direccion ?? null,
      ciudad: insertCliente.ciudad ?? null,
      codigoPostal: insertCliente.codigoPostal ?? null,
      pais: insertCliente.pais ?? null,
      nif: insertCliente.nif ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.clientes.set(cliente.id, cliente);
    return cliente;
  }

  async updateCliente(id: number, updateData: Partial<InsertCliente>, usuarioId: number): Promise<Cliente | undefined> {
    const cliente = this.clientes.get(id);
    if (!cliente || cliente.usuarioId !== usuarioId) return undefined;

    const updatedCliente = {
      ...cliente,
      ...updateData,
      updatedAt: new Date(),
    };
    this.clientes.set(id, updatedCliente);
    return updatedCliente;
  }

  async deleteCliente(id: number, usuarioId: number): Promise<boolean> {
    const cliente = this.clientes.get(id);
    if (!cliente || cliente.usuarioId !== usuarioId) return false;

    cliente.activo = false;
    this.clientes.set(id, cliente);
    return true;
  }

  async buscarClientes(query: string, usuarioId: number): Promise<Cliente[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.clientes.values())
      .filter(c => 
        c.usuarioId === usuarioId && 
        c.activo &&
        (c.nombre.toLowerCase().includes(searchTerm) ||
         c.email?.toLowerCase().includes(searchTerm) ||
         c.nif?.toLowerCase().includes(searchTerm))
      );
  }

  // Productos
  async getProductos(usuarioId: number): Promise<Producto[]> {
    return Array.from(this.productos.values())
      .filter(p => p.usuarioId === usuarioId && p.activo);
  }

  async getProducto(id: number, usuarioId: number): Promise<Producto | undefined> {
    const producto = this.productos.get(id);
    return producto && producto.usuarioId === usuarioId ? producto : undefined;
  }

  async createProducto(insertProducto: InsertProducto): Promise<Producto> {
    const producto: Producto = {
      id: this.currentId++,
      nombre: insertProducto.nombre,
      activo: insertProducto.activo ?? true,
      usuarioId: insertProducto.usuarioId ?? null,
      descripcion: insertProducto.descripcion ?? null,
      precio: insertProducto.precio,
      categoria: insertProducto.categoria ?? null,
      codigo: insertProducto.codigo ?? null,
      stock: insertProducto.stock ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.productos.set(producto.id, producto);
    return producto;
  }

  async updateProducto(id: number, updateData: Partial<InsertProducto>, usuarioId: number): Promise<Producto | undefined> {
    const producto = this.productos.get(id);
    if (!producto || producto.usuarioId !== usuarioId) return undefined;

    const updatedProducto = {
      ...producto,
      ...updateData,
      updatedAt: new Date(),
    };
    this.productos.set(id, updatedProducto);
    return updatedProducto;
  }

  async deleteProducto(id: number, usuarioId: number): Promise<boolean> {
    const producto = this.productos.get(id);
    if (!producto || producto.usuarioId !== usuarioId) return false;

    producto.activo = false;
    this.productos.set(id, producto);
    return true;
  }

  async buscarProductos(query: string, usuarioId: number): Promise<Producto[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.productos.values())
      .filter(p => 
        p.usuarioId === usuarioId && 
        p.activo &&
        (p.nombre.toLowerCase().includes(searchTerm) ||
         p.descripcion?.toLowerCase().includes(searchTerm) ||
         p.codigo?.toLowerCase().includes(searchTerm))
      );
  }

  // Facturas
  async getFacturas(usuarioId: number): Promise<FacturaCompleta[]> {
    const facturas = Array.from(this.facturas.values())
      .filter(f => f.usuarioId === usuarioId);
    
    return facturas.map(factura => ({
      ...factura,
      cliente: this.clientes.get(factura.clienteId)!,
      usuario: this.usuarios.get(factura.usuarioId)!,
      lineas: Array.from(this.lineasFactura.values())
        .filter(l => l.facturaId === factura.id)
    }));
  }

  async getFactura(id: number, usuarioId: number): Promise<FacturaCompleta | undefined> {
    const factura = this.facturas.get(id);
    if (!factura || factura.usuarioId !== usuarioId) return undefined;

    return {
      ...factura,
      cliente: this.clientes.get(factura.clienteId)!,
      usuario: this.usuarios.get(factura.usuarioId)!,
      lineas: Array.from(this.lineasFactura.values())
        .filter(l => l.facturaId === factura.id)
    };
  }

  async createFactura(insertFactura: InsertFactura, lineas: InsertLineaFactura[]): Promise<FacturaCompleta> {
    const factura: Factura = {
      id: this.currentId++,
      usuarioId: insertFactura.usuarioId,
      numero: insertFactura.numero,
      clienteId: insertFactura.clienteId,
      fecha: insertFactura.fecha ?? null,
      fechaVencimiento: insertFactura.fechaVencimiento ?? null,
      subtotal: insertFactura.subtotal,
      iva: insertFactura.iva,
      total: insertFactura.total,
      estado: insertFactura.estado ?? "pendiente",
      notas: insertFactura.notas ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.facturas.set(factura.id, factura);

    // Crear líneas de factura
    const lineasCreadas: LineaFactura[] = lineas.map(linea => {
      const lineaCompleta: LineaFactura = {
        id: this.currentId++,
        descripcion: linea.descripcion,
        precio: linea.precio,
        total: linea.total,
        facturaId: factura.id,
        productoId: linea.productoId ?? null,
        cantidad: linea.cantidad,
      };
      this.lineasFactura.set(lineaCompleta.id, lineaCompleta);
      return lineaCompleta;
    });

    return {
      ...factura,
      cliente: this.clientes.get(factura.clienteId)!,
      usuario: this.usuarios.get(factura.usuarioId)!,
      lineas: lineasCreadas
    };
  }

  async updateFactura(id: number, updateData: Partial<InsertFactura>, usuarioId: number): Promise<FacturaCompleta | undefined> {
    const factura = this.facturas.get(id);
    if (!factura || factura.usuarioId !== usuarioId) return undefined;

    const updatedFactura = {
      ...factura,
      ...updateData,
      updatedAt: new Date(),
    };
    this.facturas.set(id, updatedFactura);

    return {
      ...updatedFactura,
      cliente: this.clientes.get(updatedFactura.clienteId)!,
      usuario: this.usuarios.get(updatedFactura.usuarioId)!,
      lineas: Array.from(this.lineasFactura.values())
        .filter(l => l.facturaId === updatedFactura.id)
    };
  }

  async deleteFactura(id: number, usuarioId: number): Promise<boolean> {
    const factura = this.facturas.get(id);
    if (!factura || factura.usuarioId !== usuarioId) return false;

    this.facturas.delete(id);
    // Eliminar líneas asociadas
    Array.from(this.lineasFactura.entries())
      .filter(([_, linea]) => linea.facturaId === id)
      .forEach(([lineaId]) => this.lineasFactura.delete(lineaId));
    
    return true;
  }

  async getProximoNumeroFactura(usuarioId: number): Promise<string> {
    const year = new Date().getFullYear();
    const facturas = Array.from(this.facturas.values())
      .filter(f => f.usuarioId === usuarioId);
    
    const nextNumber = facturas.length + 1;
    return `FAC-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  // Configuración de empresa
  async getConfiguracionEmpresa(usuarioId: number): Promise<ConfiguracionEmpresa | undefined> {
    return Array.from(this.configuracionEmpresas.values())
      .find(c => c.usuarioId === usuarioId);
  }

  async saveConfiguracionEmpresa(insertConfig: InsertConfiguracionEmpresa): Promise<ConfiguracionEmpresa> {
    const existingConfig = Array.from(this.configuracionEmpresas.values())
      .find(c => c.usuarioId === insertConfig.usuarioId);

    if (existingConfig) {
      const updatedConfig = { ...existingConfig, ...insertConfig };
      this.configuracionEmpresas.set(existingConfig.id, updatedConfig);
      return updatedConfig;
    } else {
      const config: ConfiguracionEmpresa = {
        id: this.currentId++,
        email: insertConfig.email ?? null,
        nombre: insertConfig.nombre,
        telefono: insertConfig.telefono ?? null,
        direccion: insertConfig.direccion ?? null,
        nif: insertConfig.nif ?? null,
        usuarioId: insertConfig.usuarioId,
        logo: insertConfig.logo ?? null,
      };
      this.configuracionEmpresas.set(config.id, config);
      return config;
    }
  }

  // Logs
  async createLog(insertLog: InsertLog): Promise<Log> {
    const log: Log = {
      id: this.currentId++,
      createdAt: new Date(),
      usuarioId: insertLog.usuarioId ?? null,
      accion: insertLog.accion,
      entidad: insertLog.entidad ?? null,
      entidadId: insertLog.entidadId ?? null,
      detalles: insertLog.detalles ?? null,
      ip: insertLog.ip ?? null,
      userAgent: insertLog.userAgent ?? null,
    };
    this.logs.set(log.id, log);
    return log;
  }

  async getLogs(usuarioId: number): Promise<Log[]> {
    return Array.from(this.logs.values())
      .filter(l => l.usuarioId === usuarioId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  // Estadísticas
  async getEstadisticas(usuarioId: number): Promise<any> {
    const facturas = Array.from(this.facturas.values())
      .filter(f => f.usuarioId === usuarioId);
    
    const clientes = Array.from(this.clientes.values())
      .filter(c => c.usuarioId === usuarioId && c.activo);
    
    const productos = Array.from(this.productos.values())
      .filter(p => p.usuarioId === usuarioId && p.activo);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const facturasEsteMes = facturas.filter(f => {
      const facturaDate = new Date(f.fecha!);
      return facturaDate.getMonth() === currentMonth && 
             facturaDate.getFullYear() === currentYear;
    });

    const ingresosTotales = facturas
      .filter(f => f.estado === 'pagada')
      .reduce((sum, f) => sum + parseFloat(f.total), 0);

    return {
      facturasEsteMes: facturasEsteMes.length,
      ingresosTotales: ingresosTotales,
      clientesActivos: clientes.length,
      totalProductos: productos.length,
      facturasPorMes: this.getFacturasPorMes(facturas),
      facturasRecientes: facturas
        .sort((a, b) => new Date(b.fecha!).getTime() - new Date(a.fecha!).getTime())
        .slice(0, 5)
    };
  }

  private getFacturasPorMes(facturas: Factura[]): any[] {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                   'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const currentYear = new Date().getFullYear();
    const data = [];

    for (let i = 0; i < 12; i++) {
      const facturasDelMes = facturas.filter(f => {
        const facturaDate = new Date(f.fecha!);
        return facturaDate.getMonth() === i && 
               facturaDate.getFullYear() === currentYear;
      });

      const ingresos = facturasDelMes
        .filter(f => f.estado === 'pagada')
        .reduce((sum, f) => sum + parseFloat(f.total), 0);

      data.push({
        mes: meses[i],
        ingresos: ingresos,
        cantidad: facturasDelMes.length
      });
    }

    return data;
  }
}

export const storage = new MemStorage();
