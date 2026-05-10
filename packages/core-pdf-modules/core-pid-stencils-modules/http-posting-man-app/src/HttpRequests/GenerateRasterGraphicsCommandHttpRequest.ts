import {
  GenerateRasterGraphicsCommand,
  createGenerateRasterGraphicsCommandPayload,
} from "../Commands/GenerateRasterGraphicsCommand.js";

export class GenerateRasterGraphicsCommandHttpRequest {
  public readonly name = "GenerateRasterGraphicsCommand";
  public readonly method = "POST";
  public readonly path = "/api/command";

  public createBody(): object {
    const command = new GenerateRasterGraphicsCommand(
      "valves",
      "ball-valve",
      ["png"],
      90,
      [[128, 128]],
    );

    return {
      GenerateRasterGraphicsCommand:
        createGenerateRasterGraphicsCommandPayload(command),
    };
  }
}