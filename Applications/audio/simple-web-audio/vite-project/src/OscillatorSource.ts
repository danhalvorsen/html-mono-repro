import type { IAudioOutput } from './IAudioOutput';


export class OscillatorSource implements IAudioOutput {
    readonly #oscillator: OscillatorNode;

    public constructor(oscillator: OscillatorNode) {
        this.#oscillator = oscillator;
    }

    public connect(input: AudioNode): void {
        this.#oscillator.connect(input);
    }

    public disconnect(): void {
        this.#oscillator.disconnect();
    }

    public start(): void {
        this.#oscillator.start();
    }

    public stop(): void {
        this.#oscillator.stop();
        this.disconnect();
    }
}

