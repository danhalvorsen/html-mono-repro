import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Express } from "express";
import { CompositionRoot } from "../../src/composition/CompositionRoot.js";
import { ExpressApplicationFactory } from "../../src/web/ExpressApplicationFactory.js";

export interface ApiEnvelope<TData> {
  readonly ok: boolean;
  readonly data?: TData;
  readonly error?: string;
}

export interface ApiCatalogResponse {
  readonly serviceName: string;
  readonly commands: readonly { readonly type: string }[];
  readonly queries: readonly { readonly type: string }[];
}

export interface GenerationCommandResult {
  readonly status: {
    readonly sourceFiles: number;
    readonly generatedFiles: number;
    readonly errors: readonly unknown[];
  };
}

export interface ListedSvgFileResponse {
  readonly category: string;
  readonly itemName: string;
  readonly fileName: string;
  readonly absolutePath: string;
  readonly relativePath: string;
}

export interface GenerationStatusResponse {
  readonly state: string;
  readonly startedAtUtc: string | undefined;
  readonly completedAtUtc: string | undefined;
  readonly sourceFiles: number;
  readonly generatedFiles: number;
  readonly errors: readonly unknown[];
}

export class ExpressApiTestFixture {
  private tempDirectoryValue = "";

  public get tempDirectory(): string {
    return this.tempDirectoryValue;
  }

  public get sourceDirectory(): string {
    return path.join(this.tempDirectoryValue, "source");
  }

  public get outputDirectory(): string {
    return path.join(this.tempDirectoryValue, "output");
  }

  public createApp(): Express {
    const composition = new CompositionRoot().create();

    return new ExpressApplicationFactory(
      composition.commandDispatcher,
      composition.queryDispatcher,
    ).create();
  }

  public async initialize(): Promise<void> {
    this.tempDirectoryValue = await mkdtemp(
      path.join(os.tmpdir(), "training-image-api-"),
    );
  }

  public async dispose(): Promise<void> {
    if (this.tempDirectoryValue.length === 0) {
      return;
    }

    await rm(this.tempDirectoryValue, {
      recursive: true,
      force: true,
    });

    this.tempDirectoryValue = "";
  }

  public async createSourceSvgFile(): Promise<string> {
    await mkdir(this.sourceDirectory, {
      recursive: true,
    });

    const svgFilePath = path.join(this.sourceDirectory, "valves-ball-valve.svg");

    await writeFile(
      svgFilePath,
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" /></svg>',
      "utf8",
    );

    return svgFilePath;
  }

  public createGenerateCommandBody(outputFormats: readonly string[] = ["svg"]): unknown {
    return {
      type: "GenerateTrainingImages",
      selection: {
        category: "valves",
        categoryItem: "valves.ball-valve",
      },
      config: {
        sourceDirectory: this.sourceDirectory,
        outputDirectory: this.outputDirectory,
        outputFormats,
        rotation: {
          angleStepDegrees: 180,
          includeOriginal: true,
        },
        noise: {
          enabled: false,
          strategies: [],
        },
      },
    };
  }

  public generatedFileExists(relativePath: string): boolean {
    return existsSync(path.join(this.outputDirectory, relativePath));
  }
}