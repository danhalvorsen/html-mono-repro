export interface ITimeObserver {
    onTime(time: number): void;
}

export class TimeSchdulerObserver {
    #observers = new Set<ITimeObserver>();
    #animationFrameId: number | null = null;

    subscribe(observer: ITimeObserver): () => void {
        this.#observers.add(observer);
        return () => this.unsubscribe(observer);
    }

    unsubscribe(observer: ITimeObserver): boolean {
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
