import { FilterUnit } from "./FilterUnit";


export class FilterBuilder {
    readonly #context: AudioContext;
    #type: BiquadFilterType = 'lowpass';
    #frequency = 1000;
    #q = 1;

    public constructor(context: AudioContext) {
        this.#context = context;
    }

    public type(value: BiquadFilterType): this {
        this.#type = value;
        return this;
    }

    public frequency(value: number): this {
        this.#frequency = value;
        return this;
    }

    public q(value: number): this {
        this.#q = value;
        return this;
    }

    public build(): FilterUnit {
        const filter = this.#context.createBiquadFilter();
        filter.type = this.#type;
        filter.frequency.value = this.#frequency;
        filter.Q.value = this.#q;

        return new FilterUnit(filter);
    }
}
