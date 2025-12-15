import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { createHash } from "crypto";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const referenceRoot = path.join(root, "reference");

const stripBom = (text: string) => text.replace(/^\uFEFF/, "");

const allowedLibSets = [
  ["ES2022"], // Node profile
  ["ES2022", "DOM", "DOM.Iterable"] // Web profile
];

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    return entries.reduce<Record<string, unknown>>((acc, [k, v]) => {
      acc[k] = canonicalize(v);
      return acc;
    }, {});
  }
  return value;
}

function hashObject(obj: unknown): string {
  const canonical = canonicalize(obj);
  const serialized = JSON.stringify(canonical);
  return createHash("sha256").update(serialized).digest("hex");
}

function readJson(file: string): any {
  const raw = stripBom(fs.readFileSync(file, "utf-8"));
  return JSON.parse(raw);
}

async function loadConfig(file: string): Promise<any> {
  const mod = await import(pathToFileURL(file).href);
  return mod.default ?? mod;
}

function assertAllowedLibsAndTarget(file: string, config: any) {
  const libs: string[] | undefined = config?.compilerOptions?.lib;
  const target: string | undefined = config?.compilerOptions?.target;

  if (libs) {
    const normalized = libs.slice().sort();
    const match = allowedLibSets.some(
      (set) => set.length === normalized.length && set.every((v, i) => v === normalized[i])
    );
    expect(match).toBe(true);
  }

  if (target !== undefined) {
    expect(target).toBe("ES2022");
  }
}

describe("Configuration hash guard", () => {
  it("tsconfig.json matches reference and allowed profile", () => {
    const actual = readJson(path.join(root, "tsconfig.json"));
    const reference = readJson(path.join(referenceRoot, "tsconfig.json"));
    assertAllowedLibsAndTarget("tsconfig.json", actual);
    expect(hashObject(actual)).toBe(hashObject(reference));
  });

  it("tsconfig.test.json matches reference", () => {
    const actual = readJson(path.join(root, "tsconfig.test.json"));
    const reference = readJson(path.join(referenceRoot, "tsconfig.test.json"));
    expect(hashObject(actual)).toBe(hashObject(reference));
  });

  it("package.json matches reference", () => {
    const actual = readJson(path.join(root, "package.json"));
    const reference = readJson(path.join(referenceRoot, "package.json"));
    expect(hashObject(actual)).toBe(hashObject(reference));
  });

  it("vitest.config.ts matches reference config object", async () => {
    const actual = await loadConfig(path.join(root, "vitest.config.ts"));
    const reference = await loadConfig(path.join(referenceRoot, "vitest.config.ts"));
    expect(hashObject(actual)).toBe(hashObject(reference));
  });
});
