// src/presentation/CompositeTreeYamlSerializer.ts
import YAML from "yaml";

export class CompositeTreeYamlSerializer {
  public serialize(root: unknown): string {
    return YAML.stringify(this.mapNode(root));
  }

  private mapNode(node: unknown): unknown {
    const name = this.getClassName(node);
    const children = this.tryReadChildren(node);

    if (children !== undefined) {
      return {
        [`composite::${name}`]: children.map((c) => this.mapNode(c)),
      };
    }

    return {
      [`leaf::${name}`]: this.readOperation(node),
    };
  }

  private getClassName(node: unknown): string {
    if (typeof node === "object" && node !== null) {
      const ctor = (node as any).constructor;
      if (ctor && typeof ctor.name === "string") {
        return ctor.name;
      }
    }
    return "unknown";
  }

  private tryReadChildren(node: unknown): readonly unknown[] | undefined {
    if (typeof node !== "object" || node === null) return undefined;

    const value = Reflect.get(node, "children");
    return Array.isArray(value) ? value : undefined;
  }

  private readOperation(node: unknown): readonly string[] {
    const fn = Reflect.get(node as object, "operation");

    if (typeof fn !== "function") {
      throw new Error("Missing operation()");
    }

    return Reflect.apply(fn, node, []);
  }
}