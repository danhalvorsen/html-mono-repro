import { readFileSync } from 'node:fs';
import path from 'node:path';

export interface BackendConfiguration {
  readonly saveDirectoryPath: string;
}

const DEFAULT_CONFIGURATION_PATH = path.resolve(process.cwd(), 'configuration.json');

export function loadBackendConfiguration(
  configurationPath: string = DEFAULT_CONFIGURATION_PATH,
): BackendConfiguration {
  const rawContent = readFileSync(configurationPath, 'utf8');
  const parsed = JSON.parse(rawContent) as unknown;

  if (!isRecord(parsed)) {
    throw new Error('configuration.json must contain an object.');
  }

  const saveDirectoryPath = readString(parsed.saveDirectoryPath, 'saveDirectoryPath');
  if (!path.isAbsolute(saveDirectoryPath)) {
    throw new Error('configuration.json saveDirectoryPath must be absolute.');
  }

  if (hasTraversalSegment(saveDirectoryPath)) {
    throw new Error('configuration.json saveDirectoryPath must not contain traversal segments.');
  }

  return {
    saveDirectoryPath,
  };
}

function readString(value: unknown, name: string): string {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  throw new Error(`configuration.json ${name} must be a non-empty string.`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasTraversalSegment(value: string): boolean {
  return value
    .split(/[\\/]+/)
    .some((segment) => segment === '..');
}
