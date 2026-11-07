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

export const TRANSACCION_PATHS = {
  newForAccount: '/cuentas/:id/transacciones/nueva',
  detail: '/transacciones/:id',
} as const;

export const TRANSACCION_ROUTES = {
  newForAccount: (accountId: number | string) => `/cuentas/${accountId}/transacciones/nueva`,
  detail: (id: number | string) => `/transacciones/${id}`,
} as const;

export const PRESUPUESTO_PATHS = {
  new: '/presupuestos/nuevo',
} as const;

export const PRESUPUESTO_ROUTES = {
  list: TAB_ROUTES.cuentas,
  new: PRESUPUESTO_PATHS.new,
} as const;

export const GRUPO_PATHS = {
  list: TAB_ROUTES.grupos,
  new: '/grupos/nuevo',
  detail: '/grupos/:id',
  newExpense: '/grupos/:id/gastos/nuevo',
} as const;

export const GRUPO_ROUTES = {
  list: GRUPO_PATHS.list,
  new: GRUPO_PATHS.new,
  detail: (id: number | string) => `/grupos/${id}`,
  newExpense: (id: number | string) => `/grupos/${id}/gastos/nuevo`,
} as const;

export const GASTO_COMPARTIDO_PATHS = {
  detail: '/gastos-compartidos/:id',
} as const;

export const GASTO_COMPARTIDO_ROUTES = {
  detail: (id: number | string) => `/gastos-compartidos/${id}`,
} as const;

const TAB_ROUTE_VALUES: readonly string[] = Object.values(TAB_ROUTES);

export function isTabRoot(pathname: string): boolean {
  return TAB_ROUTE_VALUES.includes(pathname);
}
