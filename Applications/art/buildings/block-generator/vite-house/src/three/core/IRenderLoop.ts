import type { IUpdatable } from "./IUpdatable";

export interface IRenderLoop {
    start(): void;
    stop(): void;
    add(updatable: IUpdatable): void;
}
