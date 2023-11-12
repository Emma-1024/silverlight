import { test as teardown, expect } from "@playwright/test";

teardown("do logout", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("user-actions").click();
  await page.getByText("Logout").click();
  await expect(page).toHaveURL(/.*login/);
  await expect(page.locator("h1")).toContainText("Login now!");
});
