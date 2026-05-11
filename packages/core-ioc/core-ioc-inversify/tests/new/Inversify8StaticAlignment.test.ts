import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Inversify adapter KISS alignment", () => {
  it("does not contain facade graph validation files", () => {
    const index = readFileSync(join(process.cwd(), "src/new/index.ts"), "utf8");

    expect(index).not.toContain("IocValidationError");
    expect(index).not.toContain("ServiceCollectionGraphValidator");
    expect(index).not.toContain("IServiceCollectionGraphValidator");
  });

  it("keeps the public facade free of concrete Inversify adapter exports", () => {
    const index = readFileSync(join(process.cwd(), "src/new/index.ts"), "utf8");

    expect(index).not.toContain("InversifyContainerAdapter");
    expect(index).not.toContain("InversifyDescriptorBinder");
    expect(index).not.toContain("InversifyServiceProvider");
    expect(index).not.toContain("InversifyServiceScope");
    expect(index).not.toContain("./inversify/index.js");
  });

  it("keeps Inversify version-specific API usage inside the adapter only", () => {
    const publicIndex = readFileSync(join(process.cwd(), "src/new/index.ts"), "utf8");
    const defaultBuilder = readFileSync(
      join(process.cwd(), "src/new/CreateDefaultContainerBuilder.ts"),
      "utf8",
    );

    expect(publicIndex).not.toContain("interfaces.");
    expect(publicIndex).not.toContain("autoBindInjectable");
    expect(publicIndex).not.toContain("autobind");

    expect(defaultBuilder).toContain("./inversify/InversifyContainerAdapter.js");
  });

  it("uses compile-time adapter compatibility instead of hardcoding an Inversify major-version assertion", () => {
    const adapter = readFileSync(
      join(process.cwd(), "src/new/inversify/InversifyContainerAdapter.ts"),
      "utf8",
    );

    expect(adapter).toContain("new Container");
    expect(adapter).toContain("defaultScope");

    /*
     * Do not assert 'autobind' versus 'autoBindInjectable' here.
     * The installed Inversify type surface decides that at build time.
     */
  });
});