import type { ISpecification } from "@monorepo/core-specifications";

import {
  VoiceDefinitionSpecification,
  VoiceGateOffRequestSpecification,
  VoiceGateOnRequestSpecification,
  VoiceStateKind,
  type IVoice,
  type IVoiceDefinition,
  type IVoiceDefinitionValidator,
  type IVoiceFactory,
  type IVoiceGateOffRequest,
  type IVoiceGateOnRequest,
  type IVoiceStateSnapshot,
  type VoiceFrequencyHzValue,
  type VoiceSecondsValue,
  type VoiceVelocityValue,
} from "@monorepo/music-core-synthesizer-voice-contracts";

export class VoiceDefinitionValidator implements IVoiceDefinitionValidator {
  public constructor(
    private readonly specification: ISpecification<IVoiceDefinition>,
  ) {}

  public static createDefault(): VoiceDefinitionValidator {
    return new VoiceDefinitionValidator(VoiceDefinitionSpecification.valid());
  }

  public validate(definition: IVoiceDefinition): void {
    if (!this.specification.isSatisfiedBy(definition)) {
      throw new Error(`Voice definition is invalid for id '${definition.id}'.`);
    }
  }
}

export class VoiceFactory implements IVoiceFactory {
  public constructor(
    private readonly definitionValidator: IVoiceDefinitionValidator,
    private readonly gateOnRequestSpecification: ISpecification<IVoiceGateOnRequest>,
    private readonly gateOffRequestSpecification: ISpecification<IVoiceGateOffRequest>,
  ) {}

  public static createDefault(): VoiceFactory {
    return new VoiceFactory(
      VoiceDefinitionValidator.createDefault(),
      VoiceGateOnRequestSpecification.valid(),
      VoiceGateOffRequestSpecification.valid(),
    );
  }

  public create(definition: IVoiceDefinition): IVoice {
    this.definitionValidator.validate(definition);

    return new Voice(
      definition,
      this.gateOnRequestSpecification,
      this.gateOffRequestSpecification,
    );
  }
}

class Voice implements IVoice {
  private state: VoiceStateKind = VoiceStateKind.Idle;
  private startedAtSeconds: VoiceSecondsValue | null = null;
  private releasedAtSeconds: VoiceSecondsValue | null = null;
  private frequencyHz: VoiceFrequencyHzValue | null = null;
  private velocity: VoiceVelocityValue = 0;

  public constructor(
    public readonly definition: IVoiceDefinition,
    private readonly gateOnRequestSpecification: ISpecification<IVoiceGateOnRequest>,
    private readonly gateOffRequestSpecification: ISpecification<IVoiceGateOffRequest>,
  ) {}

  public gateOn(request: IVoiceGateOnRequest): void {
    this.throwIfDisposed();

    if (!this.gateOnRequestSpecification.isSatisfiedBy(request)) {
      throw new Error("Voice gate-on request is invalid.");
    }

    if (this.state === VoiceStateKind.Active) {
      throw new Error("Voice gate is already active.");
    }

    this.state = VoiceStateKind.Active;
    this.startedAtSeconds = request.timeSeconds;
    this.releasedAtSeconds = null;
    this.frequencyHz = request.frequencyHz;
    this.velocity = request.velocity;
  }

  public gateOff(request: IVoiceGateOffRequest): void {
    this.throwIfDisposed();

    if (!this.gateOffRequestSpecification.isSatisfiedBy(request)) {
      throw new Error("Voice gate-off request is invalid.");
    }

    if (this.state !== VoiceStateKind.Active) {
      return;
    }

    if (this.startedAtSeconds !== null && request.timeSeconds < this.startedAtSeconds) {
      throw new Error("Voice gate-off time cannot be before gate-on time.");
    }

    this.state = VoiceStateKind.Released;
    this.releasedAtSeconds = request.timeSeconds;
    this.velocity = 0;
  }

  public snapshot(): IVoiceStateSnapshot {
    return {
      definition: this.definition,
      state: this.state,
      startedAtSeconds: this.startedAtSeconds,
      releasedAtSeconds: this.releasedAtSeconds,
      frequencyHz: this.frequencyHz,
      velocity: this.velocity,
    };
  }

  public reset(): void {
    this.throwIfDisposed();

    this.state = VoiceStateKind.Idle;
    this.startedAtSeconds = null;
    this.releasedAtSeconds = null;
    this.frequencyHz = null;
    this.velocity = 0;
  }

  public dispose(): void {
    this.state = VoiceStateKind.Disposed;
    this.startedAtSeconds = null;
    this.releasedAtSeconds = null;
    this.frequencyHz = null;
    this.velocity = 0;
  }

  private throwIfDisposed(): void {
    if (this.state === VoiceStateKind.Disposed) {
      throw new Error("Voice has already been disposed.");
    }
  }
}
