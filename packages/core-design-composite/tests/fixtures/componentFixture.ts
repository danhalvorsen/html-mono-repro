import { expect } from "vitest";
import type { Component } from "../../src/core/component.js";

export type Fixture<TModel extends Component = Component> = Readonly<{
  model: TModel;
  element: HTMLElement;
}>;

export function createComponentFixture<TModel extends Component>(model: TModel): Fixture<TModel> {
  const element = model.createElement();
  return { model, element };
}

/** Strict DOM query: fails fast with a good error. */
export function $<T extends Element = Element>(
  root: ParentNode,
  selector: string
): T {
  const el = root.querySelector(selector);
  expect(el, `Expected element for selector: ${selector}`).not.toBeNull();
  return el as T;
}

/** Strict DOM queryAll: convenient + fails fast when empty. */
export function $all<T extends Element = Element>(
  root: ParentNode,
  selector: string
): ReadonlyArray<T> {
  const els = Array.from(root.querySelectorAll(selector)) as T[];
  expect(els.length, `Expected at least 1 element for selector: ${selector}`).toBeGreaterThan(0);
  return els;
}

/** Assert host tag name in a stable way. */
export function expectTag(el: Element, tag: string): void {
  expect(el.tagName.toLowerCase()).toBe(tag.toLowerCase());
}

/**
 * Host-shape assertion helper (solves: "possibly undefined" for host props).
 * Use it only when your model sets host properties (e.g. options arrays, state flags).
 */
export function assertHostProps<T extends object>(
  el: HTMLElement,
  props: ReadonlyArray<keyof T>
): asserts el is HTMLElement & T {
  const anyEl = el as any;
  for (const p of props) {
    expect(p in anyEl, `Expected host property "${String(p)}"`).toBe(true);
  }
}