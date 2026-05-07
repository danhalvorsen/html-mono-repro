import { CompositionRoot } from "./composition/CompositionRoot.js";
import { ExpressApplicationFactory } from "./web/ExpressApplicationFactory.js";

const port = Number(process.env.PORT ?? "3000");
const composition = new CompositionRoot().create();

const app = new ExpressApplicationFactory(
  composition.commandDispatcher,
  composition.queryDispatcher,
).create();

installRequestLogging(app);
app.listen(port, () => {
  console.log(`PID stencil training image API listening on http://localhost:${port}`);
  console.log("POST /api/command");
  console.log("POST /api/query");
});

function installRequestLogging(app: {
  use: (
    middleware: (
      request: {
        method: string;
        url?: string;
        path?: string;
      },
      response: {
        statusCode: number;
        on: (eventName: "finish", listener: () => void) => void;
      },
      next: () => void,
    ) => void,
  ) => void;
}): void {
  app.use((request, response, next) => {
    const startedAt = Date.now();
    const path = request.path ?? request.url ?? "";

    console.info("[training-image-api] request-start", {
      method: request.method,
      path,
    });

    response.on("finish", () => {
      console.info("[training-image-api] request-end", {
        method: request.method,
        path,
        statusCode: response.statusCode,
        durationMs: Date.now() - startedAt,
      });
    });

    next();
  });
}
