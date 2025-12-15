import { IReactiveController } from "./IReactiveController.js";
import { GlobalScheduler } from "./ScheduledJob.js";

// ============================================================================
// Base Reactive Host (non-DOM equivalent of ReactiveElement)
// ============================================================================

export abstract class BaseReactiveElement {
    private updatePending = false;
    private controllers: IReactiveController[] = [];

    addController(c: IReactiveController): void {
        this.controllers.push(c);
        c.hostConnected?.();
    }

    removeController(c: IReactiveController): void {
        const i = this.controllers.indexOf(c);
        if (i >= 0) {
            this.controllers.splice(i, 1);
            c.hostDisconnected?.();
        }
    }

    requestUpdate(): void {
        if (this.updatePending) return;
        this.updatePending = true;
        GlobalScheduler.schedule(() => this.performRender());
    }

    private performRender(): void {
        if (!this.updatePending) return;
        this.updatePending = false;

        // PRE-RENDER
        for (const c of this.controllers) c.hostUpdate?.();

        const result = this.render();

        // POST-RENDER
        for (const c of this.controllers) c.hostUpdated?.();

        this.processRender(result);
    }

    protected abstract render(): unknown;
    protected processRender(_result: unknown): void { }
}
