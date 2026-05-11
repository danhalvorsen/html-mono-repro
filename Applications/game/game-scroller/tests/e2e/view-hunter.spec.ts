import { expect, type Locator, type Page, test } from "@playwright/test";

type HunterSliderName =
  | "Trigger Distance"
  | "Particle Alive Time"
  | "VelX"
  | "VelY"
  | "Particle Acceleration";

type BrowserIssue = Readonly<{
  readonly kind: "console" | "pageerror";
  readonly text: string;
}>;

type RectSnapshot = Readonly<{
  readonly x: number;
  readonly y: number;
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
}>;

type SvgEllipseAttributes = Readonly<{
  readonly cx: string | null;
  readonly cy: string | null;
  readonly rx: string | null;
  readonly ry: string | null;
  readonly fill: string | null;
  readonly stroke: string | null;
}>;

type ParticleVisualDiagnostic = Readonly<{
  readonly index: number;
  readonly tagName: string;
  readonly slot: string;
  readonly hidden: boolean;
  readonly hasHiddenAttribute: boolean;
  readonly hostDisplay: string;
  readonly hostVisibility: string;
  readonly hostOpacity: string;
  readonly hostPosition: string;
  readonly hostOverflow: string;
  readonly hostRect: RectSnapshot;
  readonly hostHasPaintableArea: boolean;
  readonly hostIntersectsSurface: boolean;
  readonly hostIntersectsViewport: boolean;
  readonly shadowRootExists: boolean;
  readonly particleWorldExists: boolean;
  readonly particleWorldStyle: {
    readonly width: string;
    readonly height: string;
    readonly cssWidthVariable: string;
    readonly cssHeightVariable: string;
  } | null;
  readonly particleTransformExists: boolean;
  readonly particleTransformStyle: {
    readonly left: string;
    readonly top: string;
    readonly transform: string;
    readonly position: string;
  } | null;
  readonly particleVisualExists: boolean;
  readonly svgExists: boolean;
  readonly svgDisplay: string | null;
  readonly svgOverflow: string | null;
  readonly svgRect: RectSnapshot | null;
  readonly svgHasPaintableArea: boolean;
  readonly ellipseExists: boolean;
  readonly ellipseAttributes: SvgEllipseAttributes | null;
  readonly ellipseHasPositiveRadius: boolean;
  readonly ellipseHasPaint: boolean;
}>;

type HunterParticleState = Readonly<{
  readonly surfaceExists: boolean;
  readonly scannerExists: boolean;
  readonly surfaceRect: RectSnapshot | null;
  readonly scannerRect: RectSnapshot | null;
  readonly count: number;
  readonly visibleCount: number;
  readonly hiddenCount: number;
  readonly svgCount: number;
  readonly ellipseCount: number;
  readonly paintableCount: number;
  readonly diagnostics: readonly ParticleVisualDiagnostic[];
}>;

function captureBrowserIssues(page: Page): BrowserIssue[] {
  const issues: BrowserIssue[] = [];

  page.on("pageerror", error => {
    issues.push({
      kind: "pageerror",
      text: error.message,
    });
  });

  page.on("console", message => {
    if (message.type() !== "error") {
      return;
    }

    issues.push({
      kind: "console",
      text: message.text(),
    });
  });

  return issues;
}

async function openHunterView(page: Page): Promise<Locator> {
  await page.goto("/");
  await page.getByRole("button", { name: /Hunter/i }).click();

  const hunter = page.locator("view-hunter");

  await expect(hunter).toHaveCount(1);
  await expect(hunter.locator("h2")).toHaveText("Hunter");

  return hunter;
}

async function setHunterSlider(
  hunter: Locator,
  labelText: HunterSliderName,
  value: string,
): Promise<void> {
  await hunter.evaluate(
    (element, args) => {
      const root = element.shadowRoot;

      if (root === null) {
        throw new Error("view-hunter has no shadowRoot.");
      }

      const labels = Array.from(root.querySelectorAll("label"));
      const label = labels.find(candidate =>
        candidate.textContent?.includes(args.labelText),
      );

      if (label === undefined) {
        throw new Error(`Slider label not found: ${args.labelText}`);
      }

      const input = label.querySelector("input");

      if (!(input instanceof HTMLInputElement)) {
        throw new Error(`Slider input not found: ${args.labelText}`);
      }

      input.value = args.value;
      input.dispatchEvent(
        new Event("input", {
          bubbles: true,
          composed: true,
        }),
      );
    },
    {
      labelText,
      value,
    },
  );
}

async function movePointerInsideScannerTrigger(hunter: Locator): Promise<void> {
  await hunter.evaluate(element => {
    const root = element.shadowRoot;

    if (root === null) {
      throw new Error("view-hunter has no shadowRoot.");
    }

    const surface = root.querySelector<HTMLElement>(".surface");
    const scanner = root.querySelector<HTMLElement>(".scanner-game-object");

    if (surface === null) {
      throw new Error("Hunter surface not found.");
    }

    if (scanner === null) {
      throw new Error("Scanner game object not found.");
    }

    const scannerApi = scanner as HTMLElement & {
      getPosistion?: () => { readonly x: number; readonly y: number };
    };

    const scannerPosition = scannerApi.getPosistion?.();

    if (scannerPosition === undefined) {
      throw new Error("Scanner game object has no getPosistion().");
    }

    const surfaceRect = surface.getBoundingClientRect();

    surface.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        composed: true,
        clientX: surfaceRect.left + scannerPosition.x,
        clientY: surfaceRect.top + scannerPosition.y - 40,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
      }),
    );
  });
}

async function movePointerInsideScannerTriggerRepeated(
  hunter: Locator,
  count: number,
  intervalMs: number,
): Promise<void> {
  await hunter.evaluate(
    async (element, args) => {
      const wait = (milliseconds: number): Promise<void> =>
        new Promise(resolve => {
          window.setTimeout(resolve, milliseconds);
        });

      const dispatchPointerMove = (): void => {
        const root = element.shadowRoot;

        if (root === null) {
          throw new Error("view-hunter has no shadowRoot.");
        }

        const surface = root.querySelector<HTMLElement>(".surface");
        const scanner = root.querySelector<HTMLElement>(".scanner-game-object");

        if (surface === null) {
          throw new Error("Hunter surface not found.");
        }

        if (scanner === null) {
          throw new Error("Scanner game object not found.");
        }

        const scannerApi = scanner as HTMLElement & {
          getPosistion?: () => { readonly x: number; readonly y: number };
        };

        const scannerPosition = scannerApi.getPosistion?.();

        if (scannerPosition === undefined) {
          throw new Error("Scanner game object has no getPosistion().");
        }

        const surfaceRect = surface.getBoundingClientRect();

        surface.dispatchEvent(
          new PointerEvent("pointermove", {
            bubbles: true,
            composed: true,
            clientX: surfaceRect.left + scannerPosition.x,
            clientY: surfaceRect.top + scannerPosition.y - 40,
            pointerId: 1,
            pointerType: "mouse",
            isPrimary: true,
          }),
        );
      };

      for (let index = 0; index < args.count; index += 1) {
        dispatchPointerMove();
        await wait(args.intervalMs);
      }
    },
    {
      count,
      intervalMs,
    },
  );
}
async function getHunterParticleState(
  hunter: Locator,
): Promise<HunterParticleState> {
  return hunter.evaluate(element => {
    const toRectSnapshot = (rect: DOMRect): RectSnapshot => ({
      x: rect.x,
      y: rect.y,
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    });

    const intersects = (a: DOMRect, b: DOMRect): boolean =>
      a.right >= b.left &&
      a.left <= b.right &&
      a.bottom >= b.top &&
      a.top <= b.bottom;

    const viewportRect = new DOMRect(
      0,
      0,
      window.innerWidth,
      window.innerHeight,
    );

    const empty: HunterParticleState = {
      surfaceExists: false,
      scannerExists: false,
      surfaceRect: null,
      scannerRect: null,
      count: 0,
      visibleCount: 0,
      hiddenCount: 0,
      svgCount: 0,
      ellipseCount: 0,
      paintableCount: 0,
      diagnostics: [],
    };

    const root = element.shadowRoot;

    if (root === null) {
      return empty;
    }

    const surface = root.querySelector<HTMLElement>(".surface");
    const scanner = root.querySelector<HTMLElement>(".scanner-game-object");

    if (surface === null || scanner === null) {
      return {
        ...empty,
        surfaceExists: surface !== null,
        scannerExists: scanner !== null,
      };
    }

    const surfaceRect = surface.getBoundingClientRect();
    const scannerRect = scanner.getBoundingClientRect();

    const particles = Array.from(
      scanner.querySelectorAll<HTMLElement>("tracker-particle-game-object"),
    );

    const diagnostics = particles.map(
      (particle, index): ParticleVisualDiagnostic => {
        const hostStyle = getComputedStyle(particle);
        const hostRect = particle.getBoundingClientRect();

        const particleWorld =
          particle.shadowRoot?.querySelector<HTMLElement>(".particle-world") ??
          null;

        const particleTransform =
          particle.shadowRoot?.querySelector<HTMLElement>(
            ".particle-transform",
          ) ?? null;

        const particleVisual =
          particle.shadowRoot?.querySelector<HTMLElement>(".particle-visual") ??
          null;

        const svg =
          particle.shadowRoot?.querySelector<SVGSVGElement>("svg") ?? null;

        const ellipse =
          particle.shadowRoot?.querySelector<SVGEllipseElement>("ellipse") ??
          null;

        const svgStyle = svg === null ? null : getComputedStyle(svg);
        const svgRect = svg?.getBoundingClientRect() ?? null;

        const ellipseAttributes =
          ellipse === null
            ? null
            : {
                cx: ellipse.getAttribute("cx"),
                cy: ellipse.getAttribute("cy"),
                rx: ellipse.getAttribute("rx"),
                ry: ellipse.getAttribute("ry"),
                fill: ellipse.getAttribute("fill"),
                stroke: ellipse.getAttribute("stroke"),
              };

        const rx = Number(ellipseAttributes?.rx ?? 0);
        const ry = Number(ellipseAttributes?.ry ?? 0);

        const ellipseHasPaint =
          ellipseAttributes !== null &&
          ellipseAttributes.fill !== "none" &&
          ellipseAttributes.fill !== null &&
          ellipseAttributes.fill.trim().length > 0;

        return {
          index,
          tagName: particle.tagName.toLowerCase(),
          slot: particle.slot,
          hidden: particle.hidden,
          hasHiddenAttribute: particle.hasAttribute("hidden"),
          hostDisplay: hostStyle.display,
          hostVisibility: hostStyle.visibility,
          hostOpacity: hostStyle.opacity,
          hostPosition: hostStyle.position,
          hostOverflow: hostStyle.overflow,
          hostRect: toRectSnapshot(hostRect),
          hostHasPaintableArea: hostRect.width > 0 && hostRect.height > 0,
          hostIntersectsSurface: intersects(hostRect, surfaceRect),
          hostIntersectsViewport: intersects(hostRect, viewportRect),
          shadowRootExists: particle.shadowRoot !== null,
          particleWorldExists: particleWorld !== null,
          particleWorldStyle:
            particleWorld === null
              ? null
              : {
                  width: getComputedStyle(particleWorld).width,
                  height: getComputedStyle(particleWorld).height,
                  cssWidthVariable: particleWorld.style.getPropertyValue(
                    "--particle-world-width",
                  ),
                  cssHeightVariable: particleWorld.style.getPropertyValue(
                    "--particle-world-height",
                  ),
                },
          particleTransformExists: particleTransform !== null,
          particleTransformStyle:
            particleTransform === null
              ? null
              : {
                  left: particleTransform.style.left,
                  top: particleTransform.style.top,
                  transform: particleTransform.style.transform,
                  position: getComputedStyle(particleTransform).position,
                },
          particleVisualExists: particleVisual !== null,
          svgExists: svg !== null,
          svgDisplay: svgStyle?.display ?? null,
          svgOverflow: svgStyle?.overflow ?? null,
          svgRect: svgRect === null ? null : toRectSnapshot(svgRect),
          svgHasPaintableArea:
            svgRect !== null && svgRect.width > 0 && svgRect.height > 0,
          ellipseExists: ellipse !== null,
          ellipseAttributes,
          ellipseHasPositiveRadius:
            Number.isFinite(rx) &&
            Number.isFinite(ry) &&
            rx > 0 &&
            ry > 0,
          ellipseHasPaint,
        };
      },
    );

    const visibleDiagnostics = diagnostics.filter(
      particle =>
        !particle.hidden &&
        !particle.hasHiddenAttribute &&
        particle.hostDisplay !== "none" &&
        particle.hostVisibility !== "hidden" &&
        particle.hostOpacity !== "0",
    );

    const paintableDiagnostics = visibleDiagnostics.filter(
      particle =>
        particle.hostHasPaintableArea &&
        particle.hostIntersectsSurface &&
        particle.hostIntersectsViewport &&
        particle.shadowRootExists &&
        particle.particleWorldExists &&
        particle.particleTransformExists &&
        particle.particleVisualExists &&
        particle.svgExists &&
        particle.svgDisplay !== "none" &&
        particle.svgHasPaintableArea &&
        particle.ellipseExists &&
        particle.ellipseHasPositiveRadius &&
        particle.ellipseHasPaint,
    );

    return {
      surfaceExists: true,
      scannerExists: true,
      surfaceRect: toRectSnapshot(surfaceRect),
      scannerRect: toRectSnapshot(scannerRect),
      count: particles.length,
      visibleCount: visibleDiagnostics.length,
      hiddenCount: diagnostics.filter(particle => particle.hidden).length,
      svgCount: diagnostics.filter(particle => particle.svgExists).length,
      ellipseCount: diagnostics.filter(particle => particle.ellipseExists)
        .length,
      paintableCount: paintableDiagnostics.length,
      diagnostics,
    };
  });
}

async function expectPaintableParticle(hunter: Locator): Promise<void> {
  await expect
    .poll(
      async () => {
        const state = await getHunterParticleState(hunter);

        return {
          count: state.count,
          visibleCount: state.visibleCount,
          svgCount: state.svgCount,
          ellipseCount: state.ellipseCount,
          paintableCount: state.paintableCount,
        };
      },
      {
        timeout: 2_000,
        intervals: [50, 100, 250],
      },
    )
    .toEqual(
      expect.objectContaining({
        count: expect.any(Number),
        visibleCount: expect.any(Number),
        svgCount: expect.any(Number),
        ellipseCount: expect.any(Number),
        paintableCount: expect.any(Number),
      }),
    );

  await expect
    .poll(
      async () => {
        const state = await getHunterParticleState(hunter);

        return state.paintableCount;
      },
      {
        timeout: 2_000,
        intervals: [50, 100, 250],
      },
    )
    .toBeGreaterThan(0);

  const state = await getHunterParticleState(hunter);
  const particle = state.diagnostics.find(candidate => {
    return (
      !candidate.hidden &&
      !candidate.hasHiddenAttribute &&
      candidate.hostDisplay !== "none" &&
      candidate.hostVisibility !== "hidden" &&
      candidate.hostOpacity !== "0" &&
      candidate.hostHasPaintableArea &&
      candidate.hostIntersectsSurface &&
      candidate.hostIntersectsViewport &&
      candidate.shadowRootExists &&
      candidate.particleWorldExists &&
      candidate.particleTransformExists &&
      candidate.particleVisualExists &&
      candidate.svgExists &&
      candidate.svgDisplay !== "none" &&
      candidate.svgHasPaintableArea &&
      candidate.ellipseExists &&
      candidate.ellipseHasPositiveRadius &&
      candidate.ellipseHasPaint
    );
  });

  expect(particle, JSON.stringify(state, null, 2)).toBeDefined();

  expect(particle?.tagName).toBe("tracker-particle-game-object");
  expect(particle?.hidden).toBe(false);
  expect(particle?.hasHiddenAttribute).toBe(false);
  expect(particle?.hostDisplay).not.toBe("none");
  expect(particle?.hostVisibility).not.toBe("hidden");
  expect(particle?.hostOpacity).not.toBe("0");
  expect(particle?.hostRect.width).toBeGreaterThan(0);
  expect(particle?.hostRect.height).toBeGreaterThan(0);
  expect(particle?.hostIntersectsSurface).toBe(true);
  expect(particle?.hostIntersectsViewport).toBe(true);
  expect(particle?.shadowRootExists).toBe(true);
  expect(particle?.particleWorldExists).toBe(true);
  expect(particle?.particleTransformExists).toBe(true);
  expect(particle?.particleVisualExists).toBe(true);
  expect(particle?.particleWorldStyle?.cssWidthVariable).not.toBe("");
  expect(particle?.particleWorldStyle?.cssHeightVariable).not.toBe("");
  expect(particle?.particleTransformStyle?.position).toBe("absolute");
  expect(particle?.particleTransformStyle?.left).not.toBe("");
  expect(particle?.particleTransformStyle?.top).not.toBe("");
  expect(particle?.particleTransformStyle?.transform).toContain("translate");
  expect(particle?.svgExists).toBe(true);
  expect(particle?.svgDisplay).not.toBe("none");
  expect(particle?.svgHasPaintableArea).toBe(true);
  expect(particle?.ellipseExists).toBe(true);
  expect(Number(particle?.ellipseAttributes?.rx)).toBeGreaterThan(0);
  expect(Number(particle?.ellipseAttributes?.ry)).toBeGreaterThan(0);
  expect(particle?.ellipseAttributes?.fill).not.toBeNull();
  expect(particle?.ellipseAttributes?.fill).not.toBe("none");
}

test("Hunter view renders and sliders update values", async ({ page }) => {
  const issues = captureBrowserIssues(page);
  const hunter = await openHunterView(page);

  const triggerLabel = hunter
    .locator("label")
    .filter({ hasText: "Trigger Distance:" });

  await expect(triggerLabel).toBeVisible();

  await setHunterSlider(hunter, "Trigger Distance", "260");

  await expect(
    hunter.locator("label").filter({ hasText: "Trigger Distance: 260px" }),
  ).toBeVisible();

  expect(issues).toEqual([]);
});

test("Hunter view creates a paintable SVG PGO when pointer enters trigger range", async ({
  page,
}, testInfo) => {
  const issues = captureBrowserIssues(page);
  const hunter = await openHunterView(page);

  await setHunterSlider(hunter, "Trigger Distance", "320");
  await setHunterSlider(hunter, "Particle Alive Time", "5");
  await setHunterSlider(hunter, "VelX", "0");
  await setHunterSlider(hunter, "VelY", "-120");
  await setHunterSlider(hunter, "Particle Acceleration", "1");

  await movePointerInsideScannerTrigger(hunter);
  await expectPaintableParticle(hunter);

  const state = await getHunterParticleState(hunter);

  await testInfo.attach("hunter-particle-state.json", {
    body: JSON.stringify(state, null, 2),
    contentType: "application/json",
  });

  await testInfo.attach("hunter-view.png", {
    body: await page.screenshot({
      fullPage: true,
    }),
    contentType: "image/png",
  });

  expect(state.surfaceExists).toBe(true);
  expect(state.scannerExists).toBe(true);
  expect(state.count).toBeGreaterThan(0);
  expect(state.visibleCount).toBeGreaterThan(0);
  expect(state.svgCount).toBeGreaterThan(0);
  expect(state.ellipseCount).toBeGreaterThan(0);
  expect(state.paintableCount).toBeGreaterThan(0);
  expect(issues).toEqual([]);
});

test("Hunter view does not create one PGO per pointer move", async ({ page }) => {
  const issues = captureBrowserIssues(page);
  const hunter = await openHunterView(page);

  await setHunterSlider(hunter, "Trigger Distance", "320");
  await setHunterSlider(hunter, "Particle Alive Time", "5");

  const pointerMoveCount = 30;
  const pointerMoveIntervalMs = 60;

  await movePointerInsideScannerTriggerRepeated(
    hunter,
    pointerMoveCount,
    pointerMoveIntervalMs,
  );

  const state = await getHunterParticleState(hunter);

  expect(state.count).toBeGreaterThan(0);
  expect(state.count).toBeLessThan(pointerMoveCount);
  expect(state.count).toBeLessThanOrEqual(6);
  expect(state.visibleCount).toBeGreaterThan(0);
  expect(state.paintableCount).toBeGreaterThan(0);
  expect(issues).toEqual([]);
});
