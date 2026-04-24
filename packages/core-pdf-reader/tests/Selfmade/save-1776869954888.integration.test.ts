import { describe, expect, it } from "vitest";

import { Save1776869954888Fixture } from "./Save1776869954888Fixture.js";

describe("CompositePdfEngine (Selfmade) integration", () => {
  const fixture = new Save1776869954888Fixture();

  it("reads one page from save-1776869954888.pdf", async () => {
    const pageCount = await fixture.readPageCount();
    expect(pageCount).toBe(1);
  });

  it("returns no text fragments for geometry-only save-1776869954888.pdf", async () => {
    const fragments = await fixture.readTextFragments();
    const pages = await fixture.readPages();

    expect(fragments.length).toBe(0);
    expect(pages.length).toBe(1);
    expect(pages[0]?.text ?? "").toBe("");
  });

  it("extracts 9-10 rectangle fragments from draw operators", async () => {
    const rectangles = await fixture.readRectangleFragments();

    expect(rectangles.length).toBeGreaterThanOrEqual(9);
    expect(rectangles.length).toBeLessThanOrEqual(10);
    expect(
      rectangles.every((rectangle) =>
        rectangle.boundingBox.width > 0
        && rectangle.boundingBox.height > 0
        && Number.isFinite(rectangle.boundingBox.position.x)
        && Number.isFinite(rectangle.boundingBox.position.y),
      ),
    ).toBe(true);
  });

  it("setText(content) writes text into an in-memory pdf readable by engine", async () => {
    const textFixture = new Save1776869954888Fixture();
    await textFixture.setText("Hello from fixture");

    const pageCount = await textFixture.readPageCount();
    const fragments = await textFixture.readTextFragments();

    expect(pageCount).toBe(1);
    expect(fragments.length).toBeGreaterThan(0);
    expect(fragments.some((fragment) => fragment.text.includes("Hello"))).toBe(true);
  });

  it("boxes-only fixture yields rectangle fragments and no text fragments", async () => {
    const boxesFixture = new Save1776869954888Fixture();
    await boxesFixture.setBoxesOnly(10);

    const rectangles = await boxesFixture.readRectangleFragments();
    const textFragments = await boxesFixture.readTextFragments();

    expect(rectangles.length).toBe(10);
    expect(textFragments.length).toBe(0);
  });

  it("boxes-with-text fixture yields rectangle fragments and text fragments", async () => {
    const boxesWithTextFixture = new Save1776869954888Fixture();
    await boxesWithTextFixture.setBoxesWithText(["A", "B", "C", "D"]);

    const rectangles = await boxesWithTextFixture.readRectangleFragments();
    const textFragments = await boxesWithTextFixture.readTextFragments();

    expect(rectangles.length).toBe(4);
    expect(textFragments.length).toBeGreaterThanOrEqual(4);
    expect(textFragments.some((fragment) => fragment.text.includes("A"))).toBe(true);
    expect(textFragments.some((fragment) => fragment.text.includes("D"))).toBe(true);
  });
});
