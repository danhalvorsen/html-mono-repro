import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import { IVoiceDefinitionProvider } from "./contracts/IVoiceDefinitionProvider.js";


export class StaticVoiceDefinitionProvider implements IVoiceDefinitionProvider {
  public constructor(private definition: IVoiceDefinition) { }

  public get(): IVoiceDefinition {
    return this.definition;
  }

  public set(definition: IVoiceDefinition): void {
    this.definition = definition;
  }
}
