import express, { type Express, type Request, type Response } from "express";
import bearerToken from "express-bearer-token";
import type { CommandDispatcher, QueryDispatcher } from "../cqrs/Dispatchers.js";
import type { CommandMessage } from "../messages/CommandMessages.js";
import type { QueryMessage } from "../messages/QueryMessages.js";

export class ExpressApplicationFactory {
  public constructor(
    private readonly commandDispatcher: CommandDispatcher,
    private readonly queryDispatcher: QueryDispatcher,
  ) {}

  public create(): Express {
    const app = express();

    app.use(express.json({ limit: "10mb" }));
    app.use(bearerToken());

    app.post("/api/command", async (request: Request, response: Response) => {
      const result = await this.commandDispatcher.dispatch(request.body as CommandMessage);
      response.status(result.ok ? 200 : 400).json(result);
    });

    app.post("/api/query", async (request: Request, response: Response) => {
      const result = await this.queryDispatcher.dispatch(request.body as QueryMessage);
      response.status(result.ok ? 200 : 400).json(result);
    });

    return app;
  }
}