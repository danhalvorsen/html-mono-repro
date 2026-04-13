import type { IUpdatable } from "../IUpdatable.js";

export interface IRenderLoop {
    start(): void;
    stop(): void;
    add(updatable: IUpdatable): void;
}
