// src/presentation/CompositeTreeJsonSerializer.ts
export class CompositeTreeJsonSerializer {
  public serialize(root: unknown): string {
    return JSON.stringify(this.mapNode(root), null, 2);
  }

  private mapNode(node: unknown): unknown {
    const children = this.tryReadChildren(node);

    if (children !== undefined) {
      return {
        kind: "composite",
        children: children.map((child) => this.mapNode(child)),
      };
    }

    return {
      kind: "leaf",
      values: this.readOperation(node),
    };
  }

  private tryReadChildren(node: unknown): readonly unknown[] | undefined {
    if (typeof node !== "object" || node === null) {
      return undefined;
    }

    const value = Reflect.get(node, "children");

    return Array.isArray(value) ? value : undefined;
  }

  private readOperation(node: unknown): readonly string[] {
    if (typeof node !== "object" || node === null) {
      throw new Error("Unsupported tree node.");
    }

    const operation = Reflect.get(node, "operation");

    if (typeof operation !== "function") {
      throw new Error("Unsupported tree node. Missing operation().");
    }

    const result = Reflect.apply(operation, node, []);

    if (!Array.isArray(result) || !result.every((x) => typeof x === "string")) {
      throw new Error("Unsupported tree node. operation() must return readonly string[].");
    }

    return result;
  }
}