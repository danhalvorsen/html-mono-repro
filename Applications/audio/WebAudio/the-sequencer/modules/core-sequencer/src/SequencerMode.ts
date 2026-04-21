import { DomainContext } from "./infrastructure/DomainContext.js";
import { ValueObject } from "./infrastructure/ValueObject.js";
import { Guard } from "./infrastructure/Guard.js";

export class SequencerModeName extends ValueObject {
  public static readonly Mono: SequencerModeName = new SequencerModeName("mono");
  public static readonly Poly: SequencerModeName = new SequencerModeName("poly");
  public static readonly Chord: SequencerModeName = new SequencerModeName("chord");
  public static readonly Multitrack: SequencerModeName = new SequencerModeName("multitrack");
  public static readonly Stochastic: SequencerModeName = new SequencerModeName("stochastic");
  public static readonly Matriceal: SequencerModeName = new SequencerModeName("matriceal");

  private readonly _value: string;

  private constructor(value: string) {
    super();

    this._value = Guard.notBlank(value, DomainContext.SequencerModeName);
  }

  public get value(): string {
    return this._value;
  }

  public override equals(other: ValueObject): boolean {
    return other instanceof SequencerModeName && other._value === this._value;
  }

  public override toString(): string {
    return this._value;
  }
}

export class SequencerMode extends ValueObject {
  public static readonly Mono: SequencerMode =
    new SequencerMode(SequencerModeName.Mono, 1);

  public static readonly Poly: SequencerMode =
    new SequencerMode(SequencerModeName.Poly, 1);

  public static readonly Chord: SequencerMode =
    new SequencerMode(SequencerModeName.Chord, 1);

  public static readonly Multitrack: SequencerMode =
    new SequencerMode(SequencerModeName.Multitrack, 8);

  public static readonly Stochastic: SequencerMode =
    new SequencerMode(SequencerModeName.Stochastic, 1);

  public static readonly Matriceal: SequencerMode =
    new SequencerMode(SequencerModeName.Matriceal, 4);

  private readonly _name: SequencerModeName;
  private readonly _maxTrackCount: number;

  private constructor(name: SequencerModeName, maxTrackCount: number) {
    super();

    this._name = Guard.notNull(name, DomainContext.SequencerModeName);
    this._maxTrackCount = Guard.positiveInteger(
      maxTrackCount,
      DomainContext.SequencerModeMaxTrackCount,
    );
  }

  public get name(): SequencerModeName {
    return this._name;
  }

  public get maxTrackCount(): number {
    return this._maxTrackCount;
  }

  public override equals(other: ValueObject): boolean {
    return (
      other instanceof SequencerMode &&
      other._name.equals(this._name) &&
      other._maxTrackCount === this._maxTrackCount
    );
  }

  public override toString(): string {
    return this._name.toString();
  }
}
