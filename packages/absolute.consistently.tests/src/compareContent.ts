import fs from "fs";
import path from "path";
import { PackageJson as PackageJsonSchema } from "zod-package-json";
import { z } from "zod";

type CompareResult =
  | { equal: true }
  | { equal: false; reason: string };

const schemaByExtension: Record<string, z.ZodTypeAny> = {
  ".json": PackageJsonSchema
};

/**
 * Compares two files for semantic equality.
 * Only schema-backed comparisons are allowed. If no schema exists for the extension,
 * the comparison is rejected as unsafe.
 */
export function compareContent(sourcePath: string, referencePath: string): CompareResult {
  const ext = path.extname(sourcePath).toLowerCase();
  const schema = schemaByExtension[ext];

  if (!fs.existsSync(sourcePath)) return { equal: false, reason: "source missing" };
  if (!fs.existsSync(referencePath)) return { equal: false, reason: "reference missing" };

  const sourceRaw = fs.readFileSync(sourcePath, "utf-8").replace(/^\uFEFF/, "");
  const referenceRaw = fs.readFileSync(referencePath, "utf-8").replace(/^\uFEFF/, "");

  if (!schema) return { equal: false, reason: "no schema available for extension" };

  try {
    const a = schema.parse(JSON.parse(sourceRaw));
    const b = schema.parse(JSON.parse(referenceRaw));
    return deepEqual(a, b)
      ? { equal: true }
      : { equal: false, reason: "schema-validated content differs" };
  } catch (err) {
    return { equal: false, reason: `schema validation failed: ${(err as Error).message}` };
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === "object") {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((v, i) => deepEqual(v, b[i]));
    }

    const aEntries = Object.entries(a as Record<string, unknown>).sort(([k1], [k2]) =>
      k1.localeCompare(k2)
    );
    const bEntries = Object.entries(b as Record<string, unknown>).sort(([k1], [k2]) =>
      k1.localeCompare(k2)
    );
    if (aEntries.length !== bEntries.length) return false;
    return aEntries.every(([k, v], idx) => k === bEntries[idx][0] && deepEqual(v, bEntries[idx][1]));
  }
  return false;
}
