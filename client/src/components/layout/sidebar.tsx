import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { formatUserName, getUserInitials } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Plus,
  List,
  Users,
  Package,
  BarChart3,
  History,
  Settings,
  LogOut,
  Receipt
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Facturas",
    icon: FileText,
    items: [
      {
        title: "Nueva Factura",
        href: "/nueva-factura",
        icon: Plus,
      },
      {
        title: "Ver Facturas",
        href: "/ver-facturas",
        icon: List,
      },
    ],
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    title: "Productos",
    href: "/productos",
    icon: Package,
  },
  {
    title: "Reportes",
    href: "/reportes",
    icon: BarChart3,
  },
  {
    title: "Logs",
    href: "/logs",
    icon: History,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { usuario, logout } = useAuth();

  if (!usuario) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <>
      <aside
        className={cn(
          "bg-white shadow-lg w-64 min-h-screen flex flex-col transition-all duration-300 z-50",
          "fixed lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo y Empresa */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">FacturasApp</h1>
              <p className="text-xs text-gray-500">Sistema de Facturación</p>
            </div>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <div key={item.title}>
              {item.href ? (
                <Link href={item.href} onClick={onClose}>
                  <a
                    className={cn(
                      "sidebar-nav-item",
                      location === item.href && "active"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </a>
                </Link>
              ) : (
                <>
                  <div className="flex items-center space-x-3 px-4 py-3 text-gray-700">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {item.items && (
                    <div className="space-y-1 ml-4">
                      {item.items.map((subItem) => (
                        <Link key={subItem.href} href={subItem.href} onClick={onClose}>
                          <a
                            className={cn(
                              "flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors",
                              location === subItem.href && "bg-primary-50 text-primary-700 font-medium"
                            )}
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span>{subItem.title}</span>
                          </a>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Usuario y Configuración */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link href="/perfil" onClick={onClose}>
            <a className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {getUserInitials(usuario)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {formatUserName(usuario)}
                </p>
                <p className="text-xs text-gray-500 capitalize">{usuario.rol}</p>
              </div>
              <Settings className="h-4 w-4 text-gray-400" />
            </a>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
