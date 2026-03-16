// ============================================================================
// tests/fixtures/DragPipelineFixture.ts
// OOP fixture for testing Behaviors and Handlers in isolation or together
// ============================================================================

import { beforeEach } from "vitest";

import { Pipeline } from "@monorepo/core-design-patterns-mediator";
import { PipelineContext } from "@monorepo/core-design-patterns-mediator";
import type {
  IBehavior,
  IContextPipeline,
  IHandler,
} from "@monorepo/core-design-patterns-mediator";

import type { Result } from "@monorepo/core-design-patterns";
import { Ok } from "@monorepo/core-design-patterns";
import { OnDragMessage, DragPipelineResult, DragStateStore, DragOperation, IDragBounds } from "../../src";

export class DragPipelineFixture {
  private currentPipeline!: Pipeline<
    OnDragMessage,
    DragPipelineResult,
    DragPipelineResult
  >;

  private currentContext!: PipelineContext;
  private readonly currentBehaviors: IBehavior<
    OnDragMessage,
    DragPipelineResult,
    DragPipelineResult
  >[] = [];

  private currentHandler: IHandler<OnDragMessage, DragPipelineResult> =
    new StubDragHandler();

  private readonly stateStoreInstance = new DragStateStore();

  public static create(): DragPipelineFixture {
    const fixture = new DragPipelineFixture();

    beforeEach(() => {
      fixture.reset();
    });

    return fixture;
  }

  public get stateStore(): DragStateStore {
    return this.stateStoreInstance;
  }

  public get context(): PipelineContext {
    return this.currentContext;
  }

  public get pipeline(): Pipeline<
    OnDragMessage,
    DragPipelineResult,
    DragPipelineResult
  > {
    return this.currentPipeline;
  }

  public reset(): void {
    this.currentBehaviors.length = 0;
    this.currentHandler = new StubDragHandler();
    this.currentContext = new PipelineContext();

    this.resetStateStore();
    this.rebuildPipeline();
  }

  public withBehavior(
    behavior: IBehavior<OnDragMessage, DragPipelineResult, DragPipelineResult>,
  ): DragPipelineFixture {
    this.currentBehaviors.push(behavior);
    this.rebuildPipeline();
    return this;
  }

  public withBehaviors(
    behaviors: readonly IBehavior<
      OnDragMessage,
      DragPipelineResult,
      DragPipelineResult
    >[],
  ): DragPipelineFixture {
    for (const behavior of behaviors) {
      this.currentBehaviors.push(behavior);
    }

    this.rebuildPipeline();
    return this;
  }

  public withHandler(
    handler: IHandler<OnDragMessage, DragPipelineResult>,
  ): DragPipelineFixture {
    this.currentHandler = handler;
    this.rebuildPipeline();
    return this;
  }

  public createMessage(args?: {
    operation?: DragOperation;
    targetId?: string;
    x?: number;
    y?: number;
  }): OnDragMessage {
    return new OnDragMessage({
      operation: args?.operation ?? DragOperation.Move,
      targetId: args?.targetId ?? "shape-1",
      x: args?.x ?? 10,
      y: args?.y ?? 20,
    });
  }

  public async execute(
    message?: OnDragMessage,
  ): Promise<Result<DragPipelineResult, DragPipelineResult>> {
    return this.currentPipeline.execute(
      this.currentContext,
      message ?? this.createMessage(),
    );
  }

  public enableDragging(): DragPipelineFixture {
    this.stateStore.enableDragging();
    return this;
  }

  public disableDragging(): DragPipelineFixture {
    this.stateStore.disableDragging();
    return this;
  }

  public setVisible(targetId: string = "shape-1"): DragPipelineFixture {
    this.stateStore.setVisible(targetId);
    return this;
  }

  public setHidden(targetId: string = "shape-1"): DragPipelineFixture {
    this.stateStore.setHidden(targetId);
    return this;
  }

  public setBounds(
    bounds: IDragBounds,
    targetId: string = "shape-1",
  ): DragPipelineFixture {
    this.stateStore.setBounds(targetId, bounds);
    return this;
  }

  public clearBounds(targetId: string = "shape-1"): DragPipelineFixture {
    this.stateStore.clearBounds(targetId);
    return this;
  }

  public createHandlerSpy(): HandlerSpy {
    return new HandlerSpy();
  }

  public createPassingBehavior(name = "PassingBehavior"): TestPassingBehavior {
    return new TestPassingBehavior(name);
  }

  private rebuildPipeline(): void {
    this.currentPipeline = new Pipeline<
      OnDragMessage,
      DragPipelineResult,
      DragPipelineResult
    >(
      [...this.currentBehaviors],
      this.currentHandler,
    );
  }

  private resetStateStore(): void {
    this.stateStore.enableDragging();
    this.stateStore.clearBounds("shape-1");
    this.stateStore.setHidden("shape-1");
  }
}

// ============================================================================
// Test doubles
// ============================================================================

export class StubDragHandler
  implements IHandler<OnDragMessage, DragPipelineResult>
{
  public async handle(
    _ctx: IContextPipeline,
    _msg: OnDragMessage,
  ): Promise<DragPipelineResult> {
    return DragPipelineResult.ok("StubDragHandler");
  }
}

export class HandlerSpy
  implements IHandler<OnDragMessage, DragPipelineResult>
{
  private handled = false;
  private handledMessage: OnDragMessage | null = null;
  private handledContext: IContextPipeline | null = null;

  public wasHandled(): boolean {
    return this.handled;
  }

  public getMessage(): OnDragMessage | null {
    return this.handledMessage;
  }

  public getContext(): IContextPipeline | null {
    return this.handledContext;
  }

  public async handle(
    ctx: IContextPipeline,
    msg: OnDragMessage,
  ): Promise<DragPipelineResult> {
    this.handled = true;
    this.handledContext = ctx;
    this.handledMessage = msg;

    return DragPipelineResult.ok("HandlerSpy");
  }
}

export class TestPassingBehavior
  implements IBehavior<OnDragMessage, DragPipelineResult, DragPipelineResult>
{
  public constructor(
    private readonly behaviorName: string,
  ) {}

  public async execute(
    _ctx: IContextPipeline,
    _msg: OnDragMessage,
  ): Promise<Result<DragPipelineResult, DragPipelineResult>> {
    return Ok(
      DragPipelineResult.ok(this.behaviorName),
    );
  }
}

// ============================================================================
// Example usage
// ============================================================================
//
// import { describe, expect, it } from "vitest";
// import { VisibleBehavior } from "../../src/Pipeline/Behaviors/VisibleBehavior.js";
// import { DragPipelineFixture } from "../fixtures/DragPipelineFixture.js";
//
// describe("VisibleBehavior", () => {
//   const fixture = DragPipelineFixture.create();
//
//   it("should fail when target is not visible", async () => {
//     fixture.withBehavior(new VisibleBehavior(fixture.stateStore));
//
//     const result = await fixture.execute(
//       fixture.createMessage({ targetId: "shape-1" }),
//     );
//
//     expect(result.isErr()).toBe(true);
//     expect(result.unwrapErr().behavior).toBe("VisibleBehavior");
//   });
//
//   it("should allow handler execution when target is visible", async () => {
//     const handler = fixture.createHandlerSpy();
//
//     fixture
//       .setVisible("shape-1")
//       .withBehavior(new VisibleBehavior(fixture.stateStore))
//       .withHandler(handler);
//
//     const result = await fixture.execute(
//       fixture.createMessage({ targetId: "shape-1" }),
//     );
//
//     expect(result.isOk()).toBe(true);
//     expect(handler.wasHandled()).toBe(true);
//   });
// });