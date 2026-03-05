// Applications/composistion/composistion-demo-03/tests/calculator.command.factory.test.ts
// Tests Builder + Factory (and uses your real paths)

import { describe, it } from "vitest";
import "chai/register-should";

import { CalculatorMessageName } from "../src/calculator/calculator.cqrs.names.js";
import type { Digit, Operator } from "../src/calculator/calculator.types.js";

import {
  CalculatorCommandFactory,
  DigitCommandBuilder,
  OperatorCommandBuilder,
  EqualCommandBuilder,
  ClearCommandBuilder,
} from "../src/calculator/calculator.command.factory.js";

describe("calculator.command.factory", () => {

  describe("DigitCommandBuilder", () => {

    it("build() emits an ICommand envelope with json containing { name, digit }", () => {

      const d: Digit = "7";

      const cmd = new DigitCommandBuilder()
        .withDigit(d)
        .build();

      cmd.should.have.property("json").that.is.a("string");

      const msg = JSON.parse(cmd.json) as { name: string; digit: Digit };

      msg.name.should.equal(CalculatorMessageName.Digit);
      msg.digit.should.equal(d);
    });

    it("throws when digit is missing", () => {

      const act = () => new DigitCommandBuilder().build();

      act.should.throw(/digit/i);
    });
  });

  describe("OperatorCommandBuilder", () => {

    it("build() emits an ICommand envelope with json containing { name, op }", () => {

      const op: Operator = "+";

      const cmd = new OperatorCommandBuilder()
        .withOperator(op)
        .build();

      const msg = JSON.parse(cmd.json) as { name: string; op: Operator };

      msg.name.should.equal(CalculatorMessageName.Operator);
      msg.op.should.equal(op);
    });

    it("throws when operator is missing", () => {

      const act = () => new OperatorCommandBuilder().build();

      act.should.throw(/operator/i);
    });
  });

  describe("EqualCommandBuilder", () => {

    it("build() emits json containing only { name }", () => {

      const cmd = new EqualCommandBuilder().build();

      const msg = JSON.parse(cmd.json) as { name: string };

      msg.name.should.equal(CalculatorMessageName.Equal);
      (msg as any).should.not.have.property("digit");
      (msg as any).should.not.have.property("op");
    });
  });

  describe("ClearCommandBuilder", () => {

    it("build() emits json containing only { name }", () => {

      const cmd = new ClearCommandBuilder().build();

      const msg = JSON.parse(cmd.json) as { name: string };

      msg.name.should.equal(CalculatorMessageName.Clear);
      (msg as any).should.not.have.property("digit");
      (msg as any).should.not.have.property("op");
    });
  });

  describe("CalculatorCommandFactory", () => {

    it("digit(d) returns Digit command envelope", () => {

      const f = new CalculatorCommandFactory();

      const cmd = f.digit("5");

      const msg = JSON.parse(cmd.json) as { name: string; digit: Digit };

      msg.name.should.equal(CalculatorMessageName.Digit);
      msg.digit.should.equal("5");
    });

    it("operator(op) returns Operator command envelope", () => {

      const f = new CalculatorCommandFactory();

      const cmd = f.operator("*");

      const msg = JSON.parse(cmd.json) as { name: string; op: Operator };

      msg.name.should.equal(CalculatorMessageName.Operator);
      msg.op.should.equal("*");
    });

    it("equal() returns Equal command envelope", () => {

      const f = new CalculatorCommandFactory();

      const cmd = f.equal();

      const msg = JSON.parse(cmd.json) as { name: string };

      msg.name.should.equal(CalculatorMessageName.Equal);
    });

    it("clear() returns Clear command envelope", () => {

      const f = new CalculatorCommandFactory();

      const cmd = f.clear();

      const msg = JSON.parse(cmd.json) as { name: string };

      msg.name.should.equal(CalculatorMessageName.Clear);
    });
  });
});