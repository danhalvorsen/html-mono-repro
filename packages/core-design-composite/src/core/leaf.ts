import { Component } from "./component.js";

/**
 * Leaf: a terminal node in the composite tree.
 * Each leaf decides its own element (ui-label, ui-error, etc).
 */
export abstract class Leaf implements Component {
    constructor(public readonly name: string) {}

    get children(): ReadonlyArray<Component> {
        return [];
    }

    abstract createElement(): HTMLElement;
}
