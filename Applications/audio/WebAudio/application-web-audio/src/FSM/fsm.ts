// ============================================================================
// src/FSM/DragStateMachine.ts
// Replaces any usage of `fsm.handle(...)` with `fsm.dispatch(...)`
// ============================================================================

import {
  FsmBuilder,
  FsmEngine,
  type IInput,
  type IDispatchResult,
} from "@monorepo/core-fsm";

export class DragStateMachine {
  private readonly fsm: FsmEngine<
    DragStateMachine.State,
    DragStateMachine.Session,
    DragStateMachine.InputUnion,
    DragStateMachine.Output
  >;

  public constructor(isDraggingEnabled: boolean = true) {
    this.fsm = new FsmEngine<
      DragStateMachine.State,
      DragStateMachine.Session,
      DragStateMachine.InputUnion,
      DragStateMachine.Output
    >({
      definition: new DragStateMachine.Definition().build(),
      context: new DragStateMachine.Session(isDraggingEnabled),
    });
  }

  public getState(): DragStateMachine.State {
    return this.fsm.state;
  }

  public getSession(): DragStateMachine.Session {
    return this.fsm.context;
  }

  public async pointerDown(
    pointerId: number,
    x: number,
    y: number,
    targetId?: string,
  ): Promise<DragStateMachine.Result> {
    return this.execute(
      new DragStateMachine.PointerDown(pointerId, x, y, targetId),
    );
  }

  public async pointerMove(
    pointerId: number,
    x: number,
    y: number,
    targetId?: string,
  ): Promise<DragStateMachine.Result> {
    return this.execute(
      new DragStateMachine.PointerMove(pointerId, x, y, targetId),
    );
  }

  public async pointerUp(
    pointerId: number,
    x: number,
    y: number,
    targetId?: string,
  ): Promise<DragStateMachine.Result> {
    return this.execute(
      new DragStateMachine.PointerUp(pointerId, x, y, targetId),
    );
  }

  public async pointerCancel(
    pointerId: number,
  ): Promise<DragStateMachine.Result> {
    return this.execute(
      new DragStateMachine.PointerCancel(pointerId),
    );
  }

  public async reset(): Promise<DragStateMachine.Result> {
    return this.execute(
      new DragStateMachine.Reset(),
    );
  }

  private async execute(
    input: DragStateMachine.InputUnion,
  ): Promise<DragStateMachine.Result> {
    const transition = await this.fsm.dispatch(input);

    return new DragStateMachine.Result(
      transition.from,
      transition.to,
      transition.input,
      transition.context,
      transition.outputs,
      transition.transitionTaken,
    );
  }
}

export namespace DragStateMachine {
  export class States {
    public static readonly Idle = "idle";
    public static readonly Armed = "armed";
    public static readonly Dragging = "dragging";
    public static readonly Dropped = "dropped";
    public static readonly Cancelled = "cancelled";

    private constructor() {}
  }

  export type State =
    | typeof States.Idle
    | typeof States.Armed
    | typeof States.Dragging
    | typeof States.Dropped
    | typeof States.Cancelled;

  export class InputTypes {
    public static readonly PointerDown = "pointer.down";
    public static readonly PointerMove = "pointer.move";
    public static readonly PointerUp = "pointer.up";
    public static readonly PointerCancel = "pointer.cancel";
    public static readonly Reset = "drag.reset";

    private constructor() {}
  }

  export abstract class Input<TType extends string, TPayload>
    implements IInput<TType, TPayload>
  {
    public constructor(
      public readonly type: TType,
      public readonly payload: TPayload,
    ) {}
  }

  export class PointerPayload {
    public constructor(
      public readonly pointerId: number,
      public readonly x: number,
      public readonly y: number,
      public readonly targetId?: string,
    ) {}
  }

  export class PointerCancelPayload {
    public constructor(
      public readonly pointerId: number,
    ) {}
  }

  export class EmptyPayload {}

  export abstract class PointerInput<TType extends string>
    extends Input<TType, PointerPayload>
  {
    protected constructor(
      type: TType,
      pointerId: number,
      x: number,
      y: number,
      targetId?: string,
    ) {
      super(type, new PointerPayload(pointerId, x, y, targetId));
    }
  }

  export class PointerDown extends PointerInput<typeof InputTypes.PointerDown> {
    public constructor(
      pointerId: number,
      x: number,
      y: number,
      targetId?: string,
    ) {
      super(InputTypes.PointerDown, pointerId, x, y, targetId);
    }
  }

  export class PointerMove extends PointerInput<typeof InputTypes.PointerMove> {
    public constructor(
      pointerId: number,
      x: number,
      y: number,
      targetId?: string,
    ) {
      super(InputTypes.PointerMove, pointerId, x, y, targetId);
    }
  }

  export class PointerUp extends PointerInput<typeof InputTypes.PointerUp> {
    public constructor(
      pointerId: number,
      x: number,
      y: number,
      targetId?: string,
    ) {
      super(InputTypes.PointerUp, pointerId, x, y, targetId);
    }
  }

  export class PointerCancel extends Input<
    typeof InputTypes.PointerCancel,
    PointerCancelPayload
  > {
    public constructor(pointerId: number) {
      super(InputTypes.PointerCancel, new PointerCancelPayload(pointerId));
    }
  }

  export class Reset extends Input<typeof InputTypes.Reset, EmptyPayload> {
    public constructor() {
      super(InputTypes.Reset, new EmptyPayload());
    }
  }

  export type InputUnion =
    | PointerDown
    | PointerMove
    | PointerUp
    | PointerCancel
    | Reset;

  export interface Output {
    readonly name: string;
  }

  export abstract class OutputBase implements Output {
    public abstract readonly name: string;
  }

  export class ArmedOutput extends OutputBase {
    public readonly name = "drag.armed";
  }

  export class StartedOutput extends OutputBase {
    public readonly name = "drag.started";
  }

  export class MovedOutput extends OutputBase {
    public readonly name = "drag.moved";
  }

  export class DroppedOutput extends OutputBase {
    public readonly name = "drag.dropped";
  }

  export class CancelledOutput extends OutputBase {
    public readonly name = "drag.cancelled";
  }

  export class ResetOutput extends OutputBase {
    public readonly name = "drag.reset";
  }

  export class Session {
    public constructor(
      private readonly draggingEnabled: boolean,
      private readonly pointerId: number | null = null,
      private readonly targetId: string | null = null,
      private readonly startX: number = 0,
      private readonly startY: number = 0,
      private readonly currentX: number = 0,
      private readonly currentY: number = 0,
    ) {}

    public isDraggingEnabled(): boolean {
      return this.draggingEnabled;
    }

    public getPointerId(): number | null {
      return this.pointerId;
    }

    public getTargetId(): string | null {
      return this.targetId;
    }

    public getStartX(): number {
      return this.startX;
    }

    public getStartY(): number {
      return this.startY;
    }

    public getCurrentX(): number {
      return this.currentX;
    }

    public getCurrentY(): number {
      return this.currentY;
    }

    public canArm(): boolean {
      return this.draggingEnabled;
    }

    public matchesPointer(pointerId: number): boolean {
      return this.pointerId === pointerId;
    }

    public arm(input: PointerDown): Session {
      return new Session(
        this.draggingEnabled,
        input.payload.pointerId,
        input.payload.targetId ?? null,
        input.payload.x,
        input.payload.y,
        input.payload.x,
        input.payload.y,
      );
    }

    public move(input: PointerMove | PointerUp): Session {
      return new Session(
        this.draggingEnabled,
        this.pointerId,
        this.targetId,
        this.startX,
        this.startY,
        input.payload.x,
        input.payload.y,
      );
    }

    public cancel(): Session {
      return new Session(
        this.draggingEnabled,
        this.pointerId,
        this.targetId,
        this.startX,
        this.startY,
        this.currentX,
        this.currentY,
      );
    }

    public reset(): Session {
      return new Session(this.draggingEnabled);
    }
  }

  export class Result {
    public constructor(
      private readonly from: State,
      private readonly to: State,
      private readonly input: InputUnion,
      private readonly session: Session,
      private readonly outputs: readonly Output[],
      private readonly transitionTaken: boolean,
    ) {}

    public getFrom(): State {
      return this.from;
    }

    public getTo(): State {
      return this.to;
    }

    public getInput(): InputUnion {
      return this.input;
    }

    public getSession(): Session {
      return this.session;
    }

    public getOutputs(): readonly Output[] {
      return this.outputs;
    }

    public getOutput(): Output | null {
      return this.outputs[0] ?? null;
    }

    public wasTransitionTaken(): boolean {
      return this.transitionTaken;
    }
  }

  export class Definition {
    public build() {
      return new FsmBuilder<State, Session, InputUnion, Output>()
        .initial(States.Idle)

        .from(States.Idle)
        .on(InputTypes.PointerDown)
        .withGuard(({ context }) => context.canArm())
        .withAction(({ context, input }) => context.arm(input))
        .withOutput(() => new ArmedOutput())
        .to(States.Armed)

        .from(States.Armed)
        .on(InputTypes.PointerMove)
        .withGuard(({ context, input }) =>
          context.matchesPointer(input.payload.pointerId),
        )
        .withAction(({ context, input }) => context.move(input))
        .withOutput(() => new StartedOutput())
        .to(States.Dragging)

        .from(States.Armed)
        .on(InputTypes.PointerUp)
        .withGuard(({ context, input }) =>
          context.matchesPointer(input.payload.pointerId),
        )
        .withAction(({ context, input }) => context.move(input))
        .withOutput(() => new DroppedOutput())
        .to(States.Dropped)

        .from(States.Armed)
        .on(InputTypes.PointerCancel)
        .withGuard(({ context, input }) =>
          context.matchesPointer(input.payload.pointerId),
        )
        .withAction(({ context }) => context.cancel())
        .withOutput(() => new CancelledOutput())
        .to(States.Cancelled)

        .from(States.Dragging)
        .on(InputTypes.PointerMove)
        .withGuard(({ context, input }) =>
          context.matchesPointer(input.payload.pointerId),
        )
        .withAction(({ context, input }) => context.move(input))
        .withOutput(() => new MovedOutput())
        .to(States.Dragging)

        .from(States.Dragging)
        .on(InputTypes.PointerUp)
        .withGuard(({ context, input }) =>
          context.matchesPointer(input.payload.pointerId),
        )
        .withAction(({ context, input }) => context.move(input))
        .withOutput(() => new DroppedOutput())
        .to(States.Dropped)

        .from(States.Dragging)
        .on(InputTypes.PointerCancel)
        .withGuard(({ context, input }) =>
          context.matchesPointer(input.payload.pointerId),
        )
        .withAction(({ context }) => context.cancel())
        .withOutput(() => new CancelledOutput())
        .to(States.Cancelled)

        .from(States.Dropped)
        .on(InputTypes.Reset)
        .withAction(({ context }) => context.reset())
        .withOutput(() => new ResetOutput())
        .to(States.Idle)

        .from(States.Cancelled)
        .on(InputTypes.Reset)
        .withAction(({ context }) => context.reset())
        .withOutput(() => new ResetOutput())
        .to(States.Idle)

        .build();
    }
  }
}