import { describe, expect, it } from "vitest";

describe("CompositePdfEngine - QuadTree line grouping", () => {
  it("Given scattered text fragments When grouped Then lines are reconstructed correctly", async () => {
    const engine = new (await import("../src/engine/CompositePdfEngine.js")).CompositePdfEngine();

    // Arrange (same page)
    const fragments = Object.freeze([
      Object.freeze({ pageNumber: 1, text: "Hello", x: 10, y: 100, width: 20, height: 10 }),
      Object.freeze({ pageNumber: 1, text: "World", x: 40, y: 100, width: 20, height: 10 }),

      Object.freeze({ pageNumber: 1, text: "Foo", x: 10, y: 200, width: 20, height: 10 }),
      Object.freeze({ pageNumber: 1, text: "Bar", x: 40, y: 200, width: 20, height: 10 }),

      // noise: slightly offset but same line
      Object.freeze({ pageNumber: 1, text: "!", x: 70, y: 102, width: 10, height: 10 }),
    ]);

    // Act (call private via cast – intentional for unit test)
    const lines = (engine as any).groupIntoLines(fragments);

    // Assert
    expect(lines.length).toBe(2);

    expect(lines[0]).toBe("Hello World !");
    expect(lines[1]).toBe("Foo Bar");
  });

  it("Given vertical separation When grouping Then fragments are not merged across lines", async () => {
    const engine = new (await import("../src/engine/CompositePdfEngine.js")).CompositePdfEngine();

    const fragments = Object.freeze([
      Object.freeze({ pageNumber: 1, text: "A", x: 0, y: 100, width: 10, height: 10 }),
      Object.freeze({ pageNumber: 1, text: "B", x: 20, y: 130, width: 10, height: 10 }), // outside tolerance
    ]);

    const lines = (engine as any).groupIntoLines(fragments);

    expect(lines.length).toBe(2);
    expect(lines).toContain("A");
    expect(lines).toContain("B");
  });

  it("Given unordered fragments When grouping Then output is sorted left-to-right", async () => {
    const engine = new (await import("../src/engine/CompositePdfEngine.js")).CompositePdfEngine();

    const fragments = Object.freeze([
      Object.freeze({ pageNumber: 1, text: "B", x: 50, y: 100, width: 10, height: 10 }),
      Object.freeze({ pageNumber: 1, text: "A", x: 10, y: 100, width: 10, height: 10 }),
      Object.freeze({ pageNumber: 1, text: "C", x: 90, y: 100, width: 10, height: 10 }),
    ]);

    const lines = (engine as any).groupIntoLines(fragments);

    expect(lines.length).toBe(1);
    expect(lines[0]).toBe("A B C");
  });
});