import { useQuery } from "@tanstack/react-query";
import StatsCards from "@/components/dashboard/stats-cards";
import RevenueChart from "@/components/dashboard/revenue-chart";
import RecentInvoices from "@/components/dashboard/recent-invoices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Plus, Users, Package, FileText, Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data: estadisticas, isLoading } = useQuery({
    queryKey: ["/api/estadisticas"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen general del sistema</p>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      {estadisticas && <StatsCards stats={estadisticas} />}

      {/* Gráficos y Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Ingresos */}
        <div className="lg:col-span-2">
          {estadisticas && <RevenueChart data={estadisticas.facturasPorMes} />}
        </div>

        {/* Acciones Rápidas */}
        <Card className="card-material">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/nueva-factura">
              <Button className="w-full justify-start space-x-3 bg-primary-50 text-primary hover:bg-primary-100 hover:text-primary">
                <Plus className="h-4 w-4" />
                <span>Nueva Factura</span>
              </Button>
            </Link>
            
            <Link href="/clientes">
              <Button variant="outline" className="w-full justify-start space-x-3">
                <Users className="h-4 w-4" />
                <span>Gestionar Clientes</span>
              </Button>
            </Link>
            
            <Link href="/productos">
              <Button variant="outline" className="w-full justify-start space-x-3">
                <Package className="h-4 w-4" />
                <span>Gestionar Productos</span>
              </Button>
            </Link>
            
            <Link href="/ver-facturas">
              <Button variant="outline" className="w-full justify-start space-x-3">
                <FileText className="h-4 w-4" />
                <span>Ver Facturas</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Facturas Recientes */}
      {estadisticas && <RecentInvoices facturas={estadisticas.facturasRecientes} />}
    </div>
  );
}
