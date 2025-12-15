import { describe, it, expect } from "vitest";
 
import { DagGraph } from "../src/DagGraph.js";
export class Association<T1, T2> {
  public item1!: T1;
  public item2!: T2;

  constructor(item1: T1, item2: T2) {

    Object.defineProperty(this, "item1", {
      value: item1,
      writable: false,
      configurable: false,
      enumerable: true
    });

    Object.defineProperty(this, "item2", {
      value: item2,
      writable: false,
      configurable: false,
      enumerable: true
    });
  }
}