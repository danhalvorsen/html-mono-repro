import "chai/register-should";
import { describe, it } from "vitest";
import { PidDomainFixture } from "./fixtures/PidDomainFixture.js";

describe("PID semantic fragments", () => {
  const fixture = new PidDomainFixture();

  it("should create an equipment tag fragment", () => {
    const fragment = fixture.createEquipmentTag("p-101");

    fragment.pidKind.should.equal(fixture.kinds.EquipmentTag);
    fragment.normalizedText.should.equal("P-101");
  });

  it("should create an instrument tag fragment", () => {
    const fragment = fixture.createInstrumentTag("pt-101");

    fragment.pidKind.should.equal(fixture.kinds.InstrumentTag);
    fragment.normalizedText.should.equal("PT-101");
  });

  it("should create a line number fragment", () => {
    const fragment = fixture.createLineNumber("10-pl-1001-a1");

    fragment.pidKind.should.equal(fixture.kinds.LineNumber);
    fragment.normalizedText.should.equal("10-PL-1001-A1");
  });
});