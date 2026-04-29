import { FsmBuilder, type IInput } from "@monorepo/core-fsm";
import type { ReactiveController, ReactiveControllerHost } from "lit";

const NODE_DRAG_OWNER_ID = "node-drag";
const CONNECTION_POINT_DRAG_OWNER_ID = "connection-point-drag";

type InteractionState = "idle" | "dragging-node" | "dragging-connection";

interface InteractionContext {
  readonly activeDragOwnerId: string | undefined;
}

interface StartNodeDragInput extends IInput<"start-node-drag", { readonly ownerId: string }> {
  readonly type: "start-node-drag";
  readonly payload: { readonly ownerId: string };
}

interface StartConnectionDragInput extends IInput<"start-connection-drag", { readonly ownerId: string }> {
  readonly type: "start-connection-drag";
  readonly payload: { readonly ownerId: string };
}

interface StopDragInput extends IInput<"stop-drag", { readonly ownerId: string }> {
  readonly type: "stop-drag";
  readonly payload: { readonly ownerId: string };
}

type InteractionInput = StartNodeDragInput | StartConnectionDragInput | StopDragInput;

export class GraphInteractionStateController implements ReactiveController {
  private readonly definition = new FsmBuilder<
    InteractionState,
    InteractionContext,
    InteractionInput,
    never
  >()
    .initial("idle")
    .from("idle")
    .on("start-node-drag")
    .withGuard(({ context }) => context.activeDragOwnerId === undefined)
    .withAction(({ input }) => ({ activeDragOwnerId: input.payload.ownerId }))
    .to("dragging-node")
    .from("idle")
    .on("start-connection-drag")
    .withGuard(({ context }) => context.activeDragOwnerId === undefined)
    .withAction(({ input }) => ({ activeDragOwnerId: input.payload.ownerId }))
    .to("dragging-connection")
    .from("dragging-node")
    .on("start-node-drag")
    .withGuard(({ context, input }) => context.activeDragOwnerId === input.payload.ownerId)
    .withAction(({ context }) => context)
    .to("dragging-node")
    .from("dragging-connection")
    .on("start-connection-drag")
    .withGuard(({ context, input }) => context.activeDragOwnerId === input.payload.ownerId)
    .withAction(({ context }) => context)
    .to("dragging-connection")
    .from("dragging-node")
    .on("stop-drag")
    .withGuard(({ context, input }) => context.activeDragOwnerId === input.payload.ownerId)
    .withAction(() => ({ activeDragOwnerId: undefined }))
    .to("idle")
    .from("dragging-connection")
    .on("stop-drag")
    .withGuard(({ context, input }) => context.activeDragOwnerId === input.payload.ownerId)
    .withAction(() => ({ activeDragOwnerId: undefined }))
    .to("idle")
    .build();

  private state: InteractionState = this.definition.initial;
  private context: InteractionContext = {
    activeDragOwnerId: undefined,
  };

  constructor(private readonly host: ReactiveControllerHost) {
    this.host.addController(this);
  }

  hostConnected(): void {}

  hostDisconnected(): void {
    this.state = this.definition.initial;
    this.context = { activeDragOwnerId: undefined };
  }

  tryAcquireDrag(ownerId: string): boolean {
    if (ownerId === NODE_DRAG_OWNER_ID) {
      return this.dispatch({
        type: "start-node-drag",
        payload: { ownerId },
      });
    }

    if (ownerId === CONNECTION_POINT_DRAG_OWNER_ID) {
      return this.dispatch({
        type: "start-connection-drag",
        payload: { ownerId },
      });
    }

    return false;
  }

  releaseDrag(ownerId: string): void {
    this.dispatch({
      type: "stop-drag",
      payload: { ownerId },
    });
  }

  private dispatch(input: InteractionInput): boolean {
    const transition = this.definition.getTransition(this.state, input.type);

    if (transition === undefined) {
      return false;
    }

    if (transition.guard !== undefined) {
      const guardResult = transition.guard({
        context: this.context,
        input,
      });

      if (this.isPromiseLike(guardResult)) {
        throw new Error("GraphInteractionStateController guard must be synchronous.");
      }

      if (!guardResult) {
        return false;
      }
    }

    if (transition.action !== undefined) {
      const nextContext = transition.action({
        context: this.context,
        input,
      });

      if (this.isPromiseLike(nextContext)) {
        throw new Error("GraphInteractionStateController action must be synchronous.");
      }

      this.context = nextContext;
    }

    this.state = transition.to;
    return true;
  }

  private isPromiseLike<T>(value: T | Promise<T>): value is Promise<T> {
    return typeof value === "object"
      && value !== null
      && "then" in value
      && typeof (value as { then?: unknown }).then === "function";
  }
}
