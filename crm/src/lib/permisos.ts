import { type Usuario } from '@/db/schema'

export type Permiso = 
  | 'gestion_equipo'
  | 'ver_reportes' 
  | 'configuracion'
  | 'cobranzas'

export function tienePermiso(usuario: Usuario, permiso: Permiso): boolean {
  // Admin siempre tiene todo
  if (usuario.rol === 'admin') return true
  // Verificar en el array de permisos
  return usuario.permisos?.includes(permiso) ?? false
}

export function puedeGestionarEquipo(usuario: Usuario): boolean {
  return tienePermiso(usuario, 'gestion_equipo') || usuario.rol === 'manager'
}