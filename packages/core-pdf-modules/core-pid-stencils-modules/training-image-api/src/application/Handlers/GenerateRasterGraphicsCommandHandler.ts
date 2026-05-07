import path from "node:path";
import { GenerateRasterGraphicsCommand } from "../../Commands/GenerateRasterGraphicsCommand.js";
import { GenerateRasterGraphicsResult } from "../../Commands/GenerateRasterGraphicsResult.js";
import { ServerConfig } from "../../Config/ServerConfig.js";
import { PngHandler } from "../Png/PngHandler.js";

export class GenerateRasterGraphicsCommandHandler {
  public constructor(
    private readonly serverConfig: ServerConfig,
    private readonly pngHandler: PngHandler,
  ) {}

  public async handle(
    command: GenerateRasterGraphicsCommand,
  ): Promise<GenerateRasterGraphicsResult> {
    let filesGenerated = 0;

    if (command.formats.includes("png")) {
      filesGenerated += await this.pngHandler.handle({
        category: command.category,
        itemName: command.itemName,
        sourceSvgFile: path.join(
          this.serverConfig.sourceRoot,
          `${command.category}-${command.itemName}.svg`,
        ),
        outputRoot: this.serverConfig.outputRoot,
        stepDegrees: command.stepDegrees,
        resolutions: command.resolutions,
      });
    }

    return new GenerateRasterGraphicsResult(1, filesGenerated);
  }
}