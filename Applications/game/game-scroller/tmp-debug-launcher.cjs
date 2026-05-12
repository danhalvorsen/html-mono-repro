const { chromium } = require('@playwright/test');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: /Hunter/i }).click();

  await page.waitForTimeout(300);
  const before = await page.locator('view-hunter').evaluate((element) => {
    const root = element.shadowRoot;
    const scanner = root?.querySelector('.scanner-game-object');
    const mouse = root?.querySelector('mouse-pointer-game-object');
    const scannerApi = scanner;
    return {
      hasRoot: root !== null,
      hasScanner: scanner !== null,
      hasMouse: mouse !== null,
      scannerPos: scannerApi?.getPosistion?.() ?? null,
      mousePos: mouse?.getPosistion?.() ?? null,
      detected: scannerApi?.isMouseDetectedInsideRadius?.() ?? null,
      rockets: Array.isArray(scannerApi?.rockets) ? scannerApi.rockets.length : null,
    };
  });

  const after = await page.locator('view-hunter').evaluate(async (element) => {
    const root = element.shadowRoot;
    const surface = root?.querySelector('.surface');
    const scanner = root?.querySelector('.scanner-game-object');
    if (!root || !surface || !scanner) return { error: 'missing elements' };

    const scannerPos = scanner.getPosistion?.();
    const rect = surface.getBoundingClientRect();
    for (let i = 0; i < 8; i += 1) {
      surface.dispatchEvent(new PointerEvent('pointermove', {
        bubbles: true,
        composed: true,
        clientX: rect.left + scannerPos.x,
        clientY: rect.top + scannerPos.y - 20,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
      }));
      await new Promise((r) => setTimeout(r, 120));
    }

    const rockets = scanner.rockets ?? [];
    const visible = rockets.filter((rocket) => rocket.isVisible?.()).length;

    return {
      scannerPos,
      mousePos: root.querySelector('mouse-pointer-game-object')?.getPosistion?.() ?? null,
      detected: scanner.isMouseDetectedInsideRadius?.() ?? null,
      rockets: rockets.length,
      visible,
      polygons: scanner.shadowRoot?.querySelectorAll('polygon.rocket').length ?? 0,
      svg: scanner.shadowRoot?.querySelectorAll('svg.rocket-layer').length ?? 0,
    };
  });

  console.log('before', before);
  console.log('after', after);
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
