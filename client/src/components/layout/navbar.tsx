import { useAuth } from "@/hooks/use-auth";
import { formatUserName, getUserInitials } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  User 
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { usuario, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  if (!usuario) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implementar búsqueda global
      console.log("Buscar:", searchQuery);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-500">Resumen general del sistema</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Buscador Global */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Buscar facturas, clientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </form>

          {/* Notificaciones */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Menú de Usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {getUserInitials(usuario)}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {formatUserName(usuario)}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{formatUserName(usuario)}</p>
                <p className="text-xs text-gray-500">{usuario.email}</p>
                <p className="text-xs text-gray-500 capitalize">{usuario.rol}</p>
              </div>
              
              <div className="border-t border-gray-100 my-1" />
              
              <DropdownMenuItem asChild>
                <Link href="/perfil">
                  <a className="flex items-center space-x-2 w-full">
                    <User className="h-4 w-4" />
                    <span>Mi Perfil</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/configuracion">
                  <a className="flex items-center space-x-2 w-full">
                    <Settings className="h-4 w-4" />
                    <span>Configuración</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              
              <div className="border-t border-gray-100 my-1" />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
