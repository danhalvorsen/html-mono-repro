import { Pwa } from "./code.js";
import { IServiceWorkerBuilder } from "./IServiceWorkerBuilder.js";
import { Types } from "./types.js";

  export namespace Builders {

    export interface IPwaManifestBuilder {
      setName(name: string): this;
      setShortName(shortName: string): this;
      setDescription(description: string): this;
      setThemeColor(color: string): this;
      setBackgroundColor(color: string): this;
      setDisplay(mode: Pwa.Enums.DisplayMode): this;
      setStartUrl(url: string): this;
      addIcon(icon: Types.PwaIcon): this;
      build(): Types.PwaManifest;
    }
    export interface IPwaBuilder {
      configureManifest(fn: (m: IPwaManifestBuilder) => void): this;
      configureServiceWorker(fn: (sw: IServiceWorkerBuilder) => void): this;
      build(): Types.PwaConfig;
    }
  }