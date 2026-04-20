import path from 'node:path';
import { Err } from '@monorepo/core-design-patterns';
import { CoreFileSystemModule, Path } from '@monorepo/core-filesystem';
import { Mediator, PipelineContext } from '@monorepo/core-design-patterns-mediator';
import { describe, expect, it } from 'vitest';
import { SaveCommandHandler } from '../../src/features/saveFeature/SaveCommandHandler.js';
import { SaveCommandMessage } from '../../src/features/saveFeature/SaveCommandMessage.js';
import { SaveCommandPipeline } from '../../src/features/saveFeature/SaveCommandPipeline.js';
import { SaveCommandPipelineContext } from '../../src/features/saveFeature/SaveCommandPipelineContext.js';
import { SaveCommandPipelineError } from '../../src/features/saveFeature/SaveCommandPipelineError.js';
import type { SaveCommandSuccess } from '../../src/features/saveFeature/SaveCommandSuccess.js';
import {
  FIXED_NOW,
  FIXTURE_RECTANGLES,
  createInvalidSaveCommandRequest,
  createSaveCommandRequest,
  withTempSaveDirectory,
} from '../fixtures/saveFeature.fixture.js';

describe('saveFeature (unit)', () => {
  it('SaveCommandPipeline executes behaviors and writes rectangles to disk', async () => {
    await withTempSaveDirectory(async (saveDirectory) => {
      const pipeline = new SaveCommandPipeline(saveDirectory, () => FIXED_NOW);

      const result = await pipeline.execute(
        new SaveCommandPipelineContext(),
        new SaveCommandMessage(FIXTURE_RECTANGLES),
      );

      expect(result.isOk()).toBe(true);
      if (!result.isOk()) {
        throw new Error('Expected save pipeline to succeed.');
      }

      const saved = result.unwrap();
      expect(saved.fileName).toBe(`save-${FIXED_NOW}.json`);
      expect(saved.path).toBe(path.join(saveDirectory, saved.fileName));

      const fileSystem = new CoreFileSystemModule();
      const fileContent = fileSystem
        .createFile(Path.from(saved.path))
        .read('utf8');
      expect(JSON.parse(fileContent)).toEqual(FIXTURE_RECTANGLES);
    });
  });

  it('SaveCommandHandler returns ok when mediator returns success', async () => {
    await withTempSaveDirectory(async (saveDirectory) => {
      const pipeline = new SaveCommandPipeline(saveDirectory, () => FIXED_NOW);
      const mediator = new Mediator(pipeline);
      const handler = new SaveCommandHandler(mediator);

      const result = await handler.Handle(createSaveCommandRequest());

      expect(result.isOk()).toBe(true);
      if (!result.isOk()) {
        throw new Error('Expected save command handler to succeed.');
      }

      expect(result.unwrap().fileName).toBe(`save-${FIXED_NOW}.json`);
    });
  });

  it('SaveCommandHandler returns err when command payload is invalid', async () => {
    const mediator = {
      send: async () =>
        Err<SaveCommandSuccess, SaveCommandPipelineError>(
          new SaveCommandPipelineError('unused', 500, 'unused'),
        ),
    } as unknown as Mediator<
      SaveCommandMessage,
      SaveCommandSuccess,
      SaveCommandPipelineError
    >;
    const handler = new SaveCommandHandler(mediator);

    const result = await handler.Handle(createInvalidSaveCommandRequest());

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) {
      throw new Error('Expected invalid command to fail.');
    }

    expect(result.unwrapErr()).toBe('Expected payload with a "rectangles" array.');
  });

  it('SaveCommandHandler maps pipeline error reason to command error', async () => {
    const mediator = {
      send: async (_msg: SaveCommandMessage, _ctx: PipelineContext) =>
        Err<SaveCommandSuccess, SaveCommandPipelineError>(
          new SaveCommandPipelineError(
            'command.validation',
            400,
            'Rectangles payload is invalid.',
          ),
        ),
    } as unknown as Mediator<
      SaveCommandMessage,
      SaveCommandSuccess,
      SaveCommandPipelineError
    >;
    const handler = new SaveCommandHandler(mediator);

    const result = await handler.Handle(createSaveCommandRequest());

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) {
      throw new Error('Expected mediator error to be mapped to command error.');
    }

    expect(result.unwrapErr()).toBe('Rectangles payload is invalid.');
  });
});
