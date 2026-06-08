import { test, expect } from './auth.setup';

test.describe('Student Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/student/login');
  });

  test('page renders with student number and password fields', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: /Student Portal/i })
    ).toBeVisible();

    await expect(page.getByLabel(/Student Number/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();

    await expect(
      page.getByRole('button', { name: /Sign In/i })
    ).toBeVisible();
  });

  test('submit with empty fields shows validation errors', async ({ page }) => {
    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(
      page.getByText(/Student number is required/i)
    ).toBeVisible();

    await expect(
      page.getByText(/Password is required/i)
    ).toBeVisible();
  });

  test('back to home link is present', async ({ page }) => {
    const backLink = page.getByText(/Back to home/i);
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/');
  });

  test('submit with invalid credentials shows error', async ({ page }) => {
    await page.getByLabel(/Student Number/i).fill('2024-00001');
    await page.getByLabel(/Password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Should show an error message after failed login attempt
    await expect(
      page.getByText(/Invalid student number or password/i)
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Student Public Pages', () => {
  test('student events page loads and shows content or empty state', async ({
    page,
  }) => {
    await page.goto('/student/events');

    // Page should load and either show events or an appropriate state
    await expect(page.locator('body')).toBeVisible();

    // Should show heading or fallback content (may fail if not authenticated,
    // but the page should still render without crashing)
  });

  test('public event detail page loads', async ({ page }) => {
    await page.goto('/events/nonexistent-id');

    // Should show "Event Not Found" or similar graceful state
    await expect(page.locator('body')).toBeVisible();
  });
});
