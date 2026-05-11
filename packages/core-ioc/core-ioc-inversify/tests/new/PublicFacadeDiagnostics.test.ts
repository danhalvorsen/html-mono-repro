import { describe, expect, it } from "vitest";
import * as PublicApi from "../../src/new/index.js";

describe("Slice 4 public diagnostics facade", () => {
  it("exports diagnostics API through the facade", () => {
    expect(typeof PublicApi.CreateServiceCollectionDiagnostics).toBe("function");
    expect(typeof PublicApi.ServiceCollectionDiagnosticsReader).toBe("function");
  });

  it("does not expose adapter diagnostics through the facade", () => {
    expect(Object.prototype.hasOwnProperty.call(PublicApi, "InversifyContainerAdapter")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(PublicApi, "InversifyDescriptorBinder")).toBe(false);
  });
});