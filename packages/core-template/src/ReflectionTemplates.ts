import { ITemplate } from "./ITemplate.js";
import { PackageJson as packageJsonSchema } from "zod-package-json";

export class ReflectionTemplates implements ITemplate<Record<string, unknown>> {
  render(model: Record<string, unknown>): string {
    const result = packageJsonSchema.safeParse(model);

    if (result.success) {
      const name = (model as { name?: string }).name ?? "<unknown>";
      return `package.json for '${name}' is valid`;
    }

    // Build a readable report of validation issues
    const lines = result.error.issues.map((issue) => {
      const path = issue.path.join(".") || "<root>";
      return `- ${path}: ${issue.message}`;
    });

    return ["Invalid package.json detected:", ...lines].join("\n");
  }
}
