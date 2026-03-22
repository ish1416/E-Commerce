import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('shows hero headline and CTA buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Commerce that')).toBeVisible();
    await expect(page.getByRole('link', { name: /Start shopping/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sign in/i }).first()).toBeVisible();
  });

  test('navigates to sign-in from nav', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Sign in/i }).first().click();
    await expect(page).toHaveURL('/auth/signin');
    await expect(page.getByText('Welcome')).toBeVisible();
  });

  test('navigates to sign-up', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Get started/i }).click();
    await expect(page).toHaveURL('/auth/signup');
    await expect(page.getByText('Create account')).toBeVisible();
  });
});

test.describe('Auth flow', () => {
  test('sign-in page renders form', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible();
  });

  test('sign-up page renders form', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.getByPlaceholder('Ishita Singh')).toBeVisible();
    await expect(page.getByRole('button', { name: /Create account/i })).toBeVisible();
  });

  test('sign-in link on signup page works', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.getByRole('link', { name: /Sign in/i }).click();
    await expect(page).toHaveURL('/auth/signin');
  });
});

test.describe('Dashboard redirect', () => {
  test('redirects unauthenticated user to sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/auth\/signin/);
  });
});
