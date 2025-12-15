import fs from "fs";
import path from "path";
import { createHash } from "crypto";

export type WatchDogResult =
  | { ok: true }
  | { ok: false; reasons: string[] };

type AllowedProfiles = {
  tsconfigExtends: string[];
  allowedLibs: string[][];
  target: string;
};

const defaultProfiles: AllowedProfiles = {
  tsconfigExtends: [
    "../config-standards/tsconfig.node.json",
    "../config-standards/tsconfig.web.json",
    "../config-standards/tsconfig.test.json"
  ],
  allowedLibs: [
    ["ES2022"], // Node profile
    ["ES2022", "DOM", "DOM.Iterable"] // Web profile
  ],
  target: "ES2022"
};

const stripBom = (text: string) => text.replace(/^\uFEFF/, "");

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

export class WatchDog {
  constructor(
    private readonly referenceRoot: string,
    private readonly profiles: AllowedProfiles = defaultProfiles
  ) {}

  /**
   * Ensures tsconfig.json complies with allowed extends/target/lib.
   */
  checkTsconfig(filePath: string): WatchDogResult {
    const reasons: string[] = [];
    if (!fs.existsSync(filePath)) return { ok: false, reasons: ["file missing"] };

    let parsed: any;
    try {
      parsed = JSON.parse(stripBom(fs.readFileSync(filePath, "utf-8")));
    } catch (err) {
      return { ok: false, reasons: [`invalid JSON: ${(err as Error).message}`] };
    }

    const ext = parsed.extends;
    if (!this.profiles.tsconfigExtends.includes(ext)) {
      reasons.push(`extends not allowed: ${ext ?? "<undefined>"}`);
    }

    const target = parsed.compilerOptions?.target;
    if (target && target !== this.profiles.target) {
      reasons.push(`target mismatch: ${target} (expected ${this.profiles.target})`);
    }

    const libs: string[] | undefined = parsed.compilerOptions?.lib;
    if (libs) {
      const normalized = libs.slice().sort();
      const match = this.profiles.allowedLibs.some(
        (set) => set.length === normalized.length && set.every((v, i) => v === normalized[i])
      );
      if (!match) {
        reasons.push(`lib mismatch: [${libs.join(", ")}] not in allowed set`);
      }
    }

    return reasons.length ? { ok: false, reasons } : { ok: true };
  }

  /**
   * Compares a file against its reference counterpart by canonical hash.
   */
  compareWithReference(relativePath: string): WatchDogResult {
    const currentPath = path.join(this.referenceRoot, "..", relativePath);
    const referencePath = path.join(this.referenceRoot, relativePath);

    if (!fs.existsSync(currentPath)) return { ok: false, reasons: ["current file missing"] };
    if (!fs.existsSync(referencePath)) return { ok: false, reasons: ["reference file missing"] };

    const currentRaw = stripBom(fs.readFileSync(currentPath, "utf-8"));
    const referenceRaw = stripBom(fs.readFileSync(referencePath, "utf-8"));

    const current = tryParseJsonOrFallback(currentPath, currentRaw);
    const reference = tryParseJsonOrFallback(referencePath, referenceRaw);

    const currentHash = hashObject(current);
    const referenceHash = hashObject(reference);

    return currentHash === referenceHash
      ? { ok: true }
      : {
          ok: false,
          reasons: [`hash mismatch for ${relativePath}`]
        };
  }
}

function tryParseJsonOrFallback(file: string, raw: string): unknown {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".json") {
    return JSON.parse(raw);
  }
  return raw.trim();
}

export interface IWDTask {
  /**
   * Perform the watchdog check.
   * Returns a detailed result object.
   */
  check(): Promise<WatchDogResult>;
}
