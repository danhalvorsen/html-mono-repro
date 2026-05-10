import { afterEach, describe, expect, it } from "vitest";
import { readFile, readdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { CompositionRoot } from "../../src/index.js";

interface ExpectedShapeFile {
  readonly shapeName: string;
  readonly fileName: string;
  readonly width: string;
  readonly height: string;
  readonly expectedConstraints: readonly string[];
}

describe("SVG metadata contract integration", () => {
  const testFilePath = fileURLToPath(import.meta.url);
  const testRoot = resolve(dirname(testFilePath), "..");
  const inputPath = join(testRoot, "feeders.xml");
  const outputDirectory = join(testRoot, ".tmp-metadata-contract");

  const rootName = "pid.feeders";
  const sourceRootName = "mxGraph.pid.feeders";

  const expectedShapes: readonly ExpectedShapeFile[] = [
    {
      shapeName: "Feeder (Rotary Table)",
      fileName: "pid.feeders-Feeder (Rotary Table).svg",
      width: "104.65",
      height: "100",
      expectedConstraints: [
        '<constraint name="N" perimeter="0" x="0.5" y="0" />',
      ],
    },
    {
      shapeName: "Proportional Feeder",
      fileName: "pid.feeders-Proportional Feeder.svg",
      width: "100",
      height: "100",
      expectedConstraints: [
        '<constraint name="N" perimeter="0" x="0.5" y="0" />',
        '<constraint name="S" perimeter="0" x="0.5" y="1" />',
      ],
    },
    {
      shapeName: "Proportional Feeder (Metering)",
      fileName: "pid.feeders-Proportional Feeder (Metering).svg",
      width: "300",
      height: "50",
      expectedConstraints: [
        '<constraint name="NE" perimeter="0" x="1" y="0" />',
        '<constraint name="NW" perimeter="0" x="0" y="0" />',
      ],
    },
    {
      shapeName: "Proportional Feeder (Rotary Valve)",
      fileName: "pid.feeders-Proportional Feeder (Rotary Valve).svg",
      width: "100",
      height: "100",
      expectedConstraints: [
        '<constraint name="N" perimeter="0" x="0.5" y="0" />',
        '<constraint name="S" perimeter="0" x="0.5" y="1" />',
      ],
    },
    {
      shapeName: "Spray Nozzle",
      fileName: "pid.feeders-Spray Nozzle.svg",
      width: "100",
      height: "50",
      expectedConstraints: [
        '<constraint name="N" perimeter="0" x="0.5" y="0" />',
      ],
    },
  ];

  afterEach(async () => {
    await rm(outputDirectory, { recursive: true, force: true });
  });

  it("should use normalized root name and original shape name in every SVG filename", async () => {
    await exportSvgFiles();

    const files = (await readdir(outputDirectory)).sort();

    expect(files).toEqual(expectedShapes.map((shape) => shape.fileName).sort());

    for (const file of files) {
      expect(file.startsWith(`${rootName}-`)).toBe(true);
      expect(file.startsWith(`${sourceRootName}-`)).toBe(false);
      expect(file.endsWith(".svg")).toBe(true);
    }
  });

  it("should preserve root metadata and original shape metadata inside every SVG file", async () => {
    await exportSvgFiles();

    for (const expectedShape of expectedShapes) {
      const svg = await readSvg(expectedShape.fileName);

      expect(svg).toContain(`data-root-name="${rootName}"`);
      expect(svg).toContain(`data-shape-name="${expectedShape.shapeName}"`);
      expect(svg).not.toContain(`data-root-name="${sourceRootName}"`);

      expect(svg).toContain(`<title>${expectedShape.shapeName}</title>`);
      expect(svg).toContain(
        `<mxgraph-shape root-name="${rootName}" name="${expectedShape.shapeName}" w="${expectedShape.width}" h="${expectedShape.height}" aspect="variable" strokewidth="inherit">`,
      );

      for (const expectedConstraint of expectedShape.expectedConstraints) {
        expect(svg).toContain(expectedConstraint);
      }
    }
  });

  it("should keep an XML-like SVG structure with metadata before background and foreground groups", async () => {
    await exportSvgFiles();

    for (const expectedShape of expectedShapes) {
      const svg = await readSvg(expectedShape.fileName);

      assertOrdered(
        svg,
        "<metadata>",
        "<mxgraph-shape",
        "<connections>",
        "</metadata>",
        '<g data-layer="background">',
        '<g data-layer="foreground">',
        "</svg>",
      );
    }
  });

  it("should keep proportional feeder geometry in the same background and foreground sections as the source XML", async () => {
    await exportSvgFiles();

    const svg = await readSvg("pid.feeders-Proportional Feeder.svg");

    const background = sectionBetween(
      svg,
      '<g data-layer="background">',
      "</g>",
    );

    const foreground = sectionBetween(
      svg,
      '<g data-layer="foreground">',
      "</g>",
    );

    expect(background).toContain(
      '<ellipse cx="50" cy="50" rx="50" ry="50"',
    );
    expect(background).not.toContain(
      '<path d="M 10 20 L 90 20 L 10 80 L 90 80"',
    );

    expect(foreground).toContain(
      '<path d="M 10 20 L 90 20 L 10 80 L 90 80"',
    );
    expect(foreground).toContain('stroke-linejoin="round"');
  });

  it("should keep rotary valve foreground path and center ellipse in foreground section", async () => {
    await exportSvgFiles();

    const svg = await readSvg("pid.feeders-Proportional Feeder (Rotary Valve).svg");

    const background = sectionBetween(
      svg,
      '<g data-layer="background">',
      "</g>",
    );

    const foreground = sectionBetween(
      svg,
      '<g data-layer="foreground">',
      "</g>",
    );

    expect(background).toContain(
      '<ellipse cx="50" cy="50" rx="50" ry="50"',
    );
    expect(background).not.toContain(
      '<ellipse cx="50" cy="50" rx="5" ry="5"',
    );

    expect(foreground).toContain(
      '<path d="M 0 50 L 100 50 M 75.8 7 L 24.2 93 M 24.2 7 L 75.8 93"',
    );
    expect(foreground).toContain(
      '<ellipse cx="50" cy="50" rx="5" ry="5"',
    );
  });

  it("should keep spray nozzle geometry in the background section and still emit an explicit foreground section", async () => {
    await exportSvgFiles();

    const svg = await readSvg("pid.feeders-Spray Nozzle.svg");

    const background = sectionBetween(
      svg,
      '<g data-layer="background">',
      "</g>",
    );

    expect(background).toContain(
      '<path d="M 0 50 L 50 0 L 100 50 M 50 0 L 50 50"',
    );

    expect(svg).toContain('<g data-layer="foreground">');
    expect(svg).toContain("</svg>");
  });

  async function exportSvgFiles(): Promise<void> {
    await new CompositionRoot()
      .createApplication()
      .exportSvgFiles({ inputPath, outputDirectory });
  }

  async function readSvg(fileName: string): Promise<string> {
    return readFile(join(outputDirectory, fileName), "utf8");
  }

  function assertOrdered(content: string, ...tokens: readonly string[]): void {
    let lastIndex = -1;

    for (const token of tokens) {
      const index = content.indexOf(token);

      expect(index, `Token was not found: ${token}`).toBeGreaterThanOrEqual(0);
      expect(index, `Token was out of order: ${token}`).toBeGreaterThan(lastIndex);

      lastIndex = index;
    }
  }

  function sectionBetween(
    content: string,
    startToken: string,
    endToken: string,
  ): string {
    const startIndex = content.indexOf(startToken);

    expect(startIndex, `Start token was not found: ${startToken}`).toBeGreaterThanOrEqual(0);

    const contentStartIndex = startIndex + startToken.length;
    const endIndex = content.indexOf(endToken, contentStartIndex);

    expect(endIndex, `End token was not found after: ${startToken}`).toBeGreaterThan(contentStartIndex);

    return content.slice(contentStartIndex, endIndex);
  }
});