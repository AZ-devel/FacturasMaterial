import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FacturaForm from "@/components/facturas/factura-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";

export default function NuevaFactura() {
  // Obtener el próximo número de factura
  const { data: proximoNumero, isLoading: loadingNumero } = useQuery({
    queryKey: ["/api/facturas/proximo-numero"],
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <FileText className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Factura</h1>
          <p className="text-gray-600">
            {loadingNumero ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Cargando número de factura...
              </span>
            ) : proximoNumero ? (
              `Número de factura: ${proximoNumero.numero}`
            ) : (
              "Crear una nueva factura"
            )}
          </p>
        </div>
      </div>

      {/* Formulario de factura */}
      <Card className="card-material">
        <CardHeader>
          <CardTitle>Datos de la Factura</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingNumero ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <FacturaForm numeroFactura={proximoNumero?.numero} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
