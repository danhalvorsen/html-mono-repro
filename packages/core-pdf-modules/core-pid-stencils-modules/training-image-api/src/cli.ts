import { readFile } from "node:fs/promises";
import path from "node:path";
import { CompositionRoot } from "./composition/CompositionRoot.js";
import { CommandMessageType } from "./messages/CommandMessages.js";
import { QueryMessageType } from "./messages/QueryMessages.js";
import type { TrainingImageGenerationConfig } from "./domain/GenerationConfig.js";
import type { TrainingImageGenerationSelection } from "./domain/GenerationSelection.js";

interface GenerateCliArguments {
  readonly configPath: string;
  readonly selection: TrainingImageGenerationSelection;
}

class CliArgumentReader {
  public readCommand(): string | undefined {
    return process.argv[2];
  }

  public readGenerateArguments(): GenerateCliArguments {
    const configPath = process.argv[3] ?? "./training-image.config.json";

    return {
      configPath,
      selection: {
        category: this.readRequiredOption(["--category", "-category", "-c"]),
        categoryItem: this.readRequiredOption([
          "--category-item",
          "-category-item",
          "--item",
          "-item",
          "-i",
        ]),
      },
    };
  }

  public readListSourceDirectory(): string {
    const sourceDirectory = process.argv[3];

    if (sourceDirectory === undefined || sourceDirectory.trim().length === 0) {
      throw new Error("Usage: pnpm cli list <source-directory>");
    }

    return sourceDirectory;
  }

  private readRequiredOption(names: readonly string[]): string {
    for (const name of names) {
      const index = process.argv.indexOf(name);

      if (index < 0) {
        continue;
      }

      const value = process.argv[index + 1];

      if (value === undefined || value.startsWith("-")) {
        throw new Error(`Missing value for option: ${name}`);
      }

      return value;
    }

    throw new Error(`Missing required option: ${names[0]}`);
  }
}

async function readGenerationConfig(
  configPath: string,
): Promise<TrainingImageGenerationConfig> {
  return JSON.parse(
    await readFile(path.resolve(process.cwd(), configPath), "utf8"),
  ) as TrainingImageGenerationConfig;
}

function printUsage(): void {
  console.error("Usage:");
  console.error("  pnpm cli generate ./training-image.config.json --category valves --category-item valves.ball-valve");
  console.error("  pnpm cli list <source-directory>");
  console.error("  pnpm cli status");
}

const argumentReader = new CliArgumentReader();
const command = argumentReader.readCommand();
const composition = new CompositionRoot().create();

try {
  if (command === "generate") {
    const args = argumentReader.readGenerateArguments();
    const config = await readGenerationConfig(args.configPath);

    const result = await composition.commandDispatcher.dispatch({
      type: CommandMessageType.GenerateTrainingImages,
      selection: args.selection,
      config,
    });

    console.log(JSON.stringify(result, null, 2));
  }
  else if (command === "list") {
    const result = await composition.queryDispatcher.dispatch({
      type: QueryMessageType.ListSvgFiles,
      sourceDirectory: argumentReader.readListSourceDirectory(),
    });

    console.log(JSON.stringify(result, null, 2));
  }
  else if (command === "status") {
    const result = await composition.queryDispatcher.dispatch({
      type: QueryMessageType.GetGenerationStatus,
    });

    console.log(JSON.stringify(result, null, 2));
  }
  else if (command === "catalog" || command === "help") {
    const result = await composition.queryDispatcher.dispatch({
      type: QueryMessageType.GetApiCatalog,
    });

    console.log(JSON.stringify(result, null, 2));
  }
  else {
    printUsage();
    process.exitCode = 1;
  }
}
catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}