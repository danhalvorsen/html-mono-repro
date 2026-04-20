import net from 'node:net';
import { execFile, spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { promisify } from 'node:util';
import { CoreFileSystemModule, Path } from '@monorepo/core-filesystem';
import { describe, expect, it, vi } from 'vitest';
import { SaveCommandHandler } from '../../src/features/saveFeature/SaveCommandHandler.js';
import { SaveCommandPipelineHandler } from '../../src/features/saveFeature/SaveCommandPipelineHandler.js';
import { Server } from '../../src/server.js';
import { FIXTURE_RECTANGLES, withTempSaveDirectory } from '../fixtures/saveFeature.fixture.js';

const execFileAsync = promisify(execFile);

describe('Save command HTTP integration', () => {
  it('curls SaveCommand through default server flow and persists save payload', async () => {
    await withTempSaveDirectory(async (saveDirectory) => {
      const port = await getFreePort();
      const server = new Server(port, { saveDirectory });

      await server.start();
      try {
        const payload = { rectangles: FIXTURE_RECTANGLES };
        const response = await postJsonWithCurl(
          `http://127.0.0.1:${port}/api/commands/save`,
          payload,
        );

        expect(response.statusCode).toBe(202);
        expect(response.body).toMatchObject({
          ok: true,
          data: {
            fileName: expect.stringMatching(/^save-\d+\.json$/),
            path: expect.stringContaining(saveDirectory),
          },
        });
        const saveDirectoryRef = new CoreFileSystemModule().createDirectory(Path.from(saveDirectory));
        const files = saveDirectoryRef.listFiles();
        expect(files).toHaveLength(1);
        expect(JSON.parse(files[0].read('utf8'))).toEqual(FIXTURE_RECTANGLES);
      } finally {
        await server.stop();
      }
    });
  });

  it('does not call SaveCommandPipelineHandler.handle when payload is invalid', async () => {
    await withTempSaveDirectory(async (saveDirectory) => {
      const handleSpy = vi.spyOn(SaveCommandPipelineHandler.prototype, 'handle');
      const port = await getFreePort();
      const server = new Server(port, { saveDirectory });

      await server.start();
      try {
        const response = await postJsonWithCurl(
          `http://127.0.0.1:${port}/api/commands/save`,
          { payload: {} },
        );

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          ok: false,
          error: 'Expected payload with a "rectangles" array.',
        });
        expect(handleSpy).not.toHaveBeenCalled();

        const saveDirectoryRef = new CoreFileSystemModule().createDirectory(Path.from(saveDirectory));
        expect(saveDirectoryRef.listFiles()).toHaveLength(0);
      } finally {
        handleSpy.mockRestore();
        await server.stop();
      }
    });
  });

  it('real integration (SUT: Server.ts): default save route persists payload and runs SaveCommandHandler', async () => {
    await withTempSaveDirectory(async (saveDirectory) => {
      const handleSpy = vi.spyOn(SaveCommandHandler.prototype, 'Handle');
      const port = await getFreePort();
      const sut = new Server(port, { saveDirectory });

      await sut.start();
      try {
        const payload = { rectangles: FIXTURE_RECTANGLES };
        const response = await postJsonWithCurl(
          `http://127.0.0.1:${port}/api/commands/save`,
          payload,
        );

        expect(response.statusCode).toBe(202);
        const saveDirectoryRef = new CoreFileSystemModule().createDirectory(Path.from(saveDirectory));
        const files = saveDirectoryRef.listFiles();
        expect(files).toHaveLength(1);
        expect(JSON.parse(files[0].read('utf8'))).toEqual(FIXTURE_RECTANGLES);
        expect(handleSpy).toHaveBeenCalledTimes(1);
        expect(JSON.parse(handleSpy.mock.calls[0][0].json)).toEqual(payload);
      } finally {
        handleSpy.mockRestore();
        await sut.stop();
      }
    });
  });

  it('real process integration (SUT: Server.ts): stdout contains SaveCommandHandler handle log', async () => {
    await withTempSaveDirectory(async (saveDirectory) => {
      const port = await getFreePort();
      const harness = startServerHarness(port, saveDirectory);
      try {
        await waitFor(
          () => harness.stdout.includes(`Server running on http://localhost:${port}`),
          10_000,
          () => `Server harness did not start in time.\nSTDERR:\n${harness.stderr}`,
        );

        const response = await postJsonWithCurl(
          `http://127.0.0.1:${port}/api/commands/save`,
          { rectangles: FIXTURE_RECTANGLES },
        );

        expect(response.statusCode).toBe(202);
        await waitFor(
          () => harness.stdout.includes('[SaveCommandHandler] Handle called.'),
          5_000,
          () => `SaveCommandHandler log was not emitted by server process.\nSTDOUT:\n${harness.stdout}\nSTDERR:\n${harness.stderr}`,
        );
      } finally {
        await stopServerHarness(harness.process);
      }
    });
  }, 20_000);
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
      probe.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        resolve(port);
      });
    });
  });
}

async function postJsonWithCurl(
  url: string,
  payload: unknown,
): Promise<{ statusCode: number; body: unknown }> {
  const { stdout } = await execFileAsync('curl', [
    '-sS',
    '-X',
    'POST',
    url,
    '-H',
    'Content-Type: application/json',
    '--data-raw',
    JSON.stringify(payload),
    '--write-out',
    '\n%{http_code}',
  ]);

  const output = stdout.replace(/\r\n/g, '\n').trimEnd();
  const newlineIndex = output.lastIndexOf('\n');
  if (newlineIndex === -1) {
    throw new Error(`Unexpected curl output: ${output}`);
  }

  const bodyText = output.slice(0, newlineIndex);
  const statusCode = Number.parseInt(output.slice(newlineIndex + 1), 10);
  return {
    statusCode,
    body: bodyText.length === 0 ? null : JSON.parse(bodyText),
  };
}

function startServerHarness(
  port: number,
  saveDirectory: string,
): { process: ChildProcessWithoutNullStreams; stdout: string; stderr: string } {
  const child = spawn(
    'cmd.exe',
    [
      '/c',
      'pnpm',
      'exec',
      'tsx',
      'tests/integration/server-log-harness.ts',
      String(port),
      saveDirectory,
    ],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'pipe',
    },
  );

  const harness = {
    process: child,
    stdout: '',
    stderr: '',
  };

  child.stdout.on('data', (chunk: Buffer) => {
    harness.stdout += chunk.toString();
  });
  child.stderr.on('data', (chunk: Buffer) => {
    harness.stderr += chunk.toString();
  });

  return harness;
}

async function stopServerHarness(
  child: ChildProcessWithoutNullStreams,
): Promise<void> {
  if (child.exitCode !== null) {
    return;
  }

  const pid = child.pid;
  if (pid !== undefined) {
    try {
      await execFileAsync('cmd.exe', [
        '/c',
        'taskkill',
        '/PID',
        String(pid),
        '/T',
        '/F',
      ]);
    } catch {
      // Best-effort cleanup; fallback wait still runs.
    }
  }

  await waitFor(() => child.exitCode !== null, 5_000, () => 'Server harness did not stop in time.');
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
