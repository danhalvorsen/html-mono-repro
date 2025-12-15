import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Path } from '../src/Path.js';
import { Directory } from '../src/Directory.js';
import { File } from '../src/File.js';
import fs from 'fs';

const testDirPath = Path.from('./test-dir');
const testFilePath = testDirPath.join('sample.txt');
const dir = new Directory(testDirPath);
const file = new File(testFilePath);

beforeEach(() => {
  if (!dir.exists()) dir.create();
  file.write('sample');
});

afterEach(() => {
  if (dir.exists()) dir.delete();
});

describe('Directory', () => {
  it('creates directory and lists files', () => {
    expect(dir.exists()).toBe(true);
    const files = dir.listFiles();
    expect(files.length).toBeGreaterThan(0);
  });

  it('lists subdirectories', () => {
    const subDir = new Directory(testDirPath.join('sub'));
    subDir.create();
    const dirs = dir.listDirs();
    expect(dirs.some(d => d.path.full.includes('sub'))).toBe(true);
  });
});
