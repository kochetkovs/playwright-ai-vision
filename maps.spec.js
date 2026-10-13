const { test, expect } = require('@playwright/test');
const { askVision } = require('./lib/vision');

test('Maps Visual Validation: Zimbabwe Cities', async ({ page }, testInfo) => {
  // 1. Open Google Maps with forced English UI.
  await page.goto('https://www.google.com/maps?hl=en');

  // 2. Accept the cookie consent if it shows up (EU geo only).
  const acceptAll = page.getByRole('button', { name: /accept all/i }).first();
  const consentShown = await acceptAll
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true, () => false);
  if (consentShown) {
    await acceptAll.click();
    console.log('Cookies accepted.');
  }

  // 3. Search for Zimbabwe.
  const searchBox = page.getByRole('combobox').first();
  await searchBox.fill('Zimbabwe');
  await searchBox.press('Enter');

  // 4. Wait for the map to fly to the country: URL gets the place path and coordinates,
  //    then the place card renders. Let the tiles settle instead of a fixed sleep.
  await page.waitForURL(/\/maps\/place\/Zimbabwe\/@-?\d+\.\d+,-?\d+\.\d+/);
  await expect(page.getByRole('heading', { name: 'Zimbabwe' }).first()).toBeVisible();
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {
    // Maps keeps a few background requests alive; the tiles are already rendered by now.
  });

  // 5. Semantic visual check.
  const report = await askVision(page, testInfo, {
    harare_present: 'Is the city of Harare visible?',
    bulawayo_present: 'Is the city of Bulawayo visible?',
    ny_present: 'Is the city of New York visible?',
  });
  console.log('Visual Analysis Results:', report);

  // 6. Business assertions. New York is a control question: it must never be on this map.
  expect(report.harare_present).toBe('YES');
  expect(report.bulawayo_present).toBe('YES');
  expect(report.ny_present).toBe('NO');
});
