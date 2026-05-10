import type { SvgSourceFile } from "../domain/SvgSourceFile.js";

export class SvgSourceFileNameParser {
  public parse(fileName: string, absolutePath: string, relativePath: string): SvgSourceFile {
    const baseName = fileName.replace(/\.svg$/iu, "");
    const splitIndex = this.findSplitIndex(baseName);

    if (splitIndex <= 0 || splitIndex >= baseName.length - 1) {
      throw new Error(`SVG file name must match {category}-{item-name}.svg or {category}.{item-name}.svg. File: ${fileName}`);
    }

    return {
      category: baseName.slice(0, splitIndex),
      itemName: baseName.slice(splitIndex + 1),
      fileName,
      absolutePath,
      relativePath,
    };
  }

  private findSplitIndex(baseName: string): number {
    const dashIndex = baseName.indexOf("-");
    const dotIndex = baseName.indexOf(".");

    if (dashIndex > 0) {
      return dashIndex;
    }

    return dotIndex;
  }
}