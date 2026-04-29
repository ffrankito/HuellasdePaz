export type Rol = 'admin' | 'manager' | 'contadora' | 'televenta' | 'transporte' | 'cremacion' | 'entrega'
export type EstadoServicio =
  | 'pendiente'
  | 'en_proceso'
  | 'listo'
  | 'entregado'
  | 'cancelado'

export type TipoServicio = 'cremacion_individual' | 'cremacion_comunitaria' | 'entierro'

export type EstadoPlan = 'activo' | 'pausado' | 'cancelado' | 'utilizado'

export type EstadoLead = 'nuevo' | 'contactado' | 'interesado' | 'cotizado' | 'convertido' | 'perdido'

export type CategoriaInventario = 'urna' | 'bolsa' | 'caja' | 'accesorio' | 'insumo' | 'otro'

export type Canal = 'whatsapp' | 'email'

export interface NavItem {
  label: string
  href: string
  roles: Rol[]
}