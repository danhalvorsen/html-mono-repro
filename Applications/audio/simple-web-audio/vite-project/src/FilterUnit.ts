import type { IAudioUnit } from "./IAudioUnit";


export class FilterUnit implements IAudioUnit {
    readonly #filter: BiquadFilterNode;

    public constructor(filter: BiquadFilterNode) {
        this.#filter = filter;
    }

    public get input(): AudioNode {
        return this.#filter;
    }

    public connect(input: AudioNode): void {
        this.#filter.connect(input);
    }

    public disconnect(): void {
        this.#filter.disconnect();
    }
}
