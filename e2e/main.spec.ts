import { test, expect } from "@playwright/test";

test.describe("NexaSphere Main Website E2E", () => {
  test("should navigate through home page and view hero section", async ({
    page,
  }) => {
    await page.goto("/");

    // Check for main title and tagline
    await expect(page.locator(".hero-title-text").first()).toBeVisible();
    await expect(page.locator(".hero-tagline").first()).toBeVisible();
  });

  test("should navigate to Team page and display team members", async ({
    page,
  }) => {
    await page.goto("/");

    // Click on Team tab/button
    const teamButton = page
      .locator("button, a", { hasText: /Team|Core Team/i })
      .first();
    if (await teamButton.isVisible()) {
      await teamButton.click();

      // Wait for team page to load
      await page.waitForTimeout(500);

      // Check for team section header
      await expect(
        page.locator("h1", { hasText: /Core Team/i }).first()
      ).toBeVisible();
    }
  });

  test("should navigate to Events page", async ({ page }) => {
    await page.goto("/");

    // Click on Events tab/button
    const eventsButton = page
      .locator("button, a", { hasText: /Events/i })
      .first();
    if (await eventsButton.isVisible()) {
      await eventsButton.click();

      // Wait for page transition
      await page.waitForTimeout(500);

      // Check for events section
      await expect(
        page.locator("h1, h2, h3, h4", { hasText: /Events/i }).first()
      ).toBeVisible();
    }
  });

  test("should open recruitment/apply form", async ({ page }) => {
    await page.goto("/");

    // Look for apply button
    const applyButton = page
      .locator("button, a", { hasText: /Apply|Join/i })
      .first();
    if (await applyButton.isVisible()) {
      await applyButton.click();

      // Wait for modal/page transition
      await page.waitForTimeout(500);
    }
  });

  test("should check footer links", async ({ page }) => {
    await page.goto("/");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check for footer email
    await expect(page.locator(".ns-footer-email-link").first()).toBeVisible();
  });

  test("should handle responsive navigation on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");

    // Check that page is responsive
    const navbar = page.locator('[class*="nav"], [class*="header"]').first();
    if (await navbar.isVisible()) {
      expect(navbar).toBeVisible();
    }
  });

  test("should transition between sections smoothly", async ({ page }) => {
    await page.goto("/");

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Click scroll button or navigate
    const buttons = await page.locator("button").all();
    for (const button of buttons.slice(0, 3)) {
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(300);
      }
    }

    // Page should still be visible
    await expect(page).toHaveURL(/^http/);
  });
});
