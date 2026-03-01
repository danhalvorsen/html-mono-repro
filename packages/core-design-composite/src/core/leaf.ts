import { Component } from "./component.js";

export class Leaf implements Component {
  constructor(public readonly name: string) {}

  get children(): ReadonlyArray<Component> {
    return [];
  }

  createElement(): HTMLElement {
    throw new Error(`Leaf '${this.name}' has no WebComponent.`);
  }
}
