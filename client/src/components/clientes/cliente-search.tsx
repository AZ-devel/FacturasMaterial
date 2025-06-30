import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, User, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import type { Cliente } from "@shared/schema";

interface ClienteSearchProps {
  onSelect: (cliente: Cliente) => void;
}

export default function ClienteSearch({ onSelect }: ClienteSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Query para búsqueda de clientes
  const { data: resultados, isLoading } = useQuery({
    queryKey: ["/api/clientes/buscar", searchQuery],
    enabled: searchQuery.length >= 2,
    queryFn: async () => {
      const response = await fetch(`/api/clientes/buscar?q=${encodeURIComponent(searchQuery)}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error en la búsqueda");
      return response.json();
    },
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre, email o NIF..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 input-material"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {searchQuery.length >= 2 && !isLoading && (
        <div className="max-h-96 overflow-y-auto space-y-2">
          {!resultados || resultados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No se encontraron clientes</p>
              <p className="text-sm">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            resultados.map((cliente: Cliente) => (
              <Card key={cliente.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4" onClick={() => onSelect(cliente)}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{cliente.nombre}</h4>
                        <Badge className={cliente.activo 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                        }>
                          {cliente.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        {cliente.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{cliente.email}</span>
                          </div>
                        )}
                        
                        {cliente.telefono && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{cliente.telefono}</span>
                          </div>
                        )}
                        
                        {(cliente.ciudad || cliente.direccion) && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {[cliente.direccion, cliente.ciudad, cliente.codigoPostal]
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          </div>
                        )}
                        
                        {cliente.nif && (
                          <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                            NIF: {cliente.nif}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button size="sm" variant="outline">
                      Seleccionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Escribe al menos 2 caracteres para buscar
        </div>
      )}
    </div>
  );
}
