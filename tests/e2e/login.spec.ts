import { test, expect } from '@playwright/test';

test('can login and reach dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('dev@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.getByText('Dashboard')).toBeVisible();
});


