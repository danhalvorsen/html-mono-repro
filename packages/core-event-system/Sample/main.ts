import { EventBus, AppDragMoveData, CommonEvent, TimeStamp } from "core-event-system/core-drag-controller-abstract/src";
import { DOMMouseController, DOMDragController } from "core-event-system/core-drag-controller-dom/src";
import { createAppEventBus, DRAG_MOVE_EVENT } from "core-event-system/original_code/code";

export class Application {

    private readonly mouse: DOMMouseController;
    private readonly drag: DOMDragController;
    private readonly bus: EventBus;

    constructor(canvas: HTMLElement) {

        this.bus = createAppEventBus();

        this.mouse = new DOMMouseController(canvas);

        this.drag = new DOMDragController(this.mouse);

        this.drag.onDragMove(async (evt) => {

            const appData: AppDragMoveData = {
                event: DRAG_MOVE_EVENT,
                x: evt.data.current.x,
                y: evt.data.current.y,
                objectId: "object-123"
            };

            const appEvent = new CommonEvent(
                DRAG_MOVE_EVENT,
                TimeStamp.now(),
                appData
            );

            await this.bus.dispatch(appEvent);
            appEvent.dispose();
        });
    }

    dispose() {
        this.mouse.dispose();
        this.drag.dispose();
        this.bus.dispose();
    }
}

const canvas = document.getElementById("myCanvas") as HTMLElement;
const app = new Application(canvas);

