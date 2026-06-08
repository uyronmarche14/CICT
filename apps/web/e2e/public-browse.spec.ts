import { test, expect } from './auth.setup';

test.describe('Public Browse Pages', () => {
  test('landing page loads at / without errors', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    await expect(page.locator('body')).toBeVisible();
  });

  test('events page loads at /events', async ({ page }) => {
    const response = await page.goto('/events');
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole('heading', { name: /Upcoming Events/i })
    ).toBeVisible();
  });

  test('click on first event navigates to detail', async ({ page }) => {
    await page.goto('/events');

    await page.waitForTimeout(3000);

    const eventCards = page.locator('a[href^="/events/"]');
    const cardCount = await eventCards.count();

    if (cardCount > 0) {
      await eventCards.first().click();
      await page.waitForURL(/\/events\/.+/);

      await expect(
        page.locator(
          'h1, [data-testid="event-title"], [role="heading"]'
        ).first()
      ).toBeVisible();
    } else {
      // Even without events, the page should still show a meaningful state
      await expect(page.getByText(/No upcoming events/i)).toBeVisible();
    }
  });

  test('news page loads at /news', async ({ page }) => {
    const response = await page.goto('/news');
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole('heading', { name: /News & Updates/i })
    ).toBeVisible();
  });

  test('click on first news article navigates to detail', async ({ page }) => {
    await page.goto('/news');

    await page.waitForTimeout(3000);

    const newsCards = page.locator('a[href^="/news/"]');
    const cardCount = await newsCards.count();

    if (cardCount > 0) {
      await newsCards.first().click();
      await page.waitForURL(/\/news\/.+/);

      await expect(
        page.locator(
          'h1, [role="heading"]'
        ).first()
      ).toBeVisible();
    } else {
      // Even without articles, the page should still render
      await expect(page.getByText(/No news articles found/i)).toBeVisible();
    }
  });

  test('updates hub loads at /updates', async ({ page }) => {
    const response = await page.goto('/updates');
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole('heading', { name: /Campus updates in one place/i })
    ).toBeVisible();
  });

  test('organization detail page shows not-found or content gracefully', async ({
    page,
  }) => {
    const response = await page.goto('/organization/nonexistent-id');
    expect(response?.status()).toBe(200);

    // Should show either the organization or a not-found / loading state
    await expect(page.locator('body')).toBeVisible();
  });
});
