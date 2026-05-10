export const PostingCliCommandName = {
  Command: "command",
  Query: "query",
} as const;

export type PostingCliCommandName =
  typeof PostingCliCommandName[keyof typeof PostingCliCommandName];

export const PostingCliMode = {
  DirectFile: "direct-file",
  ConfiguredMessage: "configured-message",
  QuickMessage: "quick-message",
} as const;

export type PostingCliMode =
  typeof PostingCliMode[keyof typeof PostingCliMode];

export interface DirectFilePostingCliArguments {
  readonly mode: typeof PostingCliMode.DirectFile;
  readonly commandName: PostingCliCommandName;
  readonly baseUrl: string;
  readonly messageFilePath: string;
}

export interface ConfiguredMessagePostingCliArguments {
  readonly mode: typeof PostingCliMode.ConfiguredMessage;
  readonly commandName: PostingCliCommandName;
  readonly configFilePath: string;
  readonly messageName: string;
}

export interface QuickMessagePostingCliArguments {
  readonly mode: typeof PostingCliMode.QuickMessage;
  readonly configFilePath: string;
  readonly quickName: string;
}

export type PostingCliArguments =
  | DirectFilePostingCliArguments
  | ConfiguredMessagePostingCliArguments
  | QuickMessagePostingCliArguments;

export class PostingCliArgumentsParser {
  public parse(argv: readonly string[]): PostingCliArguments {
    const quickName = this.readOption(argv, ["--quick", "-quick", "-q"]);

    if (quickName !== undefined) {
      return {
        mode: PostingCliMode.QuickMessage,
        configFilePath: this.readOption(argv, ["--config", "-config", "-c"]) ?? "./posting.config.json",
        quickName,
      };
    }

    const commandName = argv[0];

    if (!this.isCommandName(commandName)) {
      throw new Error(this.createUsage());
    }

    const configFilePath = this.readOption(argv, ["--config", "-config", "-c"]);

    if (configFilePath !== undefined) {
      return {
        mode: PostingCliMode.ConfiguredMessage,
        commandName,
        configFilePath,
        messageName: this.readRequiredOption(argv, ["--name", "-name", "-n"]),
      };
    }

    return {
      mode: PostingCliMode.DirectFile,
      commandName,
      baseUrl: this.normalizeBaseUrl(
        this.readRequiredOption(argv, ["--base-url", "-base-url", "-url", "-u"]),
      ),
      messageFilePath: this.readRequiredOption(argv, ["--message", "-message", "-m"]),
    };
  }

  private isCommandName(value: string | undefined): value is PostingCliCommandName {
    return (
      value === PostingCliCommandName.Command ||
      value === PostingCliCommandName.Query
    );
  }

  private readOption(
    argv: readonly string[],
    names: readonly string[],
  ): string | undefined {
    for (const name of names) {
      const index = argv.indexOf(name);

      if (index < 0) {
        continue;
      }

      const value = argv[index + 1];

      if (value === undefined || value.startsWith("-")) {
        throw new Error(`Missing value for option: ${name}`);
      }

      return value;
    }

    return undefined;
  }

  private readRequiredOption(
    argv: readonly string[],
    names: readonly string[],
  ): string {
    const value = this.readOption(argv, names);

    if (value === undefined) {
      throw new Error(`Missing required option: ${names[0]}`);
    }

    return value;
  }

  private normalizeBaseUrl(value: string): string {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value.replace(/\/+$/u, "");
    }

    return `http://${value.replace(/\/+$/u, "")}`;
  }

  public createUsage(): string {
    return [
      "Usage:",
      "  pnpm post -- -q list",
      "  pnpm post -- -q g",
      "  pnpm post -- -q status --config ./posting.config.json",
      "  pnpm post:command -- --base-url http://localhost:3000 --message ./examples/generate.command.json",
      "  pnpm post:query   -- --base-url http://localhost:3000 --message ./examples/status.query.json",
      "  pnpm post:command -- --config ./posting.config.json --name generate",
      "  pnpm post:query   -- --config ./posting.config.json --name status",
    ].join("\n");
  }
}