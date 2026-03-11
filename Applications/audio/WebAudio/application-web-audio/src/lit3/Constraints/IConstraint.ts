// Applications/audio/WebAudio/application-web-audio/src/lit3/Constraints/IConstraint.ts

export interface IConstraint<TTarget> {
  apply(target: TTarget): void;
}