import os from 'node:os';
import path from 'node:path';
import { Err, Ok } from '@monorepo/core-design-patterns';
import type { Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SaveCommand } from '../../src/features/saveFeature/SaveCommand.js';
import { SaveCommandHandler } from '../../src/features/saveFeature/SaveCommandHandler.js';
import { Server } from '../../src/server.js';

describe('server save command (unit)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps raw rectangle array payload to SaveCommandHandler command json', async () => {
    const handleSpy = vi.spyOn(SaveCommandHandler.prototype, 'Handle').mockResolvedValue(
      Ok({
        fileName: 'save-1.json',
        path: 'C:/tmp/save-1.json',
      }),
    );
    const sut = createServer();
    const response = createMockResponse();
    const rectangles = [{ x: 1, y: 2, width: 3, height: 4 }];

    await callHandleSaveCommand(sut, { body: rectangles }, response.res);

    expect(handleSpy).toHaveBeenCalledTimes(1);
    const command = handleSpy.mock.calls[0][0];
    expect(JSON.parse(command.json)).toEqual({ rectangles });
    expect(response.statusCode).toBe(202);
    expect(response.body).toEqual({
      ok: true,
      data: {
        fileName: 'save-1.json',
        path: 'C:/tmp/save-1.json',
      },
    });
  });

  it('returns 400 when save payload is invalid and does not call SaveCommandHandler', async () => {
    const handleSpy = vi.spyOn(SaveCommandHandler.prototype, 'Handle');
    const sut = createServer();
    const response = createMockResponse();

    await callHandleSaveCommand(sut, { body: { payload: {} } }, response.res);

    expect(handleSpy).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      error: 'Expected payload with a "rectangles" array.',
    });
  });

  it('returns 400 when SaveCommandHandler returns an error result', async () => {
    vi.spyOn(SaveCommandHandler.prototype, 'Handle').mockResolvedValue(
      Err('Save command failed.'),
    );
    const sut = createServer();
    const response = createMockResponse();

    await callHandleSaveCommand(
      sut,
      {
        body: {
          rectangles: [{ x: 10, y: 20, width: 30, height: 40 }],
        },
      },
      response.res,
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      error: 'Save command failed.',
    });
  });
});

function createServer(): Server {
  return new Server(0, {
    configuration: {
      saveDirectoryPath: path.join(os.tmpdir(), 'drawing-tool-server-unit-tests'),
    },
  });
}

async function callHandleSaveCommand(
  server: Server,
  request: Pick<Request, 'body'>,
  response: Response,
): Promise<void> {
  await (
    server as unknown as {
      handleSaveCommand(req: Request, res: Response): Promise<void>;
    }
  ).handleSaveCommand(
    {
      method: 'POST',
      path: '/api/save',
      body: request.body,
    } as Request,
    response,
  );
}

function createMockResponse(): {
  readonly res: Response;
  readonly bodyRef: { current: unknown };
  statusCode: number;
  body: unknown;
} {
  let statusCode = 200;
  const bodyRef: { current: unknown } = { current: undefined };

  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      bodyRef.current = payload;
      return this;
    },
  } as unknown as Response;

  return {
    res,
    bodyRef,
    get statusCode() {
      return statusCode;
    },
    get body() {
      return bodyRef.current;
    },
  };
}
