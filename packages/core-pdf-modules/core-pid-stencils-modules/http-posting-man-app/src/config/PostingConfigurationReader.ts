import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  LoadedPostingConfiguration,
  NamedJsonMessageReference,
  PostingConfiguration,
} from "./PostingConfiguration.js";

export interface IPostingConfigurationReader {
  read(configFilePath: string): Promise<LoadedPostingConfiguration>;
}

export class PostingConfigurationReader implements IPostingConfigurationReader {
  public async read(configFilePath: string): Promise<LoadedPostingConfiguration> {
    const absolutePath = path.resolve(process.cwd(), configFilePath);
    const content = await readFile(absolutePath, "utf8");
    const configuration = JSON.parse(content) as Partial<PostingConfiguration>;

    this.assertConfiguration(configuration, absolutePath);

    return {
      configFilePath: absolutePath,
      configDirectory: path.dirname(absolutePath),
      configuration,
    };
  }

  private assertConfiguration(
    value: Partial<PostingConfiguration>,
    sourceFile: string,
  ): asserts value is PostingConfiguration {
    if (typeof value.baseUrl !== "string" || value.baseUrl.trim().length === 0) {
      throw new Error(`Posting configuration is missing baseUrl: ${sourceFile}`);
    }

    this.assertMessageReferences(value.commands, "commands", sourceFile);
    this.assertMessageReferences(value.queries, "queries", sourceFile);
  }

  private assertMessageReferences(
    value: unknown,
    propertyName: string,
    sourceFile: string,
  ): asserts value is readonly NamedJsonMessageReference[] {
    if (!Array.isArray(value)) {
      throw new Error(`Posting configuration property '${propertyName}' must be an array: ${sourceFile}`);
    }

    for (const item of value) {
      if (typeof item !== "object" || item === null) {
        throw new Error(`Posting configuration '${propertyName}' contains an invalid item.`);
      }

      const candidate = item as Partial<NamedJsonMessageReference>;

      if (typeof candidate.name !== "string" || candidate.name.trim().length === 0) {
        throw new Error(`Posting configuration '${propertyName}' item is missing name.`);
      }

      if (typeof candidate.path !== "string" || candidate.path.trim().length === 0) {
        throw new Error(`Posting configuration '${propertyName}' item is missing path.`);
      }

      if (
        candidate.shortcuts !== undefined &&
        typeof candidate.shortcuts !== "string" &&
        !Array.isArray(candidate.shortcuts)
      ) {
        throw new Error(`Posting configuration '${propertyName}' item has invalid shortcuts.`);
      }
    }
  }
}