import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Registro from "@/pages/registro";
import Dashboard from "@/pages/dashboard";
import Clientes from "@/pages/clientes";
import Productos from "@/pages/productos";
import Facturas from "@/pages/facturas";
import NuevaFactura from "@/pages/nueva-factura";
import VerFacturas from "@/pages/ver-facturas";
import Logs from "@/pages/logs";
import Perfil from "@/pages/perfil";
import MainLayout from "@/components/layout/main-layout";

function Router() {
  return (
    <Switch>
      {/* Rutas públicas */}
      <Route path="/login" component={Login} />
      <Route path="/registro" component={Registro} />
      
      {/* Rutas protegidas */}
      <Route path="/" component={() => (
        <MainLayout>
          <Dashboard />
        </MainLayout>
      )} />
      
      <Route path="/dashboard" component={() => (
        <MainLayout>
          <Dashboard />
        </MainLayout>
      )} />
      
      <Route path="/clientes" component={() => (
        <MainLayout>
          <Clientes />
        </MainLayout>
      )} />
      
      <Route path="/productos" component={() => (
        <MainLayout>
          <Productos />
        </MainLayout>
      )} />
      
      <Route path="/facturas" component={() => (
        <MainLayout>
          <Facturas />
        </MainLayout>
      )} />
      
      <Route path="/nueva-factura" component={() => (
        <MainLayout>
          <NuevaFactura />
        </MainLayout>
      )} />
      
      <Route path="/ver-facturas" component={() => (
        <MainLayout>
          <VerFacturas />
        </MainLayout>
      )} />
      
      <Route path="/logs" component={() => (
        <MainLayout>
          <Logs />
        </MainLayout>
      )} />
      
      <Route path="/perfil" component={() => (
        <MainLayout>
          <Perfil />
        </MainLayout>
      )} />
      
      {/* Fallback a 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
