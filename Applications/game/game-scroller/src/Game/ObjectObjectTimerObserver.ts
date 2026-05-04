import type { IGameObjectSubject } from "./GameObjectSubject";

export class TimeSchdulerObserver {
    #observers = new Set<IGameObjectSubject>();
    #animationFrameId: number | null = null;

    subscribe(observer: IGameObjectSubject): () => void {
        this.#observers.add(observer);
        return () => this.unsubscribe(observer);
    }

    unsubscribe(observer: IGameObjectSubject): boolean {
        return this.#observers.delete(observer);
    }

    notify(time: number): void {
        for (const observer of this.#observers) {
            observer.onTime(time);
        }
    }

    start(): void {
        if (this.#animationFrameId !== null) return;

        const tick = (time: number): void => {
            this.notify(time);
            this.#animationFrameId = globalThis.requestAnimationFrame(tick);
        };

        this.#animationFrameId = globalThis.requestAnimationFrame(tick);
    }

    stop(): void {
        if (this.#animationFrameId === null) return;

        globalThis.cancelAnimationFrame(this.#animationFrameId);
        this.#animationFrameId = null;
    }
}
