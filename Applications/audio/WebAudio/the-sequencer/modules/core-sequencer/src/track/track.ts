
// ============================
// Track (Aggregate Root)
// ============================
// Track (Aggregate Root)
// ============================

import { Entity } from "../infrastructure/Entity.js";
import { Guard } from "../infrastructure/Guard.js";
import { TrackStep } from "./TrackStep.js";
import { TrackType } from "./TrackType.js";

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
    capacity: number = Track.MaxCapacity
  ) {
    super(id);

    Guard.notBlank(name, "Track name");
    Guard.integer(capacity, "Track capacity");
    Guard.nonNegative(capacity, "Track capacity");
    Guard.integer(sequenceLength, "Track sequence length");
    Guard.nonNegative(sequenceLength, "Track sequence length");

    if (capacity === 0) {
      throw new Error("Track capacity must be greater than zero.");
    }

    if (capacity > Track.MaxCapacity) {
      throw new Error("Track capacity cannot exceed 128.");
    }

    if (sequenceLength > capacity) {
      throw new Error("Sequence length cannot exceed capacity.");
    }

    this._name = name;
    this._type = type;
    this._capacity = capacity;
    this._sequenceLength = sequenceLength;
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
    Guard.integer(length, "Sequence length");
    Guard.nonNegative(length, "Sequence length");

    if (length > this._capacity) {
      throw new Error("Sequence length cannot exceed capacity.");
    }

    this._sequenceLength = length;
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
    return this._steps[index];
  }

  public getActiveSteps(): readonly TrackStep<TValue>[] {
    return this._steps.slice(0, this._sequenceLength);
  }

  public clear(): void {
    for (let i = 0; i < this._sequenceLength; i++) {
      this._steps[i].clear();
    }
  }

  // ============================
  // Internal
  // ============================
  private createSteps(capacity: number): TrackStep<TValue>[] {
    const steps: TrackStep<TValue>[] = [];
    for (let i = 0; i < capacity; i++) {
      steps.push(new TrackStep<TValue>(i));
    }
    return steps;
  }

  private clearOutsideSequence(): void {
    for (let i = this._sequenceLength; i < this._steps.length; i++) {
      this._steps[i].clear();
    }
  }

  private ensureIndex(index: number): void {
    Guard.integer(index, "Step index");
    Guard.nonNegative(index, "Step index");

    if (index >= this._sequenceLength) {
      throw new Error("Index outside active sequence.");
    }
  }
}
