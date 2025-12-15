// scripts/find-libraries.ts
import { Directory } from "../core-filesystem/src/Directory";
import { Path } from "../core-filesystem/src/Path";
import fs from "fs";

interface ModuleInfo {
  name: string;
  path: string;
}

export class LibraryScanner {
  constructor(private readonly root: Directory) {}

  public scan(): ModuleInfo[] {
    return this.scanDirectory(this.root);
  }

  private scanDirectory(dir: Directory): ModuleInfo[] {
    const modules: ModuleInfo[] = [];

    for (const sub of dir.listDirs()) {
      const pkg = sub.path.join("package.json");

      if (pkg.exists()) {
        // Found a library module
        const json = JSON.parse(fs.readFileSync(pkg.full, "utf-8"));
        modules.push({
          name: json.name ?? sub.path.basename,
          path: sub.path.full
        });
      }

      // Always walk deeper – supports nested structures like:
      // /Libraries/core-reactive-multiplatform-modules/core-reactive-controller
      modules.push(...this.scanDirectory(sub));
    }

    return modules;
  }
}

// -----------------------------------------------------------------------------
// Execute when called directly
// -----------------------------------------------------------------------------
if (require.main === module) {
  const libsPath = Path.from(process.cwd(), "Libraries");
  const libsDir = new Directory(libsPath);

  if (!libsDir.exists()) {
    console.error("❌ Could not find /Libraries folder");
    process.exit(1);
  }

  const scanner = new LibraryScanner(libsDir);
  const modules = scanner.scan();

  console.log("📦 Discovered modules:");
  console.log(JSON.stringify(modules, null, 2));
}
