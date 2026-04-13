import type { IFrameClock } from "../IFrameClock.js";
import type { IFrameRenderer } from "./IFrameRenderer.js";
import type { IRenderLoop } from "./IRenderLoop.js";
import type { IUpdatable } from "../IUpdatable.js";

export class RenderLoop implements IRenderLoop {
    private readonly updatables: IUpdatable[] = [];
    private animationFrameHandle: number | null = null;

    public constructor(
        private readonly renderer: IFrameRenderer,
        private readonly clock: IFrameClock
    ) { }

    public add(updatable: IUpdatable): void {
        this.updatables.push(updatable);
    }

    public start(): void {
        if (this.animationFrameHandle !== null) {
            return;
        }

        const tick = (timestamp: number): void => {
            this.clock.update(timestamp);
            const delta = this.clock.getDelta();
            const elapsed = this.clock.getElapsedTime();

            for (const updatable of this.updatables) {
                updatable.update(delta, elapsed);
            }

            this.renderer.renderFrame();
            this.animationFrameHandle = window.requestAnimationFrame(tick);
        };

        this.animationFrameHandle = window.requestAnimationFrame(tick);
    }

    public stop(): void {
        if (this.animationFrameHandle === null) {
            return;
        }

        window.cancelAnimationFrame(this.animationFrameHandle);
        this.animationFrameHandle = null;
    }
}
