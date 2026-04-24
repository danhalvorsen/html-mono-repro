import { DomainContext } from "../infrastructure/DomainContext.js";
import { DomainError } from "../infrastructure/DomainError.js";
import { Entity } from "../infrastructure/Entity.js";
import { ErrorCode } from "../infrastructure/ErrorCode.js";
import { Guard } from "../infrastructure/Guard.js";
import { TrackStep, type ITrackStepSnapshot } from "./TrackStep.js";
import { TrackType } from "./TrackType.js";

export interface ITrackSnapshot<TValue> {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly capacity: number;
  readonly sequenceLength: number;
  readonly steps: readonly ITrackStepSnapshot<TValue>[];
}

export class Track<TValue> extends Entity {
  public static readonly MaxCapacity = 128;

  private readonly _name: string;
  private readonly _type: TrackType;
  private readonly _capacity: number;
  private readonly _steps: TrackStep<TValue>[];

  private _sequenceLength: number;

  public constructor(
    id: string,
    name: string,
    type: TrackType,
    sequenceLength: number,
    capacity: number = Track.MaxCapacity,
  ) {
    super(id);

    this._name = Guard.notBlank(name, DomainContext.TrackName);
    this._type = Guard.notNull(type, DomainContext.TrackType);
    this._capacity = Guard.positiveInteger(capacity, DomainContext.TrackCapacity);
    this._sequenceLength = Guard.nonNegative(
      Guard.integer(sequenceLength, DomainContext.TrackSequenceLength),
      DomainContext.TrackSequenceLength,
    );

    if (this._capacity > Track.MaxCapacity) {
      throw new DomainError(
        ErrorCode.OutOfRange,
        DomainContext.TrackCapacity,
        `Track capacity cannot exceed ${Track.MaxCapacity}.`,
      );
    }

    if (this._sequenceLength > this._capacity) {
      throw new DomainError(
        ErrorCode.OutOfRange,
        DomainContext.TrackSequenceLength,
        "Sequence length cannot exceed capacity.",
      );
    }

    this._steps = this.createSteps(capacity);
  }

  public get name(): string {
    return this._name;
  }

  public get type(): TrackType {
    return this._type;
  }

  public get capacity(): number {
    return this._capacity;
  }

  public get sequenceLength(): number {
    return this._sequenceLength;
  }

  public setSequenceLength(length: number): void {
    const normalizedLength = Guard.nonNegative(
      Guard.integer(length, DomainContext.TrackSequenceLength),
      DomainContext.TrackSequenceLength,
    );

    if (normalizedLength > this._capacity) {
      throw new DomainError(
        ErrorCode.OutOfRange,
        DomainContext.TrackSequenceLength,
        "Sequence length cannot exceed capacity.",
      );
    }

    this._sequenceLength = normalizedLength;
    this.clearOutsideSequence();
  }

  public activateStep(index: number, value: TValue | null = null): void {
    this.getStep(index).activate(value);
  }

  public deactivateStep(index: number): void {
    this.getStep(index).deactivate();
  }

  public setStepValue(index: number, value: TValue | null): void {
    this.getStep(index).setValue(value);
  }

  public getStep(index: number): TrackStep<TValue> {
    this.ensureIndex(index);

    const step = this._steps[index];
    if (step === undefined) {
      throw new DomainError(
        ErrorCode.OutOfRange,
        DomainContext.TrackStepIndex,
        "Step index is outside the allocated track step range.",
      );
    }

    return step;
  }

  public getSequenceSnapshots(): readonly ITrackStepSnapshot<TValue>[] {
    return Object.freeze(
      this._steps.slice(0, this._sequenceLength).map((step) => step.toSnapshot()),
    );
  }

  public clear(): void {
    for (let i = 0; i < this._sequenceLength; i++) {
      const step = this._steps[i];
      if (step !== undefined) {
        step.clear();
      }
    }
  }

  public toSnapshot(): ITrackSnapshot<TValue> {
    return Object.freeze({
      id: this.id,
      name: this._name,
      type: this._type.value,
      capacity: this._capacity,
      sequenceLength: this._sequenceLength,
      steps: this.getSequenceSnapshots(),
    });
  }

  private createSteps(capacity: number): TrackStep<TValue>[] {
    const steps: TrackStep<TValue>[] = [];
    for (let i = 0; i < capacity; i++) {
      steps.push(new TrackStep<TValue>(i));
    }
    return steps;
  }

  private clearOutsideSequence(): void {
    for (let i = this._sequenceLength; i < this._steps.length; i++) {
      const step = this._steps[i];
      if (step !== undefined) {
        step.clear();
      }
    }
  }

  private ensureIndex(index: number): void {
    const normalizedIndex = Guard.nonNegative(
      Guard.integer(index, DomainContext.TrackStepIndex),
      DomainContext.TrackStepIndex,
    );

    if (normalizedIndex >= this._sequenceLength) {
      throw new DomainError(
        ErrorCode.OutOfRange,
        DomainContext.TrackStepIndex,
        "Index is outside the active sequence range.",
      );
    }
  }
}
