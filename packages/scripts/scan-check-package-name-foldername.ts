import { promises as fs } from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");

async function isDir(p: string) {
  try { return (await fs.stat(p)).isDirectory(); }
  catch { return false; }
}

async function exists(p: string) {
  try { await fs.stat(p); return true; }
  catch { return false; }
}

async function scanModules(root: string): Promise<string[]> {
  const found: string[] = [];

  async function walk(dir: string) {
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      if (!item.isDirectory()) continue;
      if (["node_modules", ".git", "dist", "build"].includes(item.name)) continue;

      const folder = path.join(dir, item.name);
      const pkg = path.join(folder, "package.json");
      const src = path.join(folder, "src");

      const isModule = (await exists(pkg)) && (await isDir(src));

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

async function readPackageName(folder: string): Promise<string | null> {
  try {
    const json = JSON.parse(await fs.readFile(path.join(folder, "package.json"), "utf-8"));
    return json.name ?? null;
  } catch {
    return null;
  }
}

function lastSegment(name: string) {
  return name.split("/").pop()!;
}

async function run() {
  const modules = await scanModules(ROOT);

  const mismatches: Array<{
    folder: string;
    folderName: string;
    pkgName: string;
    expected: string;
  }> = [];

  for (const moduleDir of modules) {
    const pkgName = await readPackageName(moduleDir);
    if (!pkgName) continue;

    const folderName = path.basename(moduleDir);
    const expected = lastSegment(pkgName);

    if (folderName !== expected) {
      mismatches.push({
        folder: moduleDir,
        folderName,
        pkgName,
        expected
      });
    }
  }

  console.log(JSON.stringify(mismatches, null, 2));
}

run().catch(err => {
  console.error("ERROR:", err);
  process.exit(1);
});
