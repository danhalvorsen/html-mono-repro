import { describe, expect, it } from "vitest";
import {
  Pipeline,
  PipelineContext,
  type IBehavior,
  type IContextPipeline,
  type IHandler,
} from "@monorepo/core-design-patterns-mediator";

import {
  DragController,
  DragOperation,
  DragPipelineResult,
  DragStateStore,
  DraggingEnabledBehavior,
  OnDragMessage,
  OnDragMessageHandler,
  RectangleConstraintsBehaviour,
  VisibleBehavior,
  type IDragPipeline,
} from "../../src/index.js";
import { TestReactiveHost } from "../Fixtures/TestReactiveHost.js";
import { TestDraggable } from "./TestDraggable.js";

if (!customElements.get("test-draggable")) {
  customElements.define("test-draggable", TestDraggable);
}

class RecordingBehavior
  implements IBehavior<OnDragMessage, DragPipelineResult, DragPipelineResult>
{
  public constructor(
    private readonly name: string,
    private readonly inner: IBehavior<
      OnDragMessage,
      DragPipelineResult,
      DragPipelineResult
    >,
    private readonly calls: string[],
  ) {}

  public async execute(
    ctx: IContextPipeline,
    msg: OnDragMessage,
  ) {
    this.calls.push(this.name);
    return await this.inner.execute(ctx, msg);
  }
}

class RecordingHandler
  implements IHandler<OnDragMessage, DragPipelineResult>
{
  public constructor(
    private readonly name: string,
    private readonly inner: IHandler<OnDragMessage, DragPipelineResult>,
    private readonly calls: string[],
  ) {}

  public async handle(
    ctx: IContextPipeline,
    msg: OnDragMessage,
  ): Promise<DragPipelineResult> {
    this.calls.push(this.name);
    return await this.inner.handle(ctx, msg);
  }
}

class MediatorDragPipeline implements IDragPipeline {
  public readonly sentMessages: OnDragMessage[] = [];
  private readonly context = new PipelineContext();

  public constructor(
    private readonly pipeline: Pipeline<
      OnDragMessage,
      DragPipelineResult,
      DragPipelineResult
    >,
  ) {}

  public async send(message: OnDragMessage): Promise<DragPipelineResult> {
    this.sentMessages.push(message);

    const result = await this.pipeline.execute(this.context, message);

    return result.isOk() ? result.unwrap() : result.unwrapErr();
  }
}

describe("DragController pipeline integration", () => {
  it("should send OnDragMessage through the mediator pipeline and execute behaviors before the handler", async () => {
    const stateStore = new DragStateStore();
    const calls: string[] = [];

    stateStore.setVisible("shape-1");
    stateStore.setBounds("shape-1", {
      minX: 0,
      minY: 0,
      maxX: 100,
      maxY: 100,
    });

    const dragPipeline = new MediatorDragPipeline(
      new Pipeline<OnDragMessage, DragPipelineResult, DragPipelineResult>(
        [
          new RecordingBehavior(
            "DraggingEnabledBehavior",
            new DraggingEnabledBehavior(stateStore),
            calls,
          ),
          new RecordingBehavior(
            "VisibleBehavior",
            new VisibleBehavior(stateStore),
            calls,
          ),
          new RecordingBehavior(
            "RectangleConstraintsBehaviour",
            new RectangleConstraintsBehaviour(stateStore),
            calls,
          ),
        ],
        new RecordingHandler(
          "OnDragMessageHandler",
          new OnDragMessageHandler(stateStore),
          calls,
        ),
      ),
    );

    const draggable = document.createElement(
      "test-draggable",
    ) as TestDraggable;

    draggable.id = "shape-1";
    draggable.position = { x: 10, y: 20 };
    draggable.hit = true;

    const controller = new DragController(
      new TestReactiveHost(),
      () => [draggable],
      dragPipeline,
    );

    controller.onPointerDown({ x: 15, y: 25 });
    controller.onPointerMove({ x: 25, y: 35 });

    await flushAsyncWork();

    expect(draggable.setPositionCalls).toEqual([
      { x: 20, y: 30 },
    ]);

    expect(
      dragPipeline.sentMessages.map((message) => message.payload),
    ).toEqual([
      {
        operation: DragOperation.Start,
        targetId: "shape-1",
        x: 15,
        y: 25,
      },
      {
        operation: DragOperation.Move,
        targetId: "shape-1",
        x: 25,
        y: 35,
      },
    ]);

    expect(calls).toEqual([
      "DraggingEnabledBehavior",
      "VisibleBehavior",
      "RectangleConstraintsBehaviour",
      "OnDragMessageHandler",
      "DraggingEnabledBehavior",
      "VisibleBehavior",
      "RectangleConstraintsBehaviour",
      "OnDragMessageHandler",
    ]);

    expect(stateStore.getLastOperation("shape-1")).toBe(
      DragOperation.Move,
    );
  });
});

async function flushAsyncWork(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}
