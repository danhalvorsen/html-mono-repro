import type { IAudioOutput } from './IAudioOutput';
import type { OscillatorSource } from "./OscillatorSource";


export class BuiltAudioGraph {
    readonly #source: OscillatorSource;
    readonly #units: IAudioOutput[];

    public constructor(source: OscillatorSource, units: IAudioOutput[]) {
        this.#source = source;
        this.#units = units;
    }

    public start(): void {
        this.#source.start();
    }

    public stop(): void {
        this.#source.stop();

        for (const unit of this.#units) {
            unit.disconnect();
        }
    }
}

