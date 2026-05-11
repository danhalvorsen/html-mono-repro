import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const distDir = currentDir;

const scripts = [
  "main.js",
  "ctorSample.js",
  "invMain.js",
  "invCtorSample.js",
] as const;

for (const script of scripts) {
  const scriptPath = join(distDir, script);
  console.log(`\n=== Running ${script} ===`);

  const result = spawnSync("node", [scriptPath], { stdio: "inherit" });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\nAll 4 programs completed successfully.");
