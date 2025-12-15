import { describe, it, expect } from 'vitest';
import { Path } from '../src/Path.js';
import fs from 'fs';

const tempFile = './test.txt';

describe('Path', () => {
  it('creates a path and resolves correctly', () => {
    const p = Path.from('folder', 'file.txt');
    expect(p.full).toMatch(/folder[\\/]file\.txt$/);
  });

  it('gets basename, extension, and parent', () => {
    const p = Path.from(tempFile);
    expect(p.basename).toBe('test.txt');
    expect(p.extension).toBe('.txt');
    expect(p.parent.full).not.toBe(p.full);
  });

  it('checks existence', () => {
    fs.writeFileSync(tempFile, 'data');
    const p = Path.from(tempFile);
    expect(p.exists()).toBe(true);
    fs.unlinkSync(tempFile);
  });
});