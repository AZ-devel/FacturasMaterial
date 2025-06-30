import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ProductoForm from "@/components/productos/producto-form";
import { Plus, Search, Edit, Trash2, Package, Loader2 } from "lucide-react";
import type { Producto } from "@shared/schema";

export default function Productos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener todos los productos
  const { data: productos, isLoading } = useQuery({
    queryKey: ["/api/productos"],
  });

  // Query para búsqueda de productos
  const { data: resultadosBusqueda, isLoading: isSearching } = useQuery({
    queryKey: ["/api/productos/buscar", searchQuery],
    enabled: searchQuery.length > 0,
    queryFn: async () => {
      const response = await fetch(`/api/productos/buscar?q=${encodeURIComponent(searchQuery)}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error en la búsqueda");
      return response.json();
    },
  });

  // Mutación para eliminar producto
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/productos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/productos"] });
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el producto",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (producto: Producto) => {
    setSelectedProducto(producto);
    setIsFormOpen(true);
  };

  const handleDelete = async (producto: Producto) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${producto.nombre}?`)) {
      deleteMutation.mutate(producto.id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedProducto(null);
    queryClient.invalidateQueries({ queryKey: ["/api/productos"] });
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(numAmount);
  };

  const productosToShow = searchQuery ? resultadosBusqueda : productos;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600">Administra tu catálogo de productos y servicios</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button 
              className="space-x-2 btn-primary"
              onClick={() => setSelectedProducto(null)}
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Producto</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProducto ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
            </DialogHeader>
            <ProductoForm
              producto={selectedProducto}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedProducto(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de búsqueda */}
      <Card className="card-material">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar productos por nombre, descripción o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-material"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de productos */}
      <Card className="card-material">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {searchQuery ? "Resultados de búsqueda" : "Lista de Productos"}
              {productosToShow && ` (${productosToShow.length})`}
            </span>
            {isSearching && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !productosToShow || productosToShow.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? "No se encontraron productos" : "No hay productos registrados"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? "Intenta con otros términos de búsqueda"
                  : "Comienza agregando tu primer producto o servicio"
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsFormOpen(true)} className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Producto
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosToShow.map((producto: Producto) => (
                    <TableRow key={producto.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{producto.nombre}</p>
                          {producto.descripcion && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {producto.descripcion}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {producto.codigo && (
                          <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {producto.codigo}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {producto.categoria && (
                          <Badge variant="outline" className="text-xs">
                            {producto.categoria}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(producto.precio)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${
                            (producto.stock || 0) <= 5 
                              ? 'text-red-600 font-medium' 
                              : 'text-gray-900'
                          }`}>
                            {producto.stock || 0}
                          </span>
                          {(producto.stock || 0) <= 5 && (
                            <Badge variant="destructive" className="text-xs">
                              Bajo stock
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={producto.activo 
                            ? "bg-green-100 text-green-700 hover:bg-green-100" 
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                          }
                        >
                          {producto.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(producto)}
                            className="h-8 w-8 text-gray-400 hover:text-blue-600"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(producto)}
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
