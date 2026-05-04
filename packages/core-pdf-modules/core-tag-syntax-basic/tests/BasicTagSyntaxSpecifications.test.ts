import "chai/register-should";
import { describe, it } from "vitest";
import {
  BasicTagSystemSpecification,
  EquipmentOrValveClassCodeSpecification,
  EquipmentOrValveTagSpecification,
  InstrumentFunctionCodeSpecification,
  InstrumentTagSpecification,
  LineNumberTagSpecification,
  LineServiceCodeSpecification,
} from "../src/index.js";

describe("Basic tag syntax specifications", () => {
  it("should match equipment or valve tag syntax", () => {
    const specification = new EquipmentOrValveTagSpecification();

    specification.isSatisfiedBy("39-HA-901A").should.equal(true);
    specification.isSatisfiedBy('8"-PL-39-9503-AC51-04').should.equal(false);
  });

  it("should match instrument tag syntax", () => {
    const specification = new InstrumentTagSpecification();

    specification.isSatisfiedBy("39-FIC-9503A").should.equal(true);
    specification.isSatisfiedBy("PCS-HS-9503A").should.equal(false);
  });

  it("should match line number tag syntax", () => {
    const specification = new LineNumberTagSpecification();

    specification.isSatisfiedBy('8"-PL-39-9503-AC51-04').should.equal(true);
    specification.isSatisfiedBy("39-GT-9537").should.equal(false);
  });

  it("should match system segment across supported basic syntaxes", () => {
    const specification = new BasicTagSystemSpecification("39");

    specification.isSatisfiedBy("39-FIC-9503A").should.equal(true);
    specification.isSatisfiedBy("39-HA-901A").should.equal(true);
    specification.isSatisfiedBy('8"-PL-39-9503-AC51-04').should.equal(true);
    specification.isSatisfiedBy('2"-OT-41-8525-BC50-01').should.equal(false);
  });

  it("should match equipment or valve class code", () => {
    const specification = new EquipmentOrValveClassCodeSpecification("GT");

    specification.isSatisfiedBy("41-GT-8527").should.equal(true);
    specification.isSatisfiedBy("39-HA-901A").should.equal(false);
  });

  it("should match instrument function code", () => {
    const specification = new InstrumentFunctionCodeSpecification("FIC");

    specification.isSatisfiedBy("39-FIC-9503A").should.equal(true);
    specification.isSatisfiedBy("39-PIC-9503A").should.equal(false);
  });

  it("should match line service code", () => {
    const specification = new LineServiceCodeSpecification("PL");

    specification.isSatisfiedBy('8"-PL-39-9503-AC51-04').should.equal(true);
    specification.isSatisfiedBy('2"-OT-41-8525-BC50-01').should.equal(false);
  });

  it("should support chained logical expressions", () => {
    const specification = new InstrumentTagSpecification()
      .and(new BasicTagSystemSpecification("39"))
      .and(new InstrumentFunctionCodeSpecification("FIC"));

    specification.isSatisfiedBy("39-FIC-9503A").should.equal(true);
    specification.isSatisfiedBy("39-PIC-9503A").should.equal(false);
  });

  it("should support alternative logical expressions", () => {
    const specification = new InstrumentFunctionCodeSpecification("FIC")
      .or(new InstrumentFunctionCodeSpecification("PIC"));

    specification.isSatisfiedBy("39-FIC-9503A").should.equal(true);
    specification.isSatisfiedBy("39-PIC-9503A").should.equal(true);
    specification.isSatisfiedBy("39-TIC-9514").should.equal(false);
  });

  it("should support negated logical expressions", () => {
    const specification = new LineNumberTagSpecification().not();

    specification.isSatisfiedBy("39-GT-9537").should.equal(true);
    specification.isSatisfiedBy('8"-PL-39-9503-AC51-04').should.equal(false);
  });
});