import { Buffer } from "node:buffer";
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolve } from "node:path";
import type { Plugin, PreviewServer, ViteDevServer } from "vite";
import { SaveRectangleCellsCommandHandler } from "./commands/SaveRectangleCellsCommandHandler.js";
import { GetBackendHealthQueryHandler } from "./queries/GetBackendHealthQueryHandler.js";

interface IViteBackendPluginOptions {
    readonly savedDirectoryPath?: string;
}

export function viteBackendPlugin(options: IViteBackendPluginOptions = {}): Plugin {
    const savedDirectoryPath = options.savedDirectoryPath ?? resolve(process.cwd(), "saved");
    const saveRectangleCellsCommandHandler = new SaveRectangleCellsCommandHandler(savedDirectoryPath);
    const getBackendHealthQueryHandler = new GetBackendHealthQueryHandler();

    return {
        name: "make-clusters-vite-backend",
        configureServer(server) {
            installBackendMiddleware(
                server,
                saveRectangleCellsCommandHandler,
                getBackendHealthQueryHandler
            );
        },
        configurePreviewServer(server) {
            installBackendMiddleware(
                server,
                saveRectangleCellsCommandHandler,
                getBackendHealthQueryHandler
            );
        }
    };
}

function installBackendMiddleware(
    server: ViteDevServer | PreviewServer,
    saveRectangleCellsCommandHandler: SaveRectangleCellsCommandHandler,
    getBackendHealthQueryHandler: GetBackendHealthQueryHandler
): void {
    server.middlewares.use(async (request, response, next) => {
        const path = request.url?.split("?")[0] ?? "";

        if (request.method === "GET" && path === "/health") {
            await handleHealth(response, getBackendHealthQueryHandler);
            return;
        }

        if (request.method === "POST" && path === "/api/save-rectangle-cells") {
            await handleSaveRectangleCells(request, response, saveRectangleCellsCommandHandler);
            return;
        }

        next();
    });
}

async function handleHealth(
    response: ServerResponse,
    getBackendHealthQueryHandler: GetBackendHealthQueryHandler
): Promise<void> {
    const result = await getBackendHealthQueryHandler.handle({
        json: JSON.stringify({})
    });

    result.match({
        ok: (value) => writeJson(response, 200, value),
        err: (error) => writeJson(response, 500, { error })
    });
}

async function handleSaveRectangleCells(
    request: IncomingMessage,
    response: ServerResponse,
    saveRectangleCellsCommandHandler: SaveRectangleCellsCommandHandler
): Promise<void> {
    try {
        const body = await readJsonBody(request);
        const result = await saveRectangleCellsCommandHandler.Handle({
            json: JSON.stringify(body)
        });

        result.match({
            ok: (value) => writeJson(response, 200, value),
            err: (error) => writeJson(response, 400, { error })
        });
    }
    catch (error) {
        writeJson(response, 400, {
            error: error instanceof Error ? error.message : "Invalid JSON request body."
        });
    }
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    const maximumBytes = 1_000_000;

    for await (const chunk of request) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        totalBytes += buffer.byteLength;

        if (totalBytes > maximumBytes) {
            throw new Error("Request body is too large.");
        }

        chunks.push(buffer);
    }

    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function writeJson(response: ServerResponse, statusCode: number, value: unknown): void {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(value));
}
