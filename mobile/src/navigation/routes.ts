export const TAB_ROUTES = {
  panel: '/panel',
  cuentas: '/cuentas',
  grupos: '/grupos',
  ajustes: '/ajustes',
} as const;

export type TabRoute = (typeof TAB_ROUTES)[keyof typeof TAB_ROUTES];

export const CUENTA_PATHS = {
  list: TAB_ROUTES.cuentas,
  new: '/cuentas/nueva',
  detail: '/cuentas/:id',
  edit: '/cuentas/:id/editar',
} as const;

export const CUENTA_ROUTES = {
  list: CUENTA_PATHS.list,
  new: CUENTA_PATHS.new,
  detail: (id: number | string) => `/cuentas/${id}`,
  edit: (id: number | string) => `/cuentas/${id}/editar`,
} as const;

const TAB_ROUTE_VALUES: readonly string[] = Object.values(TAB_ROUTES);

export function isTabRoot(pathname: string): boolean {
  return TAB_ROUTE_VALUES.includes(pathname);
}
