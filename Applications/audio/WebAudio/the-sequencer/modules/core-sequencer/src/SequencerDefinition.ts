import { Guard } from "./infrastructure/Guard.js";
import { ValueObject } from "./infrastructure/ValueObject.js";
import type { Pattern } from "./pattern.js";
import { Sequencer } from "./sequencer.js";
import type { SequencerMode } from "./SequencerMode.js";

export class SequencerDefinition<TValue> extends ValueObject {
  private readonly _name: string;
  private readonly _mode: SequencerMode;
  private readonly _patterns: readonly Pattern<TValue>[];

  public constructor(
    name: string,
    mode: SequencerMode,
    patterns: readonly Pattern<TValue>[],
  ) {
    super();

    Guard.notBlank(name, "SequencerDefinition.Name");
    Guard.notNull(mode, "SequencerDefinition.Mode");
    Guard.notNull(patterns, "SequencerDefinition.Patterns");

    if (patterns.length === 0) {
      throw new Error("SequencerDefinition.Patterns must contain at least one pattern.");
    }

    if (patterns.length > Sequencer.MaxPatternCount) {
      throw new Error(
        `SequencerDefinition.Patterns cannot exceed ${Sequencer.MaxPatternCount}.`,
      );
    }

    this._name = name;
    this._mode = mode;
    this._patterns = [...patterns];
  }

  public get name(): string {
    return this._name;
  }

  public get mode(): SequencerMode {
    return this._mode;
  }

  public get patterns(): readonly Pattern<TValue>[] {
    return [...this._patterns];
  }

  public override equals(other: ValueObject): boolean {
    if (!(other instanceof SequencerDefinition)) {
      return false;
    }

    return (
      other._name === this._name &&
      other._mode.equals(this._mode) &&
      other._patterns === this._patterns
    );
  }
}