import type { TrainingImageGenerationSelection } from "../domain/GenerationSelection.js";
import type { SvgSourceFile } from "../domain/SvgSourceFile.js";

export interface ISvgSourceFileSelectionFilter {
  filter(
    sourceFiles: readonly SvgSourceFile[],
    selection: TrainingImageGenerationSelection,
  ): readonly SvgSourceFile[];
}

export class SvgSourceFileSelectionFilter implements ISvgSourceFileSelectionFilter {
  public filter(
    sourceFiles: readonly SvgSourceFile[],
    selection: TrainingImageGenerationSelection,
  ): readonly SvgSourceFile[] {
    const normalizedCategory = this.normalize(selection.category);
    const normalizedCategoryItem = this.normalize(selection.categoryItem);

    const filtered = sourceFiles.filter((sourceFile) => {
      const sourceCategory = this.normalize(sourceFile.category);
      const sourceCategoryItem = this.normalize(
        `${sourceFile.category}.${sourceFile.itemName}`,
      );

      return (
        sourceCategory === normalizedCategory &&
        sourceCategoryItem === normalizedCategoryItem
      );
    });

    if (filtered.length === 0) {
      throw new Error(
        `No SVG source file found for category '${selection.category}' and categoryItem '${selection.categoryItem}'.`,
      );
    }

    return filtered;
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }
}