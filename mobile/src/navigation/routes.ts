export const TAB_ROUTES = {
  panel: '/panel',
  cuentas: '/cuentas',
  grupos: '/grupos',
  ajustes: '/ajustes',
} as const;

export type TabRoute = (typeof TAB_ROUTES)[keyof typeof TAB_ROUTES];

const TAB_ROUTE_VALUES: readonly string[] = Object.values(TAB_ROUTES);

export function isTabRoot(pathname: string): boolean {
  return TAB_ROUTE_VALUES.includes(pathname);
}
