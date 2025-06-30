import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { canAccessLogs } from "@/lib/auth";
import { Search, Filter, History, Loader2, AlertCircle } from "lucide-react";
import type { Log } from "@shared/schema";

export default function Logs() {
  const { usuario } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroAccion, setFiltroAccion] = useState<string>("todas");
  const [filtroEntidad, setFiltroEntidad] = useState<string>("todas");

  // Verificar permisos
  if (!usuario || !canAccessLogs(usuario)) {
    return (
      <div className="space-y-6 fade-in">
        <Card className="card-material">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600">
              No tienes permisos para acceder a los logs del sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Query para obtener logs
  const { data: logs, isLoading } = useQuery({
    queryKey: ["/api/logs"],
  });

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  };

  const getAccionBadge = (accion: string) => {
    const variants = {
      crear: "bg-green-100 text-green-700",
      actualizar: "bg-blue-100 text-blue-700",
      eliminar: "bg-red-100 text-red-700",
      login: "bg-purple-100 text-purple-700",
      logout: "bg-gray-100 text-gray-700",
      registro: "bg-indigo-100 text-indigo-700",
      configurar: "bg-orange-100 text-orange-700",
    };

    return (
      <Badge className={variants[accion as keyof typeof variants] || "bg-gray-100 text-gray-700"}>
        {accion.charAt(0).toUpperCase() + accion.slice(1)}
      </Badge>
    );
  };

  const getEntidadBadge = (entidad: string | null) => {
    if (!entidad) return null;
    
    const variants = {
      factura: "bg-blue-50 text-blue-700",
      cliente: "bg-green-50 text-green-700",
      producto: "bg-purple-50 text-purple-700",
      usuario: "bg-indigo-50 text-indigo-700",
      empresa: "bg-orange-50 text-orange-700",
    };

    return (
      <Badge variant="outline" className={variants[entidad as keyof typeof variants] || "bg-gray-50 text-gray-700"}>
        {entidad.charAt(0).toUpperCase() + entidad.slice(1)}
      </Badge>
    );
  };

  // Filtrar logs
  const logsFiltrados = logs?.filter((log: Log) => {
    const matchesSearch = !searchQuery || 
      log.accion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entidad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAccion = filtroAccion === "todas" || log.accion === filtroAccion;
    const matchesEntidad = filtroEntidad === "todas" || log.entidad === filtroEntidad;
    
    return matchesSearch && matchesAccion && matchesEntidad;
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <History className="h-6 w-6 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs del Sistema</h1>
          <p className="text-gray-600">Registro de actividades y auditoría</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="card-material">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por acción, entidad o IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-material"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={filtroAccion} onValueChange={setFiltroAccion}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="crear">Crear</SelectItem>
                  <SelectItem value="actualizar">Actualizar</SelectItem>
                  <SelectItem value="eliminar">Eliminar</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="registro">Registro</SelectItem>
                  <SelectItem value="configurar">Configurar</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filtroEntidad} onValueChange={setFiltroEntidad}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="factura">Factura</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="producto">Producto</SelectItem>
                  <SelectItem value="usuario">Usuario</SelectItem>
                  <SelectItem value="empresa">Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de logs */}
      <Card className="card-material">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Registro de Actividades
              {logsFiltrados && ` (${logsFiltrados.length})`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !logsFiltrados || logsFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <History className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filtroAccion !== "todas" || filtroEntidad !== "todas"
                  ? "No se encontraron logs" 
                  : "No hay logs registrados"
                }
              </h3>
              <p className="text-gray-600">
                {searchQuery || filtroAccion !== "todas" || filtroEntidad !== "todas"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Las actividades aparecerán aquí cuando ocurran"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsFiltrados.map((log: Log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50">
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(log.createdAt!)}
                      </TableCell>
                      <TableCell>
                        {getAccionBadge(log.accion)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getEntidadBadge(log.entidad)}
                          {log.entidadId && (
                            <span className="text-xs text-gray-500">
                              #{log.entidadId}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {log.detalles && (
                          <div className="text-sm text-gray-600 truncate">
                            {typeof log.detalles === 'object' 
                              ? JSON.stringify(log.detalles)
                              : log.detalles.toString()
                            }
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-mono">
                        {log.ip || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {log.usuarioId ? `Usuario #${log.usuarioId}` : "Sistema"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
