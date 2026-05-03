import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const moduleRoot = resolve(dirname(scriptPath), "..");
const sourceRoot = resolve(moduleRoot, "src");
const SAMPLE_FOLDER_PREFIX = "sample";
const PROJECT_MANIFEST_FILE_NAME = "project.json";
const OUTPUT_MANIFEST_FILE_NAME = "samples.manifest.json";
const defaultOutputRoot = resolve(
  moduleRoot,
  "..",
  "core-lit-monaco-editor-application",
  "samples",
);

const outputRoot = resolve(process.cwd(), process.argv[2] ?? defaultOutputRoot);

const readSampleNames = async () => {
  const entries = await readdir(sourceRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(SAMPLE_FOLDER_PREFIX))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
};

const toManifestEntry = async (sampleName) => {
  const projectJsonPath = resolve(sourceRoot, sampleName, PROJECT_MANIFEST_FILE_NAME);
  const projectJson = JSON.parse(await readFile(projectJsonPath, "utf8"));

  return {
    folder: sampleName,
    name: projectJson.name ?? sampleName,
    version: projectJson.version ?? "0.0.0",
    projectJson: `${sampleName}/${PROJECT_MANIFEST_FILE_NAME}`,
  };
};

const main = async () => {
  const sampleNames = await readSampleNames();

  await mkdir(outputRoot, { recursive: true });

  for (const sampleName of sampleNames) {
    const source = resolve(sourceRoot, sampleName);
    const target = resolve(outputRoot, sampleName);
    await cp(source, target, { recursive: true, force: true });
  }

  const manifest = {
    count: sampleNames.length,
    samples: await Promise.all(sampleNames.map((sampleName) => toManifestEntry(sampleName))),
  };

  await writeFile(
    resolve(outputRoot, OUTPUT_MANIFEST_FILE_NAME),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  console.log(`Extracted ${sampleNames.length} sample(s) to ${outputRoot}`);
};

await main();
