import { test, expect } from './auth.setup';

test.describe('Admin Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
  });

  test('page renders with email and password fields', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Admin Login/i })
    ).toBeVisible();

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    await expect(
      page.getByRole('button', { name: /Login/i })
    ).toBeVisible();
  });

  test('submit with empty fields shows validation errors', async ({ page }) => {
    await page.getByRole('button', { name: /Login/i }).click();

    // Zod validation: email is required + must be valid email
    await expect(
      page.getByText(/Invalid email address/i)
    ).toBeVisible();

    // Zod validation: password min 6 chars
    await expect(
      page.getByText(/Password must be at least 6 characters/i)
    ).toBeVisible();
  });

  test('submit with invalid email format shows email error', async ({ page }) => {
    await page.getByLabel(/email/i).fill('notanemail');
    await page.getByLabel(/password/i).fill('123456');
    await page.getByRole('button', { name: /Login/i }).click();

    await expect(
      page.getByText(/Invalid email address/i)
    ).toBeVisible();
  });

  test('submit with short password shows password error', async ({ page }) => {
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('123');
    await page.getByRole('button', { name: /Login/i }).click();

    await expect(
      page.getByText(/Password must be at least 6 characters/i)
    ).toBeVisible();
  });

  test('submit with invalid credentials shows error message', async ({
    page,
  }) => {
    await page.getByLabel(/email/i).fill('fake@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword123');
    await page.getByRole('button', { name: /Login/i }).click();

    // Wait for the API response — should show an error
    await expect(
      page.locator('[class*="red"], [class*="error"], .text-red-500, .text-destructive').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('footer text is visible', async ({ page }) => {
    await expect(
      page.getByText(/Protected area/i)
    ).toBeVisible();
  });
});
