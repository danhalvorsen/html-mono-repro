import os from 'node:os';
import path from 'node:path';
import type { ICommand } from '@monorepo/core-design-patterns-cqrs';
import { CoreFileSystemModule, Path } from '@monorepo/core-filesystem';
import { SaveCommand, type Rectangle } from '../../src/features/saveFeature/SaveCommand.js';

export const FIXED_NOW = 1_717_000_000_000;

export const FIXTURE_RECTANGLES: ReadonlyArray<Rectangle> = [
  { x: 10, y: 20, width: 100, height: 40 },
  { x: 140, y: 30, width: 60, height: 70 },
];

export async function withTempSaveDirectory(
  run: (saveDirectory: string) => Promise<void>,
): Promise<void> {
  const fileSystem = new CoreFileSystemModule();
  const saveDirectory = path.join(
    os.tmpdir(),
    `drawing-tool-save-feature-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  const directory = fileSystem.createDirectory(Path.from(saveDirectory));
  directory.create(true);

  try {
    await run(saveDirectory);
  } finally {
    directory.delete(true);
  }
}

export function createSaveCommandRequest(
  rectangles: ReadonlyArray<Rectangle> = FIXTURE_RECTANGLES,
): ICommand<SaveCommand> {
  return {
    json: JSON.stringify({ rectangles }),
  };
}

export function createInvalidSaveCommandRequest(): ICommand<SaveCommand> {
  return {
    json: JSON.stringify({ payload: [] }),
  };
}
