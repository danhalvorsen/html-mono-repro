import { Component } from "./component.js";

type CompositeCtor<T> = new (name: string, nodes?: ReadonlyArray<Component>) => T;

/**
 * Slot-based composition:
 * - createElement() returns a host element
 * - children are appended as light-DOM so <slot> renders them
 */
export abstract class Composite implements Component {
    constructor(
        public readonly name: string,
        private readonly nodes: ReadonlyArray<Component> = []
    ) {}

    get children(): ReadonlyArray<Component> {
        return this.nodes;
    }

    add(child: Component): this {
        const Ctor = this.constructor as unknown as CompositeCtor<this>;
        return new Ctor(this.name, [...this.nodes, child]);
    }

    /** Subclasses only decide the host tag (and optionally set initial props). */
    protected abstract createHostElement(): HTMLElement;

    createElement(): HTMLElement {
        const host = this.createHostElement();

        for (const child of this.children) {
            host.appendChild(child.createElement());
        }

        return host;
    }
}
