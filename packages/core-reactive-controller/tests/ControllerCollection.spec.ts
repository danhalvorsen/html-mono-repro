import { describe, it, expect } from "vitest";
import { ControllerCollection } from "../src/utils/ControllerCollection.js";

describe("ControllerCollection", () => {
  it("adds items", () => {
    const c = new ControllerCollection<number>();
    c.add(1);
    let result = 0;
    c.forEach(x => result = x);
    expect(result).toBe(1);
  });

  it("deletes items", () => {
    const c = new ControllerCollection<number>();
    c.add(1);
    c.delete(1);
    let executed = false;
    c.forEach(() => executed = true);
    expect(executed).toBe(false);
  });

  it("iterates all items", () => {
    const c = new ControllerCollection<number>();
    c.add(1);
    c.add(2);
    const result: number[] = [];
    c.forEach(x => result.push(x));
    expect(result).toEqual([1, 2]);
  });
});
