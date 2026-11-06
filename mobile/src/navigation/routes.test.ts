import { describe, expect, it } from 'vitest';

import { TAB_ROUTES, isTabRoot } from './routes';

describe('isTabRoot', () => {
  it('reconoce las raíces de los tabs', () => {
    Object.values(TAB_ROUTES).forEach((route) => {
      expect(isTabRoot(route)).toBe(true);
    });
  });

  it('rechaza rutas de detalle y la raíz', () => {
    expect(isTabRoot('/')).toBe(false);
    expect(isTabRoot('/cuentas/nueva')).toBe(false);
    expect(isTabRoot('/grupos/1')).toBe(false);
  });
});
