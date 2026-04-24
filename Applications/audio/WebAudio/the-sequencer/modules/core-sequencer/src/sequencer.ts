import { DomainContext } from "./infrastructure/DomainContext.js";
import { DomainError } from "./infrastructure/DomainError.js";
import { Entity } from "./infrastructure/Entity.js";
import { ErrorCode } from "./infrastructure/ErrorCode.js";
import { Guard } from "./infrastructure/Guard.js";
import type { IPatternSnapshot, Pattern } from "./pattern.js";
import type { SequencerDefinition } from "./SequencerDefinition.js";
import type { SequencerMode } from "./SequencerMode.js";

export interface ISequencerSnapshot<TValue> {
  readonly id: string;
  readonly name: string;
  readonly mode: string;
  readonly selectedPatternIndex: number;
  readonly patterns: readonly IPatternSnapshot<TValue>[];
}

export class Sequencer<TValue> extends Entity {
  public static readonly MaxPatternCount: number = 16;

  private readonly _name: string;
  private readonly _mode: SequencerMode;
  private readonly _patterns: readonly Pattern<TValue>[];
  private _selectedPatternIndex: number;

  public constructor(id: string, definition: SequencerDefinition<TValue>) {
    super(id);

    const normalizedDefinition = Guard.notNull(
      definition,
      DomainContext.SequencerDefinitionPatterns,
    );

    this._name = normalizedDefinition.name;
    this._mode = normalizedDefinition.mode;
    this._patterns = Object.freeze([...normalizedDefinition.patterns]);
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
    const pattern = this._patterns[this._selectedPatternIndex];
    if (pattern === undefined) {
      throw new DomainError(
        ErrorCode.OutOfRange,
        DomainContext.PatternIndex,
        "Selected pattern index is outside the sequencer pattern range.",
      );
    }

    return pattern;
  }

  public selectPattern(index: number): void {
    const normalizedIndex = Guard.nonNegative(
      Guard.integer(index, DomainContext.PatternIndex),
      DomainContext.PatternIndex,
    );

    if (this._patterns[normalizedIndex] === undefined) {
      throw new DomainError(
        ErrorCode.OutOfRange,
        DomainContext.PatternIndex,
        "Pattern index is outside the sequencer pattern range.",
      );
    }

    this._selectedPatternIndex = normalizedIndex;
  }

  public getPatterns(): readonly Pattern<TValue>[] {
    return this._patterns;
  }

  public toSnapshot(): ISequencerSnapshot<TValue> {
    return Object.freeze({
      id: this.id,
      name: this._name,
      mode: this._mode.toString(),
      selectedPatternIndex: this._selectedPatternIndex,
      patterns: Object.freeze(this._patterns.map((pattern) => pattern.toSnapshot())),
    });
  }
}