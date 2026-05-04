import { describe, expect, it } from "vitest";
import { PidDomainFixture } from "./fixtures/PidDomainFixture.js";

describe("PID semantic fragments", () => {
  const fixture = new PidDomainFixture();

  it("should create an equipment tag fragment", () => {
    const fragment = fixture.createEquipmentTag("p-101");

    expect(fragment.pidKind).toBe(fixture.kinds.EquipmentTag);
    expect(fragment.normalizedText).toBe("P-101");
  });

  it("should create an instrument tag fragment", () => {
    const fragment = fixture.createInstrumentTag("pt-101");

    expect(fragment.pidKind).toBe(fixture.kinds.InstrumentTag);
    expect(fragment.normalizedText).toBe("PT-101");
  });

  it("should create a line number fragment", () => {
    const fragment = fixture.createLineNumber("10-pl-1001-a1");

    expect(fragment.pidKind).toBe(fixture.kinds.LineNumber);
    expect(fragment.normalizedText).toBe("10-PL-1001-A1");
  });
});
