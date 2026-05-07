import type { SvgShape } from "../domain/SvgShape.js";
import type { ISvgShapeFileNameFactory } from "../ports/ISvgShapeFileNameFactory.js";

const InvalidWindowsFileNameCharacters = /[<>:"/\\|?*\u0000-\u001F]/g;
const RepeatedWhitespace = /\s+/g;
const SvgFileExtension = ".svg";
const FileNameSeparator = "-";

export class SvgShapeFileNameFactory implements ISvgShapeFileNameFactory {
  public create(shape: SvgShape): string {
    const rootName = this.sanitize(shape.rootName);
    const shapeName = this.sanitize(shape.name);

    return `${rootName}${FileNameSeparator}${shapeName}${SvgFileExtension}`;
  }

  private sanitize(value: string): string {
    return value
      .replace(InvalidWindowsFileNameCharacters, FileNameSeparator)
      .replace(RepeatedWhitespace, " ")
      .trim();
  }
}