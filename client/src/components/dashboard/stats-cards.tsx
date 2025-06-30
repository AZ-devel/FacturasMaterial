import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Euro, Users, Package } from "lucide-react";

interface StatsCardsProps {
  stats: {
    facturasEsteMes: number;
    ingresosTotales: number;
    clientesActivos: number;
    totalProductos: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const statItems = [
    {
      title: "Facturas Este Mes",
      value: stats.facturasEsteMes.toString(),
      change: "+12% vs mes anterior",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Ingresos Totales",
      value: formatCurrency(stats.ingresosTotales),
      change: "+8.2% vs mes anterior",
      changeType: "positive" as const,
      icon: Euro,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Clientes Activos",
      value: stats.clientesActivos.toString(),
      change: "+3 nuevos esta semana",
      changeType: "positive" as const,
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Productos",
      value: stats.totalProductos.toString(),
      change: "Catálogo actualizado",
      changeType: "neutral" as const,
      icon: Package,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <Card key={index} className="card-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{item.title}</p>
                <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                <p className={`text-sm flex items-center ${
                  item.changeType === 'positive' 
                    ? 'text-green-600' 
                    : item.changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}>
                  {item.changeType === 'positive' && (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  )}
                  {item.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center`}>
                <item.icon className={`h-6 w-6 ${item.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
