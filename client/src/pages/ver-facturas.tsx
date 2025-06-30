import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadFacturaPDF, previewFacturaPDF } from "@/lib/pdf-generator";
import { Search, Eye, Download, Edit, Trash2, Filter, FileText, Loader2 } from "lucide-react";
import type { FacturaCompleta } from "@shared/schema";

export default function VerFacturas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener todas las facturas
  const { data: facturas, isLoading } = useQuery({
    queryKey: ["/api/facturas"],
  });

  // Query para obtener configuración de empresa (para PDFs)
  const { data: configuracionEmpresa } = useQuery({
    queryKey: ["/api/configuracion-empresa"],
  });

  // Mutación para eliminar factura
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/facturas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facturas"] });
      toast({
        title: "Factura eliminada",
        description: "La factura ha sido eliminada correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la factura",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(numAmount);
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      pagada: "bg-green-100 text-green-700 hover:bg-green-100",
      pendiente: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
      vencida: "bg-red-100 text-red-700 hover:bg-red-100",
      cancelada: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    };

    return (
      <Badge className={variants[estado as keyof typeof variants] || variants.pendiente}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  const handleViewPDF = (factura: FacturaCompleta) => {
    try {
      previewFacturaPDF({ factura, configuracionEmpresa });
      toast({
        title: "PDF generado",
        description: "El PDF se ha abierto en una nueva ventana.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = (factura: FacturaCompleta) => {
    try {
      downloadFacturaPDF({ factura, configuracionEmpresa });
      toast({
        title: "PDF descargado",
        description: "El PDF se ha descargado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descargar el PDF",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (factura: FacturaCompleta) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la factura ${factura.numero}?`)) {
      deleteMutation.mutate(factura.id);
    }
  };

  // Filtrar facturas
  const facturasFiltradas = facturas?.filter((factura: FacturaCompleta) => {
    const matchesSearch = !searchQuery || 
      factura.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      factura.cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEstado = filtroEstado === "todos" || factura.estado === filtroEstado;
    
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-600">Consulta y gestiona todas las facturas</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="card-material">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por número de factura o cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-material"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagada">Pagada</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de facturas */}
      <Card className="card-material">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Lista de Facturas
              {facturasFiltradas && ` (${facturasFiltradas.length})`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !facturasFiltradas || facturasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filtroEstado !== "todos" 
                  ? "No se encontraron facturas" 
                  : "No hay facturas registradas"
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filtroEstado !== "todos"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primera factura"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facturasFiltradas.map((factura: FacturaCompleta) => (
                    <TableRow key={factura.id} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {factura.numero}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {factura.cliente.nombre}
                          </p>
                          {factura.cliente.email && (
                            <p className="text-sm text-gray-500">
                              {factura.cliente.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(factura.fecha!)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {factura.fechaVencimiento 
                          ? formatDate(factura.fechaVencimiento)
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(factura.total)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getEstadoBadge(factura.estado)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewPDF(factura)}
                            className="h-8 w-8 text-gray-400 hover:text-primary"
                            title="Ver PDF"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadPDF(factura)}
                            className="h-8 w-8 text-gray-400 hover:text-green-600"
                            title="Descargar PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-blue-600"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(factura)}
                            className="h-8 w-8 text-gray-400 hover:text-red-600"
                            title="Eliminar"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
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
