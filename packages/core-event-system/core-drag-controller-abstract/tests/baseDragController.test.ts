import { describe, it, expect, vi } from "vitest";
import { BaseDragController } from "../src/controllers/baseDragController.js";
import { defineEventName, EventName } from "../src/types/common/event-name.js";
import { TimeStamp } from "../src/types/common/time-stamp.js";
import {
  ICommonEvent,
  ICommonEventData
} from "../src/types/common/common-event.js";
import {
  IDragStartData,
  IDragMoveData,
  IDragEndData,
  IDragEnterData,
  IDragLeaveData,
  IDragOverData,
  IDropData
} from "../src/types/drag/drag-contracts.js";

class TestDragController extends BaseDragController {
  // Expose emitters for testing
  triggerStart(evt: ICommonEvent<IDragStartData>) {
    this.emitStart(evt);
  }
  triggerMove(evt: ICommonEvent<IDragMoveData>) {
    this.emitMove(evt);
  }
  triggerEnd(evt: ICommonEvent<IDragEndData>) {
    this.emitEnd(evt);
  }
  triggerEnter(evt: ICommonEvent<IDragEnterData>) {
    this.emitEnter(evt);
  }
  triggerLeave(evt: ICommonEvent<IDragLeaveData>) {
    this.emitLeave(evt);
  }
  triggerOver(evt: ICommonEvent<IDragOverData>) {
    this.emitOver(evt);
  }
  triggerDrop(evt: ICommonEvent<IDropData>) {
    this.emitDrop(evt);
  }
  dispose(): void {
    // no-op for tests
  }
}

const makeEvent = <TData extends ICommonEventData>(
  eventName: string,
  data: Omit<TData, "event">
): ICommonEvent<TData> => {
  const name: EventName = defineEventName(eventName);
  return {
    name,
    timestamp: TimeStamp.now(),
    data: { ...(data as object), event: name } as TData,
    dispose: vi.fn()
  };
};

describe("BaseDragController", () => {
  it("emits start/move/end handlers", () => {
    const ctrl = new TestDragController();
    const onStart = vi.fn();
    const onMove = vi.fn();
    const onEnd = vi.fn();

    ctrl.onDragStart(onStart);
    ctrl.onDragMove(onMove);
    ctrl.onDragEnd(onEnd);

    ctrl.triggerStart(
      makeEvent<IDragStartData>("drag:start", { start: { x: 0, y: 0 } })
    );
    ctrl.triggerMove(
      makeEvent<IDragMoveData>("drag:move", {
        start: { x: 0, y: 0 },
        current: { x: 5, y: 5 },
        delta: { x: 5, y: 5 }
      })
    );
    ctrl.triggerEnd(
      makeEvent<IDragEndData>("drag:end", {
        start: { x: 0, y: 0 },
        end: { x: 5, y: 5 }
      })
    );

    expect(onStart).toHaveBeenCalledOnce();
    expect(onMove).toHaveBeenCalledOnce();
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it("emits enter/leave/over/drop handlers", () => {
    const ctrl = new TestDragController();
    const onEnter = vi.fn();
    const onLeave = vi.fn();
    const onOver = vi.fn();
    const onDrop = vi.fn();

    ctrl.onDragEnter(onEnter);
    ctrl.onDragLeave(onLeave);
    ctrl.onDragOver(onOver);
    ctrl.onDrop(onDrop);

    ctrl.triggerEnter(
      makeEvent<IDragEnterData>("drag:enter", {
        position: { x: 1, y: 1 },
        targetId: "t1"
      })
    );
    ctrl.triggerOver(
      makeEvent<IDragOverData>("drag:over", {
        position: { x: 2, y: 2 },
        delta: { x: 1, y: 1 },
        targetId: "t1"
      })
    );
    ctrl.triggerLeave(
      makeEvent<IDragLeaveData>("drag:leave", {
        position: { x: 3, y: 3 },
        targetId: "t1"
      })
    );
    ctrl.triggerDrop(
      makeEvent<IDropData>("drag:drop", {
        position: { x: 4, y: 4 },
        targetId: "t1"
      })
    );

    expect(onEnter).toHaveBeenCalledOnce();
    expect(onOver).toHaveBeenCalledOnce();
    expect(onLeave).toHaveBeenCalledOnce();
    expect(onDrop).toHaveBeenCalledOnce();
  });

  it("continues emitting even if a handler throws", () => {
    const ctrl = new TestDragController();
    const bad = vi.fn(() => {
      throw new Error("boom");
    });
    const good = vi.fn();

    ctrl.onDragMove(bad);
    ctrl.onDragMove(good);

    const evt = makeEvent<IDragMoveData>("drag:move", {
      start: { x: 0, y: 0 },
      current: { x: 1, y: 1 },
      delta: { x: 1, y: 1 }
    });

    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      ctrl.triggerMove(evt);
    } finally {
      errSpy.mockRestore();
    }

    expect(bad).toHaveBeenCalledOnce();
    expect(good).toHaveBeenCalledOnce();
  });
});
