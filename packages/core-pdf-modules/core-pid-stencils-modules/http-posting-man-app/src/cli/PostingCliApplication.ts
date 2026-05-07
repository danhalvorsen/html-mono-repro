import { JsonMessageKind, type ResolvedJsonMessage } from "../config/PostingConfiguration.js";
import type { IJsonMessageReferenceResolver } from "../config/JsonMessageReferenceResolver.js";
import type { IPostingConfigurationReader } from "../config/PostingConfigurationReader.js";
import { CompositionRoot } from "../composition/CompositionRoot.js";
import {
  PostingCliCommandName,
  PostingCliMode,
  type PostingCliArguments,
} from "./PostingCliArguments.js";
import type { IJsonMessageReader } from "./FileJsonMessageReader.js";

export interface IConsoleWriter {
  writeJson(value: unknown): void;
}

export class ConsoleWriter implements IConsoleWriter {
  public writeJson(value: unknown): void {
    console.log(JSON.stringify(value, null, 2));
  }
}

export class PostingCliApplication {
  private readonly messageReader: IJsonMessageReader;
  private readonly configurationReader: IPostingConfigurationReader;
  private readonly messageReferenceResolver: IJsonMessageReferenceResolver;
  private readonly consoleWriter: IConsoleWriter;

  public constructor(
    messageReader: IJsonMessageReader,
    configurationReader: IPostingConfigurationReader,
    messageReferenceResolver: IJsonMessageReferenceResolver,
    consoleWriter: IConsoleWriter,
  ) {
    this.messageReader = messageReader;
    this.configurationReader = configurationReader;
    this.messageReferenceResolver = messageReferenceResolver;
    this.consoleWriter = consoleWriter;
  }

  public async execute(argumentsModel: PostingCliArguments): Promise<void> {
    const resolved = await this.resolveExecutionInput(argumentsModel);

    const client = new CompositionRoot().createHttpPostingClient({
      baseUrl: resolved.baseUrl,
      bearerToken: process.env.API_TOKEN,
    });

    const message = await this.messageReader.read(resolved.messageFilePath);

    if (resolved.kind === JsonMessageKind.Command) {
      this.consoleWriter.writeJson(await client.postCommand<unknown>(message));
      return;
    }

    if (resolved.kind === JsonMessageKind.Query) {
      this.consoleWriter.writeJson(await client.postQuery<unknown>(message));
      return;
    }

    throw new Error("Unsupported posting command.");
  }

  private async resolveExecutionInput(
    argumentsModel: PostingCliArguments,
  ): Promise<ResolvedJsonMessage> {
    if (argumentsModel.mode === PostingCliMode.DirectFile) {
      return {
        kind: argumentsModel.commandName === PostingCliCommandName.Command
          ? JsonMessageKind.Command
          : JsonMessageKind.Query,
        name: argumentsModel.commandName,
        baseUrl: argumentsModel.baseUrl,
        messageFilePath: argumentsModel.messageFilePath,
      };
    }

    const loadedConfiguration = await this.configurationReader.read(
      argumentsModel.configFilePath,
    );

    if (argumentsModel.mode === PostingCliMode.QuickMessage) {
      return this.messageReferenceResolver.resolveQuick(
        loadedConfiguration,
        argumentsModel.quickName,
      );
    }

    return this.messageReferenceResolver.resolve(
      loadedConfiguration,
      argumentsModel.commandName === PostingCliCommandName.Command
        ? JsonMessageKind.Command
        : JsonMessageKind.Query,
      argumentsModel.messageName,
    );
  }
}