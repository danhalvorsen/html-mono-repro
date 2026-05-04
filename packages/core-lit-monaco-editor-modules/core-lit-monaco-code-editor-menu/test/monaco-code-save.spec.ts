// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MonacoMenuEventNames } from "../src/menu-events.js";
import "../src/monaco-code-save.js";
import {
  cleanupDom,
  createReadableTarget,
} from "./fixtures/component-test-fixtures.js";

describe("monaco-code-save", () => {
  beforeEach(() => {
    cleanupDom();
    Object.defineProperty(URL, "createObjectURL", {
      value: vi.fn(() => "blob:mock-url"),
      configurable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: vi.fn(),
      configurable: true,
    });
  });

  afterEach(() => {
    cleanupDom();
    vi.restoreAllMocks();
  });

  const mount = async () => {
    createReadableTarget("const x = 1;");

    const element = document.createElement("monaco-code-save") as HTMLElement & {
      targetSelector: string;
      fileName: string;
      updateComplete?: Promise<unknown>;
      shadowRoot: ShadowRoot;
    };

    element.targetSelector = "#editor-target";
    element.fileName = "main.ts";
    document.body.append(element);
    await element.updateComplete;

    const button = element.shadowRoot.querySelector("button") as HTMLButtonElement;

    return { element, button };
  };

  it("should dispatch save event with project payload", async () => {
    const { element, button } = await mount();
    const received = vi.fn((event: Event) => {
      event.preventDefault();
    });

    element.addEventListener(MonacoMenuEventNames.SaveCodeFile, received);

    button.click();

    expect(received).toHaveBeenCalledTimes(1);
    const detail = (received.mock.calls[0]?.[0] as CustomEvent).detail;

    expect(detail.fileName).toBe("main.ts");
    expect(detail.content).toBe("const x = 1;");
    expect(detail.files).toEqual([
      {
        path: "main.ts",
        fileName: "main.ts",
        content: "const x = 1;",
      },
    ]);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("should continue with browser download when not canceled", async () => {
    const { element, button } = await mount();
    const received = vi.fn();
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    element.addEventListener(MonacoMenuEventNames.SaveCodeFile, received);

    button.click();

    expect(received).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
