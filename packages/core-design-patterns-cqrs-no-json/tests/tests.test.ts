import {
  Command,
  Query,
  Notification,
  ICommandBase,
  IQueryBase,
  INotificationBase,
  CommandHandler,
  ICommand,
  IQuery,
  NotificationHandler,
  INotification,
  IHandler,
  QueryHandler,
} from "../src/index.js";
import { describe, it, expect } from "vitest";

describe("core-design-patterns-cqrs-no-json", () => {
  class OkResult<TValue> {
    public readonly value: TValue;

    public constructor(value: TValue) {
      this.value = value;
    }
  }

  class ErrResult<TError> {
    public readonly error: TError;

    public constructor(error: TError) {
      this.error = error;
    }
  }

  interface CreateSequencerCommandMessage extends ICommandBase {
    readonly id: string;
    readonly name: string;
  }

  interface GetSequencerQueryMessage extends IQueryBase {
    readonly id: string;
  }

  interface SequencerChangedNotificationMessage extends INotificationBase {
    readonly sequencerId: string;
    readonly reason: string;
  }

  class TestCommandHandler extends CommandHandler<
    CreateSequencerCommandMessage,
    OkResult<string>,
    ErrResult<string>
  > {
    public async Handle(
      command: ICommand<CreateSequencerCommandMessage>
    ): Promise<OkResult<OkResult<string>> | ErrResult<ErrResult<string>>> {
      const message = command.message;

      if (message.name.trim().length === 0) {
        return new ErrResult(new ErrResult("name-required"));
      }

      return new OkResult(new OkResult(`${message.id}:${message.name}`));
    }
  }

  class TestQueryHandler extends QueryHandler<
    GetSequencerQueryMessage,
    OkResult<string>,
    ErrResult<string>
  > {
    public async Handle(
      query: IQuery<GetSequencerQueryMessage>
    ): Promise<OkResult<OkResult<string>> | ErrResult<ErrResult<string>>> {
      const message = query.message;

      if (message.id.trim().length === 0) {
        return new ErrResult(new ErrResult("id-required"));
      }

      return new OkResult(new OkResult(`sequencer:${message.id}`));
    }
  }

  class TestNotificationHandler extends NotificationHandler<SequencerChangedNotificationMessage> {
    private readonly _received: SequencerChangedNotificationMessage[];

    public constructor() {
      super();
      this._received = [];
    }

    public get received(): readonly SequencerChangedNotificationMessage[] {
      return this._received;
    }

    public override async Handle(
      notification: INotification<SequencerChangedNotificationMessage>
    ): Promise<void> {
      this._received.push(notification.message);
    }
  }

  class CommandFixture {
    public readonly message: CreateSequencerCommandMessage;
    public readonly command: Command<CreateSequencerCommandMessage>;
    public readonly handler: TestCommandHandler;

    public constructor(args?: { readonly id?: string; readonly name?: string }) {
      this.message = {
        id: args?.id ?? "seq-1",
        name: args?.name ?? "Bassline",
      };
      this.command = new Command(this.message);
      this.handler = new TestCommandHandler();
    }
  }

  class QueryFixture {
    public readonly message: GetSequencerQueryMessage;
    public readonly query: Query<GetSequencerQueryMessage>;
    public readonly handler: TestQueryHandler;

    public constructor(args?: { readonly id?: string }) {
      this.message = {
        id: args?.id ?? "seq-1",
      };
      this.query = new Query(this.message);
      this.handler = new TestQueryHandler();
    }
  }

  class NotificationFixture {
    public readonly message: SequencerChangedNotificationMessage;
    public readonly notification: Notification<SequencerChangedNotificationMessage>;
    public readonly handler: TestNotificationHandler;

    public constructor(args?: { readonly sequencerId?: string; readonly reason?: string }) {
      this.message = {
        sequencerId: args?.sequencerId ?? "seq-1",
        reason: args?.reason ?? "pattern-selected",
      };
      this.notification = new Notification(this.message);
      this.handler = new TestNotificationHandler();
    }
  }

  describe("Command", () => {
    it("should expose the same message instance that was passed to the constructor", () => {
      const fixture = new CommandFixture();

      expect(fixture.command.message).toBe(fixture.message);
    });

    it("should preserve typed command message values", () => {
      const fixture = new CommandFixture({
        id: "seq-9",
        name: "Lead",
      });

      expect(fixture.command.message.id).toBe("seq-9");
      expect(fixture.command.message.name).toBe("Lead");
    });
  });

  describe("Query", () => {
    it("should expose the same message instance that was passed to the constructor", () => {
      const fixture = new QueryFixture();

      expect(fixture.query.message).toBe(fixture.message);
    });

    it("should preserve typed query message values", () => {
      const fixture = new QueryFixture({
        id: "seq-42",
      });

      expect(fixture.query.message.id).toBe("seq-42");
    });
  });

  describe("Notification", () => {
    it("should expose the same message instance that was passed to the constructor", () => {
      const fixture = new NotificationFixture();

      expect(fixture.notification.message).toBe(fixture.message);
    });

    it("should preserve typed notification message values", () => {
      const fixture = new NotificationFixture({
        sequencerId: "seq-2",
        reason: "transport-started",
      });

      expect(fixture.notification.message.sequencerId).toBe("seq-2");
      expect(fixture.notification.message.reason).toBe("transport-started");
    });
  });

  describe("CommandHandler", () => {
    it("should return success when the command message is valid", async () => {
      const fixture = new CommandFixture();

      const result = await fixture.handler.Handle(fixture.command);

      expect(result).toBeInstanceOf(OkResult);
      expect((result as OkResult<OkResult<string>>).value.value).toBe("seq-1:Bassline");
    });

    it("should return error when the command message is invalid", async () => {
      const fixture = new CommandFixture({
        name: "   ",
      });

      const result = await fixture.handler.Handle(fixture.command);

      expect(result).toBeInstanceOf(ErrResult);
      expect((result as ErrResult<ErrResult<string>>).error.error).toBe("name-required");
    });
  });

  describe("QueryHandler", () => {
    it("should return success when the query message is valid", async () => {
      const fixture = new QueryFixture();

      const result = await fixture.handler.Handle(fixture.query);

      expect(result).toBeInstanceOf(OkResult);
      expect((result as OkResult<OkResult<string>>).value.value).toBe("sequencer:seq-1");
    });

    it("should return error when the query message is invalid", async () => {
      const fixture = new QueryFixture({
        id: "   ",
      });

      const result = await fixture.handler.Handle(fixture.query);

      expect(result).toBeInstanceOf(ErrResult);
      expect((result as ErrResult<ErrResult<string>>).error.error).toBe("id-required");
    });
  });

  describe("NotificationHandler", () => {
    it("should receive and store a notification message", async () => {
      const fixture = new NotificationFixture();

      await fixture.handler.Handle(fixture.notification);

      expect(fixture.handler.received).toHaveLength(1);
      expect(fixture.handler.received[0]).toBe(fixture.message);
    });

    it("should store multiple notifications in order", async () => {
      const fixture = new NotificationFixture();
      const second = new Notification<SequencerChangedNotificationMessage>({
        sequencerId: "seq-2",
        reason: "record-armed",
      });

      await fixture.handler.Handle(fixture.notification);
      await fixture.handler.Handle(second);

      expect(fixture.handler.received).toHaveLength(2);
      expect(fixture.handler.received[0].sequencerId).toBe("seq-1");
      expect(fixture.handler.received[1].sequencerId).toBe("seq-2");
      expect(fixture.handler.received[1].reason).toBe("record-armed");
    });
  });

  describe("IHandler compatibility", () => {
    class GenericQueryHandler implements IHandler<
      IQuery<GetSequencerQueryMessage>,
      OkResult<string>,
      ErrResult<string>
    > {
      public async Handle(
        request: IQuery<GetSequencerQueryMessage>
      ): Promise<OkResult<OkResult<string>> | ErrResult<ErrResult<string>>> {
        if (request.message.id === "missing") {
          return new ErrResult(new ErrResult("not-found"));
        }

        return new OkResult(new OkResult(`handled:${request.message.id}`));
      }
    }

    it("should support a generic handler contract with query requests", async () => {
      const fixture = new QueryFixture();
      const handler = new GenericQueryHandler();

      const result = await handler.Handle(fixture.query);

      expect(result).toBeInstanceOf(OkResult);
      expect((result as OkResult<OkResult<string>>).value.value).toBe("handled:seq-1");
    });

    it("should return an error result through the generic handler contract", async () => {
      const fixture = new QueryFixture({
        id: "missing",
      });
      const handler = new GenericQueryHandler();

      const result = await handler.Handle(fixture.query);

      expect(result).toBeInstanceOf(ErrResult);
      expect((result as ErrResult<ErrResult<string>>).error.error).toBe("not-found");
    });
  });
});
