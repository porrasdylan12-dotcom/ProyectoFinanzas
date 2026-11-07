import { describe, expect, it } from 'vitest';

import {
  CUENTA_ROUTES,
  GASTO_COMPARTIDO_ROUTES,
  GRUPO_ROUTES,
  PRESUPUESTO_ROUTES,
  TAB_ROUTES,
  TRANSACCION_ROUTES,
  isTabRoot,
} from './routes';

describe('isTabRoot', () => {
  it('reconoce las raíces de los tabs', () => {
    Object.values(TAB_ROUTES).forEach((route) => {
      expect(isTabRoot(route)).toBe(true);
    });
  });

  it('rechaza rutas de detalle y la raíz', () => {
    expect(isTabRoot('/')).toBe(false);
    expect(isTabRoot('/cuentas/nueva')).toBe(false);
    expect(isTabRoot('/cuentas/1/editar')).toBe(false);
    expect(isTabRoot('/cuentas/1/transacciones/nueva')).toBe(false);
    expect(isTabRoot('/transacciones/1')).toBe(false);
    expect(isTabRoot('/presupuestos/nuevo')).toBe(false);
    expect(isTabRoot('/grupos/1')).toBe(false);
    expect(isTabRoot('/gastos-compartidos/1')).toBe(false);
  });

  it('construye las rutas de cuentas', () => {
    expect(CUENTA_ROUTES.list).toBe('/cuentas');
    expect(CUENTA_ROUTES.new).toBe('/cuentas/nueva');
    expect(CUENTA_ROUTES.detail(7)).toBe('/cuentas/7');
    expect(CUENTA_ROUTES.edit(7)).toBe('/cuentas/7/editar');
  });

  it('construye las rutas de transacciones y presupuestos', () => {
    expect(TRANSACCION_ROUTES.newForAccount(7)).toBe('/cuentas/7/transacciones/nueva');
    expect(TRANSACCION_ROUTES.detail(9)).toBe('/transacciones/9');
    expect(PRESUPUESTO_ROUTES.list).toBe('/cuentas');
    expect(PRESUPUESTO_ROUTES.new).toBe('/presupuestos/nuevo');
  });

  it('construye las rutas de grupos y gastos compartidos', () => {
    expect(GRUPO_ROUTES.list).toBe('/grupos');
    expect(GRUPO_ROUTES.new).toBe('/grupos/nuevo');
    expect(GRUPO_ROUTES.detail(5)).toBe('/grupos/5');
    expect(GRUPO_ROUTES.newExpense(5)).toBe('/grupos/5/gastos/nuevo');
    expect(GASTO_COMPARTIDO_ROUTES.detail(9)).toBe('/gastos-compartidos/9');
  });
});
