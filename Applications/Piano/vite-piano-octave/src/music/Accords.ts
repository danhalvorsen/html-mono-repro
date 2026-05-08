export type Accord = readonly string[];

export type AccordStep = {
  notes: Accord;
  waitBeforeMs?: number;
  holdMs?: number;
};

export type AccordPlayEvent = {
  notes: Accord;
  holdMs: number;
};

export class Accords {
  public constructor(
    private readonly progression: readonly AccordStep[],
    private readonly defaultStepWaitMs: number = 450,
    private readonly defaultHoldMs: number = 280
  ) {}

  public play(playAccord: (event: AccordPlayEvent) => void): void {
    let cursorMs = 0;

    for (const step of this.progression) {
      const waitBeforeMs = step.waitBeforeMs ?? this.defaultStepWaitMs;
      cursorMs += waitBeforeMs;

      const holdMs = step.holdMs ?? this.defaultHoldMs;
      const notes = step.notes;

      window.setTimeout(() => {
        playAccord({ notes, holdMs });
      }, cursorMs);
    }
  }
}
