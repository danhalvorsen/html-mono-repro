import { Pwa } from "./code.js";

export namespace Types {

    export interface PwaIcon {
      src: string;
      sizes: string;
      type: string;
      purpose?: Pwa.Enums.IconPurpose;
    }

    export interface PwaManifest {
      name?: string;
      short_name?: string;
      description?: string;
      theme_color?: string;
      background_color?: string;
      display?: Pwa.Enums.DisplayMode;
      start_url?: string;
      icons?: PwaIcon[];
    }

    export interface RuntimeCachingRule {
      urlPattern: RegExp;
      strategy: Pwa.Enums.CachingStrategy;
    }

    export interface PwaServiceWorkerConfig {
      offline?: boolean;
      cacheBust?: boolean;
      runtimeCaching?: RuntimeCachingRule[];
    }

    export interface PwaConfig {
      manifest: PwaManifest;
      serviceWorker: PwaServiceWorkerConfig;
    }
  }
