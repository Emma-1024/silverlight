import { expect, test as setup } from "@playwright/test";

import { STORAGE_STATE } from "playwright.config";
import { globalDb } from "~/constants/db";
import { globalProject } from "~/constants/project";

setup("do login", async ({ page }) => {
  await page.goto("/");
  await page.goto("/login");
  await page.fill("input[type=email]", globalDb.EMAIL);
  await page.fill("input[type=password]", globalDb.PASSWORD);
  await page.check("input[type=checkbox]");
  await page.getByRole("button", { name: "LOG IN" }).click();
  await expect(page.locator("img[alt=avatar]")).toBeVisible({ timeout: 30000 });
  const p1Locator = page.getByTestId("greeting1");
  await expect(p1Locator).toContainText(`Hello again ${globalDb.EMAIL}`);
  const p2Locator = page.getByTestId("greeting2");
  await expect(p2Locator).toContainText(
    `We hope you're having a great day and are ready to explore ${globalProject.PROJECT_NAME} some more.`,
  );
  await page.context().storageState({ path: STORAGE_STATE });
});
