// Applications/pdf/drawing-tool/backend/src/features/saveFeature/SaveCommandPipelineHandler.ts

import type { IHandler } from '@monorepo/core-design-patterns-mediator';
import { CoreFileSystemModule, Path } from '@monorepo/core-filesystem';
import { CorePdfWriter, type IWritePdfFragments } from '@monorepo/core-pdf-writer';
import { PDFDocument, rgb } from 'pdf-lib';

import { SaveCommandMessage } from './SaveCommandMessage.js';
import type { IContextPipeline } from '@monorepo/core-design-patterns-mediator';
import { SaveCommandPipelineError } from './SaveCommandPipelineError.js';
import type { SaveCommandSuccess } from './SaveCommandSuccess.js';

export class SaveCommandPipelineHandler
  implements IHandler<SaveCommandMessage, SaveCommandSuccess>
{
  public constructor(
    private readonly saveDirectory: string,
    private readonly now: () => number = () => Date.now(),
    private readonly fileSystem: CoreFileSystemModule = new CoreFileSystemModule(),
  ) {}

  public async handle(
    _ctx: IContextPipeline,
    msg: SaveCommandMessage,
  ): Promise<SaveCommandSuccess> {
    try {
      console.log('Handling SaveCommandMessage with rectangles:', msg.rectangles);
      const directoryPath = Path.from(this.saveDirectory);
      const directory = this.fileSystem.createDirectory(directoryPath);
      directory.create(true);

      const saveId = this.now();
      const jsonFileName = `save-${saveId}.json`;
      const jsonFilePath = directory.path.join(jsonFileName);
      const jsonFile = this.fileSystem.createFile(jsonFilePath);

      jsonFile.write(
        JSON.stringify(msg.rectangles, null, 2),
        'utf8',
      );

      const pdfFilePath = directory.path.join(`save-${saveId}.pdf`);
      await this.writePdf(msg.rectangles, pdfFilePath);

      return {
        fileName: jsonFileName,
        path: jsonFilePath.full,
      };
    } catch (error: unknown) {
      throw new SaveCommandPipelineError(
        'command.handler',
        500,
        error instanceof Error ? error.message : 'Unexpected save error.',
      );
    }
  }

  private async writePdf(
    rectangles: ReadonlyArray<SaveCommandMessage['rectangles'][number]>,
    pdfFilePath: Path,
  ): Promise<void> {
    const pageSize = resolvePageSize(rectangles);
    const baseDocument = await PDFDocument.create();
    baseDocument.addPage([pageSize.width, pageSize.height]);
    const basePdfBinary = await baseDocument.save();

    const fragments = rectangles.map((rectangle) => ({
      x: rectangle.x,
      y: rectangle.y,
      width: rectangle.width,
      height: rectangle.height,
    }));

    const pdfWriter = new CorePdfWriter<SavePdfRectangleFragment>(
      new SavePdfRectangleFragmentWriter(pageSize.width, pageSize.height),
    );
    const writtenPdfBinary = await pdfWriter.write(basePdfBinary, fragments);

    const pdfFile = this.fileSystem.createFile(pdfFilePath);
    pdfFile.write(Buffer.from(writtenPdfBinary).toString('latin1'), 'latin1');
  }
}

type SavePdfRectangleFragment = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

class SavePdfRectangleFragmentWriter
  implements IWritePdfFragments<SavePdfRectangleFragment>
{
  public constructor(
    private readonly pageWidth: number,
    private readonly pageHeight: number,
  ) {}

  public async write(
    pdfBinary: Uint8Array,
    fragments: readonly SavePdfRectangleFragment[],
  ): Promise<Uint8Array> {
    const document = await PDFDocument.load(pdfBinary);
    const page =
      document.getPageCount() > 0
        ? document.getPage(0)
        : document.addPage([this.pageWidth, this.pageHeight]);

    for (const fragment of fragments) {
      if (fragment.width <= 0 || fragment.height <= 0) {
        continue;
      }

      page.drawRectangle({
        x: fragment.x,
        y: this.pageHeight - fragment.y - fragment.height,
        width: fragment.width,
        height: fragment.height,
        borderWidth: 1,
        borderColor: rgb(0.95, 0.1, 0.1),
      });
    }

    return document.save();
  }
}

function resolvePageSize(
  rectangles: ReadonlyArray<SavePdfRectangleFragment>,
): { width: number; height: number } {
  let maxX = 800;
  let maxY = 600;

  for (const rectangle of rectangles) {
    maxX = Math.max(maxX, rectangle.x + rectangle.width);
    maxY = Math.max(maxY, rectangle.y + rectangle.height);
  }

  return {
    width: Math.ceil(maxX + 16),
    height: Math.ceil(maxY + 16),
  };
}
