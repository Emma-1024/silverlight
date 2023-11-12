import { test, expect } from "@playwright/test";
import { globalProject } from "../../app/constants/project"

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("has title", async ({ page }) => {
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(globalProject.PROJECT_NAME);
});

test("get started link", async ({ page }) => {
  // Click the get started link.
  await page.getByTestId("start").click();
  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/.*login/);
});

test("change language to zh", async ({ page }) => {
  await page.getByTestId("change-language").click();
  const buttonLocator = page.getByTestId("start");
  await expect(buttonLocator).toHaveText(/Get Started/);
  await page.getByText("zh").click();
  await expect(buttonLocator).toHaveText(/开始/);
  const searchLocator = page.locator("input[type=text]");
  await expect(searchLocator).toHaveAttribute("placeholder", /搜索/);
});

test("change theme to halloween", async ({ page }) => {
  const htmlLocator = page.locator("html");
  await expect(htmlLocator).toHaveAttribute("data-theme", "");
  await page.getByTestId("change-theme").click();
  await page.getByText("Halloween").click();
  await expect(htmlLocator).toHaveAttribute("data-theme", /halloween/);
});
