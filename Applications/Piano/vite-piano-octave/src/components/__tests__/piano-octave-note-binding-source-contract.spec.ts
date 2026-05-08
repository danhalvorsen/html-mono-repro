import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readPianoOctaveSource(): string {
  return readFileSync(
    resolve(process.cwd(), "src/components/piano-octave.ts"),
    "utf8"
  );
}

describe("PianoOctave note binding source contract", () => {
  it("does not pass item.note directly into tangent id generation", () => {
    const source = readPianoOctaveSource();

    expect(source).not.toMatch(/toTangentId\s*\(\s*item\.note\s*,/);
  });

  it("uses a base-note fallback before generating tangent ids", () => {
    const source = readPianoOctaveSource();

    expect(source).toContain("getTangentBaseNote");
    expect(source).toMatch(/item\.note\s*\?\?\s*item\.geometry\.name/);
    expect(source).toMatch(
      /toTangentId\s*\(\s*this\.getTangentBaseNote\s*\(\s*item\s*\)\s*,\s*this\.octaveIndex\s*\)/
    );
  });

  it("binds piano-tangent note from the same base-note fallback", () => {
    const source = readPianoOctaveSource();

    expect(source).toMatch(
      /\.note\s*=\s*\$\{\s*this\.getTangentBaseNote\s*\(\s*item\s*\)\s*\}/
    );
  });

  it("keeps tangent id and note binding separate", () => {
    const source = readPianoOctaveSource();

    expect(source).toMatch(
      /\.tangentId\s*=\s*\$\{\s*this\.tangentNamePolicy\.toTangentId\s*\(\s*this\.getTangentBaseNote\s*\(\s*item\s*\)\s*,\s*this\.octaveIndex\s*\)\s*\}/
    );

    expect(source).toMatch(
      /\.note\s*=\s*\$\{\s*this\.getTangentBaseNote\s*\(\s*item\s*\)\s*\}/
    );
  });
});