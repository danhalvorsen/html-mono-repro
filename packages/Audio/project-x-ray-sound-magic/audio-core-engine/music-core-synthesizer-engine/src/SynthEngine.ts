import type { ISynthEngine, IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import { SynthEngineDependencies } from "./contracts/SynthEngineDependencies.js";
import { MidiMessage } from "@monorepo/music-core-midi";

export class SynthEngine implements ISynthEngine {
  public constructor(
    private readonly dependencies: SynthEngineDependencies,
    private voiceDefinition: IVoiceDefinition
  ) { }

  public handle(message: MidiMessage): void {
    this.dependencies.router.route(message);
  }

  public setVoiceDefinition(definition: IVoiceDefinition): void {
    this.voiceDefinition = definition;
  }

  public getVoiceDefinition(): IVoiceDefinition {
    return this.voiceDefinition;
  }

  public panic(): void {
    this.dependencies.coordinator.releaseAll(0);
  }

  public dispose(): void {
    this.panic();
  }
}
