import { execFile, spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import { FIXTURE_RECTANGLES } from '../fixtures/saveFeature.fixture.js';

const execFileAsync = promisify(execFile);

describe('Save command pnpm dev integration', () => {
  it('runs pnpm dev, sends HTTP save request, and logs SaveCommandHandler handle call', async () => {
    const devServer = startDevServer();
    try {
      await waitFor(
        () => devServer.stdout.includes('Server running on http://localhost:3000'),
        15_000,
        () => `pnpm dev did not start.\nSTDOUT:\n${devServer.stdout}\nSTDERR:\n${devServer.stderr}`,
      );

      const payload = { rectangles: FIXTURE_RECTANGLES };
      const response = await postJsonWithCurl(
        'http://127.0.0.1:3000/api/commands/save',
        payload,
      );

      expect(response.statusCode).toBe(202);
      await waitFor(
        () => devServer.stdout.includes('[SaveCommandHandler] Handle called.'),
        5_000,
        () =>
          `Expected SaveCommandHandler log not found.\nSTDOUT:\n${devServer.stdout}\nSTDERR:\n${devServer.stderr}`,
      );
    } finally {
      await stopProcessTree(devServer.process);
    }
  }, 25_000);
});

function startDevServer(): {
  process: ChildProcessWithoutNullStreams;
  stdout: string;
  stderr: string;
} {
  const childEnv = { ...process.env };
  delete childEnv.VITEST;

  const child = spawn('cmd.exe', ['/c', 'pnpm', 'dev'], {
    cwd: process.cwd(),
    env: childEnv,
    stdio: 'pipe',
  });

  const state = {
    process: child,
    stdout: '',
    stderr: '',
  };

  child.stdout.on('data', (chunk: Buffer) => {
    state.stdout += chunk.toString();
  });
  child.stderr.on('data', (chunk: Buffer) => {
    state.stderr += chunk.toString();
  });

  return state;
}

async function stopProcessTree(
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
      // best effort cleanup
    }
  }

  await waitFor(
    () => child.exitCode !== null,
    5_000,
    () => 'pnpm dev process did not stop in time.',
  );
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
