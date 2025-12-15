import fs from "fs";
import path from "path";
import { Path } from "@my-graphics/core-filesystem";
import { LoggerProvider } from "@my-graphics/core-logger";
import { ValidationTemplate } from "@my-graphics/core-template";
import { PackageJson as packageJsonSchema } from "zod-package-json";
import { z } from "zod";

export class ModuleAnalyzer {
  private readonly logger = LoggerProvider.create("ModuleAnalyzer");
  private readonly mismatchTemplate = new ValidationTemplate<{ folder: string; reason: string }>(
    "${folder} (${reason})"
  );

  constructor(private readonly root: Path) {}

  /**
   * Returns true when every directory under root starting with "core-"
   * has a package.json whose name matches the directory name (scope ignored).
   */
  folderNameIsPackageName(): boolean {
    return this.findMismatchedModules().length === 0;
  }

  /**
   * Lists any core-* directories whose package.json name does not match the folder.
   */
  findMismatchedModules(): string[] {
    const mismatches: string[] = [];

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(this.root.full, { withFileTypes: true });
    } catch {
      const msg = `<root-unreadable>`;
      this.logger.error("Failed to read root directory {root}", { root: this.root.full });
      return [msg];
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (!entry.name.startsWith("core-")) continue;

      const dirPath = this.root.join(entry.name);
      const pkgPath = dirPath.join("package.json");
      if (!pkgPath.exists()) {
        const message = this.formatMismatch(entry.name, "missing package.json");
        mismatches.push(message);
        this.logger.warn("Missing package.json in {dir}", { dir: dirPath.full });
        continue;
      }

      let pkgJson: unknown;
      let pkgName: string | undefined = undefined;
      try {
        const raw = fs.readFileSync(pkgPath.full, "utf-8").replace(/^\uFEFF/, "");
      pkgJson = JSON.parse(raw);
    } catch (err) {
      const reason = `invalid JSON: ${(err as Error).message ?? "unknown"}`;
      const message = this.formatMismatch(entry.name, reason);
      mismatches.push(message);
        this.logger.error("Failed to parse package.json in {dir}", {
          dir: dirPath.full,
          reason
        });
        continue;
      }

      const validation = packageJsonSchema.safeParse(pkgJson);
      if (!validation.success) {
        const details = this.formatZodErrors(validation.error);
        const message = this.formatMismatch(entry.name, `invalid package.json: ${details}`);
        mismatches.push(message);
        this.logger.error("Package.json schema validation failed", {
          dir: dirPath.full,
          details
        });
        continue;
      }

      pkgName = validation.data.name;

      const folderName = path.basename(dirPath.full);
      if (!pkgName) {
        const message = this.formatMismatch(entry.name, "missing package name");
        mismatches.push(message);
        this.logger.debug("Package.json missing name", { dir: dirPath.full });
        continue;
      }

      const normalizedName = pkgName.includes("/") ? pkgName.split("/").pop()! : pkgName;
      const containsFolderName = normalizedName.includes(folderName);

      if (!containsFolderName) {
        const message = this.formatMismatch(
          entry.name,
          `package name does not include folder: ${pkgName}`
        );
        mismatches.push(message);
        this.logger.debug("Folder/package mismatch detected", {
          folder: folderName,
          packageName: pkgName ?? "undefined"
        });
      }
    }

    return mismatches;
  }

  private formatMismatch(folder: string, reason: string): string {
    return this.mismatchTemplate.render({ folder, reason });
  }

  private formatZodErrors(error: z.ZodError): string {
    return error.issues
      .map((issue) => {
        const pathStr = issue.path.join(".") || "<root>";
        return `${pathStr}: ${issue.message}`;
      })
      .join("; ");
  }
}
