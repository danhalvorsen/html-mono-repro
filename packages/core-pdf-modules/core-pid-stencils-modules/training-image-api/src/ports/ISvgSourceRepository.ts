import type { SvgSourceFile } from "../domain/SvgSourceFile.js";

export interface ISvgSourceRepository {
  list(sourceDirectory: string): Promise<readonly SvgSourceFile[]>;
  read(sourceFile: SvgSourceFile): Promise<string>;
}