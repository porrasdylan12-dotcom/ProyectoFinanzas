import { expect, test } from '@playwright/test';

test('redirige al login desde la raíz', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page.getByTestId('login-email')).toBeVisible();
});
