import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Path, File } from '@my-graphics/core-filesystem'

const testPath = Path.from('./file-test.txt');
const file = new File(testPath);

beforeEach(() => {
  if (file.exists()) file.delete();
});

afterEach(() => {
  if (file.exists()) file.delete();
});

describe('File', () => {
  it('writes and reads file content', () => {
    file.write('hello');
    expect(file.read()).toBe('hello');
  });

  it('checks file existence and deletes it', () => {
    file.write('test');
    expect(file.exists()).toBe(true);
    file.delete();
    expect(file.exists()).toBe(false);
  });
});