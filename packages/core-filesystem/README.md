# @my-graphics/core-filesystem

A lightweight utility package that provides safe and composable wrappers around file, directory, and path operations using Node.js core modules.

## Features

- `Path`: Immutable wrapper for filesystem paths.
- `File`: Read/write/delete operations.
- `Directory`: Create/list/delete directory structures.
- Strongly typed and tested using Vitest.

## Usage

```ts
import { Path, File, Directory } from '@my-graphics/core-filesystem';

const dir = new Directory(Path.from('./example'));
dir.create();

const file = new File(dir.path.join('notes.txt'));
file.write('Hello world!');
console.log(file.read());
