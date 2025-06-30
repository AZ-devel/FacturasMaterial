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
import ClienteForm from "@/components/clientes/cliente-form";
import ClienteSearch from "@/components/clientes/cliente-search";
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import type { Cliente } from "@shared/schema";

export default function Clientes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener todos los clientes
  const { data: clientes, isLoading } = useQuery({
    queryKey: ["/api/clientes"],
  });

  // Query para búsqueda de clientes
  const { data: resultadosBusqueda, isLoading: isSearching } = useQuery({
    queryKey: ["/api/clientes/buscar", searchQuery],
    enabled: searchQuery.length > 0,
    queryFn: async () => {
      const response = await fetch(`/api/clientes/buscar?q=${encodeURIComponent(searchQuery)}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error en la búsqueda");
      return response.json();
    },
  });

  // Mutación para eliminar cliente
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clientes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clientes"] });
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el cliente",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsFormOpen(true);
  };

  const handleDelete = async (cliente: Cliente) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${cliente.nombre}?`)) {
      deleteMutation.mutate(cliente.id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedCliente(null);
    queryClient.invalidateQueries({ queryKey: ["/api/clientes"] });
  };

  const clientesToShow = searchQuery ? resultadosBusqueda : clientes;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600">Administra la información de tus clientes</p>
        </div>
        
        <div className="flex space-x-3">
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="space-x-2">
                <Search className="h-4 w-4" />
                <span>Búsqueda Avanzada</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Buscar Clientes</DialogTitle>
              </DialogHeader>
              <ClienteSearch onSelect={(cliente) => {
                setSelectedCliente(cliente);
                setIsFormOpen(true);
                setIsSearchOpen(false);
              }} />
            </DialogContent>
          </Dialog>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button 
                className="space-x-2 btn-primary"
                onClick={() => setSelectedCliente(null)}
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo Cliente</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedCliente ? "Editar Cliente" : "Nuevo Cliente"}
                </DialogTitle>
              </DialogHeader>
              <ClienteForm
                cliente={selectedCliente}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedCliente(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Barra de búsqueda rápida */}
      <Card className="card-material">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar clientes por nombre, email o NIF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-material"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <Card className="card-material">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {searchQuery ? "Resultados de búsqueda" : "Lista de Clientes"}
              {clientesToShow && ` (${clientesToShow.length})`}
            </span>
            {isSearching && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !clientesToShow || clientesToShow.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? "No se encontraron clientes" : "No hay clientes registrados"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? "Intenta con otros términos de búsqueda"
                  : "Comienza agregando tu primer cliente"
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsFormOpen(true)} className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>NIF</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesToShow.map((cliente: Cliente) => (
                    <TableRow key={cliente.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{cliente.nombre}</p>
                          <p className="text-sm text-gray-500">ID: {cliente.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {cliente.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-3 w-3 mr-1" />
                              {cliente.email}
                            </div>
                          )}
                          {cliente.telefono && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-1" />
                              {cliente.telefono}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(cliente.ciudad || cliente.codigoPostal) && (
                          <div className="flex items-start text-sm text-gray-600">
                            <MapPin className="h-3 w-3 mr-1 mt-0.5" />
                            <div>
                              {cliente.direccion && (
                                <p>{cliente.direccion}</p>
                              )}
                              {(cliente.codigoPostal || cliente.ciudad) && (
                                <p>
                                  {[cliente.codigoPostal, cliente.ciudad, cliente.pais]
                                    .filter(Boolean)
                                    .join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {cliente.nif && (
                          <span className="text-sm font-mono text-gray-900">
                            {cliente.nif}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={cliente.activo 
                            ? "bg-green-100 text-green-700 hover:bg-green-100" 
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                          }
                        >
                          {cliente.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(cliente)}
                            className="h-8 w-8 text-gray-400 hover:text-blue-600"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cliente)}
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
