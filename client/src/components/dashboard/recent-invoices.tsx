import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Edit } from "lucide-react";
import { Link } from "wouter";
import type { Factura } from "@shared/schema";

interface RecentInvoicesProps {
  facturas: Factura[];
}

export default function RecentInvoices({ facturas }: RecentInvoicesProps) {
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

  if (!facturas || facturas.length === 0) {
    return (
      <Card className="card-material">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Facturas Recientes
            </CardTitle>
            <Link href="/ver-facturas">
              <Button variant="outline" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No hay facturas recientes</p>
            <Link href="/nueva-factura">
              <Button className="mt-4">
                Crear Primera Factura
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-material">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Facturas Recientes
          </CardTitle>
          <Link href="/ver-facturas">
            <Button variant="outline" size="sm">
              Ver todas
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                  Número
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                  Fecha
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                  Total
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                  Estado
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((factura) => (
                <tr
                  key={factura.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">
                      {factura.numero}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {/* Cliente se cargará en la consulta completa */}
                        Cliente #{factura.clienteId}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {formatDate(factura.fecha!)}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(factura.total)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {getEstadoBadge(factura.estado)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-primary"
                        title="Ver"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
