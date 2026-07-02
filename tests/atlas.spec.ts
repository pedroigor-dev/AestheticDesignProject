import { devices, expect, test } from "@playwright/test";

test("renders the interactive face atlas and changes regions", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Face Atlas" })).toHaveCount(1);
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByLabel("Carregando atlas")).toBeHidden({ timeout: 10_000 });
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

  await page.getByRole("button", { name: "Abrir gerador de PDF" }).click();
  await expect(page.getByRole("dialog", { name: "Gerar Atlas em PDF" })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Gerar PDF" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("atlas-estetico-facial.pdf");
});

test.describe("mobile touch behavior", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    userAgent: devices["Pixel 5"].userAgent,
    viewport: devices["Pixel 5"].viewport,
  });

  test("keeps face gestures scoped to the 3D scene", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("canvas")).toBeVisible();
    await expect(page.getByLabel("Carregando atlas")).toBeHidden({ timeout: 10_000 });
    await expect(page.locator("[data-atlas-scene-surface]")).toHaveCSS("touch-action", "none");
    await expect(page.getByRole("button", { name: "Abrir gerador de PDF" })).toBeVisible();
    await expect(page.locator('nav button[title="Olhos"] span').first()).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
  });
});
