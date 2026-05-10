import { expect, test } from "@playwright/test";

async function installMidiSpy(page: import("@playwright/test").Page): Promise<void> {
  await page.evaluate(() => {
    (window as unknown as { __midiCalls: unknown[] }).__midiCalls = [];
    const app = document.querySelector("piano-app") as HTMLElement | null;
    const octave = app?.shadowRoot?.querySelector("piano-octave") as
      | (HTMLElement & { midiPlayer?: { play: (message: unknown, options: unknown) => void } })
      | null;

    if (!octave) {
      throw new Error("Missing piano-octave for midi spy installation");
    }

    octave.midiPlayer = {
      play: (message: unknown, options: unknown) => {
        (window as unknown as { __midiCalls: unknown[] }).__midiCalls.push({
          message,
          options,
        });
      },
    };
  });
}

async function clickFirstTangent(page: import("@playwright/test").Page): Promise<void> {
  await page.evaluate(() => {
    const app = document.querySelector("piano-app") as HTMLElement | null;
    if (!app?.shadowRoot) {
      throw new Error("Missing piano-app shadowRoot");
    }

    const root = app.shadowRoot.querySelector("piano-root-new") as HTMLElement | null;
    const octave = app.shadowRoot.querySelector("piano-octave") as HTMLElement | null;
    if (!root?.shadowRoot || !octave?.shadowRoot) {
      throw new Error("Missing root/octave shadowRoot");
    }

    const tangent = octave.shadowRoot.querySelector("tangent-new-wc") as HTMLElement | null;
    const path = tangent?.shadowRoot?.querySelector("path") as SVGPathElement | null;
    if (!path) {
      throw new Error("Missing tangent path");
    }

    path.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true, pointerId: 1 }));
    path.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, composed: true, pointerId: 1 }));
  });
}

async function clickFirstTangentByClickOnly(
  page: import("@playwright/test").Page
): Promise<void> {
  await page.evaluate(() => {
    const app = document.querySelector("piano-app") as HTMLElement | null;
    const octave = app?.shadowRoot?.querySelector("piano-octave") as HTMLElement | null;
    const tangent = octave?.shadowRoot?.querySelector("tangent-new-wc") as
      | (HTMLElement & { pressed?: boolean; shadowRoot: ShadowRoot })
      | null;
    const path = tangent?.shadowRoot?.querySelector("path") as SVGPathElement | null;

    if (!path || !tangent) {
      throw new Error("Missing tangent path for click-only test");
    }

    path.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));

    (window as unknown as { __tangentPressedAfterClick?: boolean }).__tangentPressedAfterClick =
      tangent.pressed ?? false;
  });
}

test("clicking a tangent sends MIDI payload to player", async ({ page }) => {
  await page.goto("/");
  await installMidiSpy(page);
  await clickFirstTangent(page);

  await expect
    .poll(async () =>
      page.evaluate(() => (window as unknown as { __midiCalls: unknown[] }).__midiCalls.length)
    )
    .toBeGreaterThan(0);

  const midiCall = await page.evaluate(() => {
    const calls = (window as unknown as { __midiCalls: Array<{ message: unknown; options: unknown }> }).__midiCalls;
    return calls.at(-1) ?? null;
  });

  expect(midiCall).not.toBeNull();
  expect(midiCall?.options).toBeTruthy();
});

test("one octave tangent click plays one note, not a scale", async ({ page }) => {
  await page.goto("/");
  await installMidiSpy(page);
  await clickFirstTangent(page);

  await expect
    .poll(async () =>
      page.evaluate(() => (window as unknown as { __midiCalls: unknown[] }).__midiCalls.length)
    )
    .toBe(2);

  const summary = await page.evaluate(() => {
    const calls = (window as unknown as {
      __midiCalls: Array<{ message: { status: number; note: { value: () => number } } }>;
    }).__midiCalls;

    return {
      statuses: calls.map((item) => item.message.status),
      notes: calls.map((item) => item.message.note.value()),
    };
  });

  expect(summary.notes.length).toBe(2);
  expect(new Set(summary.notes).size).toBe(1);
  expect(summary.statuses).toEqual([0x90, 0x80]);
});

test("click-only path emits one note pair and does not leave key pressed", async ({
  page,
}) => {
  await page.goto("/");
  await installMidiSpy(page);
  await clickFirstTangentByClickOnly(page);

  await expect
    .poll(async () =>
      page.evaluate(() => (window as unknown as { __midiCalls: unknown[] }).__midiCalls.length)
    )
    .toBe(2);

  const details = await page.evaluate(() => {
    const calls = (window as unknown as {
      __midiCalls: Array<{ message: { status: number; note: { value: () => number } } }>;
      __tangentPressedAfterClick?: boolean;
    }).__midiCalls;

    return {
      statuses: calls.map((item) => item.message.status),
      notes: calls.map((item) => item.message.note.value()),
      pressedAfterClick:
        (window as unknown as { __tangentPressedAfterClick?: boolean })
          .__tangentPressedAfterClick ?? true,
    };
  });

  expect(details.statuses).toEqual([0x90, 0x80]);
  expect(new Set(details.notes).size).toBe(1);
  expect(details.pressedAfterClick).toBe(false);
});
