import { Component } from "./component.js";

export abstract class Composite implements Component {
    constructor(
        public readonly name: string,
        private readonly nodes: ReadonlyArray<Component> = []
    ) {}

    get children(): ReadonlyArray<Component> {
        return this.nodes;
    }

    add(child: Component): this {
        return new (this.constructor as any)(
            this.name,
            [...this.nodes, child]
        );
    }

    abstract createElement(): HTMLElement;
}
