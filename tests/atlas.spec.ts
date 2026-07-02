import { expect, test } from "@playwright/test";

test("renders the interactive face atlas and changes regions", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Face Atlas" })).toHaveCount(1);
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByLabel("Carregando atlas")).toBeHidden({ timeout: 6000 });
  const detailsPanel = page.getByRole("complementary", { name: "Detalhes da regiao" });
  await expect(detailsPanel).toContainText("Escolha uma regiao");
  await expect(page.getByRole("button", { name: "Estetica" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.getByRole("button", { name: "Musculos" }).click();
  await expect(page.getByRole("button", { name: "Musculos" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.locator('nav button[title="Nariz"]').click();

  await expect(page.locator('nav button[title="Nariz"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(detailsPanel).toContainText("Rinomodelacao");

  await page.getByRole("button", { name: "Resetar camera" }).click();

  await expect(page.locator('nav button[title="Nariz"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(detailsPanel).toContainText("Escolha uma regiao");
});
