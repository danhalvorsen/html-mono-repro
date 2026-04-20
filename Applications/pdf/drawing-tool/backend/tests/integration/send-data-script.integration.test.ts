import net from 'node:net';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { CoreFileSystemModule, Path } from '@monorepo/core-filesystem';
import { describe, expect, it, vi } from 'vitest';
import { SaveCommandHandler } from '../../src/features/saveFeature/SaveCommandHandler.js';
import { SaveCommandPipelineHandler } from '../../src/features/saveFeature/SaveCommandPipelineHandler.js';
import { Server } from '../../src/server.js';
import { withTempSaveDirectory } from '../fixtures/saveFeature.fixture.js';

const execFileAsync = promisify(execFile);

describe('send-data script integration (SUT: src/server.ts)', () => {
  it('runs scripts/send-data.ts and triggers save command handler flow in server.ts', async () => {
    await withTempSaveDirectory(async (saveDirectory) => {
      const port = await getFreePort();
      const handleSpy = vi.spyOn(SaveCommandHandler.prototype, 'Handle');
      const pipelineHandleSpy = vi.spyOn(SaveCommandPipelineHandler.prototype, 'handle');
      const server = new Server(port, { saveDirectory });

      try {
        await server.start();

        const sendResult = await execFileAsync(
          'cmd.exe',
          ['/c', 'pnpm', 'send:data'],
          {
            cwd: process.cwd(),
            env: {
              ...process.env,
              SAVE_API_URL: `http://127.0.0.1:${port}/api/commands/save`,
            },
          },
        );

        expect(sendResult.stdout).toContain('202');
        await waitFor(() => handleSpy.mock.calls.length > 0, 5_000, () => 'Expected SaveCommandHandler.Handle to be called.');
        await waitFor(() => pipelineHandleSpy.mock.calls.length > 0, 5_000, () => 'Expected SaveCommandPipelineHandler.handle to be called.');

        expect(handleSpy).toHaveBeenCalledTimes(1);
        expect(pipelineHandleSpy).toHaveBeenCalledTimes(1);

        const saveDirectoryRef = new CoreFileSystemModule().createDirectory(
          Path.from(saveDirectory),
        );
        const files = saveDirectoryRef.listFiles();
        expect(files.length).toBeGreaterThan(0);
      } finally {
        pipelineHandleSpy.mockRestore();
        handleSpy.mockRestore();
        await server.stop();
      }
    });
  }, 30_000);
});

async function getFreePort(): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      if (!address || typeof address === 'string') {
        probe.close(() => reject(new Error('Unable to resolve free TCP port.')));
        return;
      }
      const { port } = address;
      probe.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
  });
}

async function waitFor(
  predicate: () => boolean,
  timeoutMs: number,
  onTimeoutMessage: () => string,
): Promise<void> {
  const startedAt = Date.now();
  while (!predicate()) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(onTimeoutMessage());
    }
    await delay(25);
  }
}

async function delay(ms: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
