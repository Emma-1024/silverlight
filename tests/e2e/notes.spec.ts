import { test, expect } from "@playwright/test";

const titleText = `test note title ${Math.random().toFixed(2)}`;
const bodyText = `test note body ${Math.random().toFixed(2)}`;
test("add notes and check if created successfully", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("notes").click();
  await expect(page).toHaveURL(/.*notes/);
  await page.getByTestId("add-notes").click();
  await expect(page).toHaveURL(/.*new/);
  await page.fill("span[data-testid=note-title]", titleText);
  await page.fill("span[data-testid=note-body]", bodyText);
  await page.getByRole("button", { name: "Save" }).click();
  await new Promise((r) => setTimeout(r, 1000));
  await expect(page).toHaveURL(/.*notes*/);
  const noteId = page.url().split("/").pop();
  const createdLi = page.getByTestId(noteId);
  await expect(createdLi).toBeVisible();
  await createdLi.click();
  await expect(page.getByTestId("note-detail-title")).toContainText(titleText);
  await expect(page.getByTestId("note-detail-body")).toContainText(bodyText);
});
