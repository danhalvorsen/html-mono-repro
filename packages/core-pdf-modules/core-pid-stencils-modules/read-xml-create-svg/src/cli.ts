import { ProductSvgExportDefaults } from "./application/ProductSvgExportDefaults.js";
import { CompositionRoot } from "./composition/CompositionRoot.js";

const command = process.argv[2];

if (command === "export-products") {
  await new CompositionRoot()
    .createApplication()
    .exportSvgFiles({
      inputPath: ProductSvgExportDefaults.InputPath,
      outputDirectory: ProductSvgExportDefaults.OutputDirectory
    });
} else if (command === "export-svg") {
  const inputPath = process.argv[3];
  const outputDirectory = process.argv[4];

  if (!inputPath || !outputDirectory) {
    console.error("Usage: pnpm convert export-svg <input.xml> <output-directory>");
    process.exitCode = 1;
  } else {
    await new CompositionRoot()
      .createApplication()
      .exportSvgFiles({ inputPath, outputDirectory });
  }
} else {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!inputPath || !outputPath) {
    console.error("Usage:");
    console.error("  pnpm convert <input.xml> <output.xml>");
    console.error("  pnpm convert export-svg <input.xml> <output-directory>");
    console.error("  pnpm create-products");
    process.exitCode = 1;
  } else {
    await new CompositionRoot()
      .createApplication()
      .convertFile({ inputPath, outputPath });
  }
}