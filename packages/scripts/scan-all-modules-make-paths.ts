import { promises as fs } from "fs";
import path from "path";

interface TsConfigPaths {
  [pkg: string]: string[];
}

const ROOT = path.resolve(__dirname, "..");

const IGNORE = new Set([
  "node_modules",
  ".git",
  ".turbo",
  ".next",
  "dist",
  "build",
  "out",
  ".cache"
]);

async function isDirectory(p: string): Promise<boolean> {
  try {
    return (await fs.stat(p)).isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function scanModules(root: string): Promise<string[]> {
  const found: string[] = [];

  async function walk(current: string) {
    const items = await fs.readdir(current, { withFileTypes: true });

    for (const item of items) {
      if (!item.isDirectory()) continue;
      if (IGNORE.has(item.name)) continue;

      const folder = path.join(current, item.name);
      const pkg = path.join(folder, "package.json");
      const src = path.join(folder, "src");

      const isModule = (await fileExists(pkg)) && (await isDirectory(src));

      if (isModule) {
        found.push(folder);
        continue;
      }

      await walk(folder);
    }
  }

  await walk(root);
  return found;
}

async function readPackageName(dir: string): Promise<string | null> {
  try {
    const json = JSON.parse(await fs.readFile(path.join(dir, "package.json"), "utf-8"));
    return typeof json.name === "string" ? json.name : null;
  } catch {
    return null;
  }
}

async function buildPaths(): Promise<TsConfigPaths> {
  const moduleDirs = await scanModules(ROOT);
  const result: TsConfigPaths = {};

  for (const moduleDir of moduleDirs) {
    const pkgName = await readPackageName(moduleDir);
    if (!pkgName) continue;

    const srcRel = path
      .relative(ROOT, path.join(moduleDir, "src"))
      .replace(/\\/g, "/");

    result[pkgName] = [srcRel];
  }

  return result;
}

async function run() {
  const paths = await buildPaths();
  console.log(JSON.stringify(paths, null, 2));
}

run().catch(err => {
  console.error("ERROR:", err);
  process.exit(1);
});
