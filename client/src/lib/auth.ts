import { Usuario } from "@shared/schema";

export function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}

export function formatUserName(usuario: Usuario): string {
  return `${usuario.nombre} ${usuario.apellido}`;
}

export function getUserInitials(usuario: Usuario): string {
  return `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase();
}

export function isAdmin(usuario: Usuario): boolean {
  return usuario.rol === 'admin';
}

export function canAccessLogs(usuario: Usuario): boolean {
  return isAdmin(usuario);
}

export function canDeleteUser(currentUser: Usuario, targetUser: Usuario): boolean {
  return isAdmin(currentUser) && currentUser.id !== targetUser.id;
}
