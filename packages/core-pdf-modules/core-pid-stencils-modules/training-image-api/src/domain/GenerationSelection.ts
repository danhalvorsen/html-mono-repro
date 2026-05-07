export interface TrainingImageGenerationSelection {
  readonly category: string;
  readonly categoryItem: string;
}

export class TrainingImageGenerationSelectionValidator {
  public assertValid(
    selection: TrainingImageGenerationSelection | undefined,
  ): void {
    if (selection === undefined) {
      throw new Error("GenerateTrainingImages command requires selection.");
    }

    if (typeof selection.category !== "string" || selection.category.trim().length === 0) {
      throw new Error("GenerateTrainingImages command requires selection.category.");
    }

    if (
      typeof selection.categoryItem !== "string" ||
      selection.categoryItem.trim().length === 0
    ) {
      throw new Error("GenerateTrainingImages command requires selection.categoryItem.");
    }

    if (!selection.categoryItem.startsWith(`${selection.category}.`)) {
      throw new Error(
        "GenerateTrainingImages command requires selection.categoryItem to use the format '{category}.{item-name}'.",
      );
    }
  }
}