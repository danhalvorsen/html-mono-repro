// Applications/pdf/drawing-tool/backend/src/features/saveFeature/SaveCommandPipelineHandler.ts

import type { IHandler } from '@monorepo/core-design-patterns-mediator';
import { CoreFileSystemModule, Path } from '@monorepo/core-filesystem';

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

      const fileName = `save-${this.now()}.json`;
      const filePath = directory.path.join(fileName);
      const file = this.fileSystem.createFile(filePath);

      file.write(
        JSON.stringify(msg.rectangles, null, 2),
        'utf8',
      );

      return {
        fileName,
        path: filePath.full,
      };
    } catch (error: unknown) {
      throw new SaveCommandPipelineError(
        'command.handler',
        500,
        error instanceof Error ? error.message : 'Unexpected save error.',
      );
    }
  }
}
