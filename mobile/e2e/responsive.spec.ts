import { expect, test } from '@playwright/test';

test('la pantalla de login no desborda y mantiene su ancho máximo', async ({ page }) => {
  await page.goto('/login');

  const desborda = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(desborda).toBe(false);

  const ancho = await page.locator('.auth-container').evaluate((elemento) => elemento.getBoundingClientRect().width);
  expect(ancho).toBeLessThanOrEqual(416);
});

test('los enlaces de autenticación siguen visibles y navegan a registro', async ({ page }) => {
  await page.goto('/login');

  const olvidePassword = page.getByRole('link', { name: '¿Olvidaste tu contraseña?' });
  const crearCuenta = page.getByRole('link', { name: 'Crear cuenta' });

  await expect(olvidePassword).toBeVisible();
  await expect(crearCuenta).toBeVisible();

  await crearCuenta.click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible();
});
