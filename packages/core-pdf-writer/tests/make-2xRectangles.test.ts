/* Make 4 rectangles 
Rectangle 1: (1,2) (2,2), (2,1), (1,1)
Rectangle 2: (3,2) (4,2), (4,1), (3,1)
Rectangle 3: (1,-1) (2,-1), (2,-2), (1,-2)  
Rectangle 4: (3,-1) (4,-1), (4,-2), (3,-2)

The rectangles must be save as a 4xrects-basic.pdf file in the test output folder. The test should check that the file is created and has a non-zero 
*/

// packages/core-pdf-writer/tests/integration/4xrects-basic.integration.test.ts

import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { CoreFileSystemModule, Path } from "@monorepo/core-filesystem";

describe("4xrects-basic.pdf", () => {
  it("should create a pdf file with four rectangles and non-zero size", async () => {
    const document = await PDFDocument.create();
    const page = document.addPage([600, 600]);

    const scale = 100;
    const originX = 100;
    const originY = 300;

    const rectangles = [
      { x: 1, y: 2, width: 1, height: 1 },   // Rectangle 1
      { x: 3, y: 2, width: 1, height: 1 },   // Rectangle 2
      { x: 1, y: -1, width: 1, height: 1 },  // Rectangle 3
      { x: 3, y: -1, width: 1, height: 1 },  // Rectangle 4
    ] as const;

    for (const rectangle of rectangles) {
      page.drawRectangle({
        x: originX + rectangle.x * scale,
        y: originY + rectangle.y * scale,
        width: rectangle.width * scale,
        height: rectangle.height * scale,
        borderWidth: 1,
      });
    }

    const pdfBytes = await document.save();

    const fileSystem = new CoreFileSystemModule();
    const outputDirectoryPath = Path.from("tests", "output");
    const outputFilePath = outputDirectoryPath.join("4xrects-basic.pdf");

    const outputDirectory = fileSystem.createDirectory(outputDirectoryPath);
    outputDirectory.create(true);

    const outputFile = fileSystem.createFile(outputFilePath);
    outputFile.write(Buffer.from(pdfBytes).toString("latin1"), "latin1");

    expect(outputFile.exists()).toBe(true);

    const fileStat = fileSystem.fileSystem.stat(outputFilePath.full);
    expect(fileStat.mtimeMs).toBeGreaterThan(0);

    const content = outputFile.read("latin1");
    expect(content.length).toBeGreaterThan(0);
  });
});