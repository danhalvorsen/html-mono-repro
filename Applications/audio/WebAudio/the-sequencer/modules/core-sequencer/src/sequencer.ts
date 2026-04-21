import { Entity } from "./infrastructure/Entity.js";
import { Guard } from "./infrastructure/Guard.js";
import type { Pattern } from "./pattern.js";
import type { SequencerDefinition } from "./SequencerDefinition.js";
import type { SequencerMode } from "./SequencerMode.js";

export class Sequencer<TValue> extends Entity {
  public static readonly MaxPatternCount: number = 16;

  private readonly _name: string;
  private readonly _mode: SequencerMode;
  private readonly _patterns: Pattern<TValue>[];
  private _selectedPatternIndex: number;

  public constructor(id: string, definition: SequencerDefinition<TValue>) {
    super(id);

    Guard.notNull(definition, "Sequencer.Definition");

    this._name = definition.name;
    this._mode = definition.mode;
    this._patterns = [...definition.patterns];
    this._selectedPatternIndex = 0;
  }

  public get name(): string {
    return this._name;
  }

  public get mode(): SequencerMode {
    return this._mode;
  }

  public get selectedPatternIndex(): number {
    return this._selectedPatternIndex;
  }

  public getSelectedPattern(): Pattern<TValue> {
    return this._patterns[this._selectedPatternIndex];
  }
}