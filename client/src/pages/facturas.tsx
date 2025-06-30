import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, List, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function Facturas() {
  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Facturas</h1>
          <p className="text-gray-600">Administra todas las facturas del sistema</p>
        </div>
      </div>

      {/* Tarjetas de acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/nueva-factura">
          <Card className="card-material cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Plus className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Nueva Factura</h3>
                  <p className="text-sm text-gray-600">Crear una nueva factura</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ver-facturas">
          <Card className="card-material cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <List className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ver Facturas</h3>
                  <p className="text-sm text-gray-600">Consultar facturas existentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reportes">
          <Card className="card-material cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reportes</h3>
                  <p className="text-sm text-gray-600">Análisis y estadísticas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-material">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Proceso de Facturación</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary-700">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Crear Nueva Factura</h4>
                <p className="text-sm text-gray-600">Selecciona un cliente y agrega productos o servicios</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary-700">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Revisar y Guardar</h4>
                <p className="text-sm text-gray-600">Verifica los datos y guarda la factura</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary-700">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Generar PDF</h4>
                <p className="text-sm text-gray-600">Descarga o envía la factura en formato PDF</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-material">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Estados de Factura</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div>
                <span className="font-medium text-gray-900">Pendiente:</span>
                <span className="text-sm text-gray-600 ml-1">Factura creada, pendiente de pago</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div>
                <span className="font-medium text-gray-900">Pagada:</span>
                <span className="text-sm text-gray-600 ml-1">Pago recibido y confirmado</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div>
                <span className="font-medium text-gray-900">Vencida:</span>
                <span className="text-sm text-gray-600 ml-1">Pasó la fecha de vencimiento sin pago</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <div>
                <span className="font-medium text-gray-900">Cancelada:</span>
                <span className="text-sm text-gray-600 ml-1">Factura anulada o cancelada</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
