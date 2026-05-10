import type { TrainingImageGenerationConfig } from "../src/domain/GenerationConfig.js";
import type { TrainingImageGenerationSelection } from "../src/domain/GenerationSelection.js";
import { GenerationState, type GenerationStatus } from "../src/domain/GenerationStatus.js";

export class TestFixtures {
  public static createGenerationSelection(): TrainingImageGenerationSelection {
    return {
      category: "valves",
      categoryItem: "valves.ball-valve",
    };
  }

  public static createGenerationConfig(): TrainingImageGenerationConfig {
    return {
      sourceDirectory: "source",
      outputDirectory: "output",
      outputFormats: ["svg", "png"],
      rotation: {
        angleStepDegrees: 36,
        includeOriginal: true,
      },
      noise: {
        enabled: false,
        strategies: [],
      },
    };
  }

  public static createGenerationStatus(): GenerationStatus {
    return {
      state: GenerationState.Completed,
      startedAtUtc: "2026-05-07T00:00:00.000Z",
      completedAtUtc: "2026-05-07T00:00:01.000Z",
      sourceFiles: 1,
      generatedFiles: 20,
      errors: [],
    };
  }
}