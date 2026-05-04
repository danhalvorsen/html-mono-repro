// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MonacoMenuEventNames } from "../src/menu-events.js";
import "../src/monaco-code-load.js";
import {
  assignInputFiles,
  cleanupDom,
  createTextFile,
  createWritableTarget,
  waitForAsyncTasks,
} from "./fixtures/component-test-fixtures.js";

describe("monaco-code-load", () => {
  beforeEach(() => {
    cleanupDom();
  });

  afterEach(() => {
    cleanupDom();
    vi.restoreAllMocks();
  });

  const mount = async () => {
    const target = createWritableTarget();
    const element = document.createElement("monaco-code-load") as HTMLElement & {
      targetSelector: string;
      updateComplete?: Promise<unknown>;
      shadowRoot: ShadowRoot;
    };

    element.targetSelector = "#editor-target";
    document.body.append(element);
    await element.updateComplete;

    const input = element.shadowRoot.querySelector("input[type=file]") as HTMLInputElement;
    const button = element.shadowRoot.querySelector("button") as HTMLButtonElement;

    return { element, target, input, button };
  };

  it("should load folder files and prioritize main.ts as primary content", async () => {
    const { element, target, input } = await mount();
    const received = vi.fn();
    element.addEventListener(MonacoMenuEventNames.LoadCodeFile, received);

    assignInputFiles(input, [
      createTextFile("index.html", "<main>h</main>", "my-project/index.html"),
      createTextFile("styles.css", "body{}", "my-project/styles.css"),
      createTextFile("main.ts", "console.log('x')", "my-project/main.ts"),
    ]);

    input.dispatchEvent(new Event("change"));
    await waitForAsyncTasks();

    expect(target.setValue).toHaveBeenCalledWith("console.log('x')");
    expect(received).toHaveBeenCalledTimes(1);

    const detail = (received.mock.calls[0]?.[0] as CustomEvent).detail;
    expect(detail.fileName).toBe("main.ts");
    expect(detail.folderName).toBe("my-project");
    expect(detail.files.map((entry: { path: string }) => entry.path)).toEqual([
      "my-project/index.html",
      "my-project/main.ts",
      "my-project/styles.css",
    ]);
  });

  it("should fallback to first sorted file when no preferred file exists", async () => {
    const { element, target, input } = await mount();
    const received = vi.fn();
    element.addEventListener(MonacoMenuEventNames.LoadCodeFile, received);

    assignInputFiles(input, [
      createTextFile("z-last.md", "last", "project/z-last.md"),
      createTextFile("a-first.txt", "first", "project/a-first.txt"),
    ]);

    input.dispatchEvent(new Event("change"));
    await waitForAsyncTasks();

    expect(target.setValue).toHaveBeenCalledWith("first");

    const detail = (received.mock.calls[0]?.[0] as CustomEvent).detail;
    expect(detail.fileName).toBe("a-first.txt");
  });

  it("should ignore empty folder selections", async () => {
    const { element, target, input } = await mount();
    const received = vi.fn();
    element.addEventListener(MonacoMenuEventNames.LoadCodeFile, received);

    assignInputFiles(input, []);

    input.dispatchEvent(new Event("change"));
    await waitForAsyncTasks();

    expect(target.setValue).not.toHaveBeenCalled();
    expect(received).not.toHaveBeenCalled();
  });

  it("should prefer showPicker over click when available", async () => {
    const { input, button } = await mount();
    const showPicker = vi.fn();
    const click = vi.fn();

    Object.defineProperty(input, "showPicker", {
      value: showPicker,
      configurable: true,
    });

    input.click = click;

    button.click();

    expect(showPicker).toHaveBeenCalledTimes(1);
    expect(click).not.toHaveBeenCalled();
  });
});
