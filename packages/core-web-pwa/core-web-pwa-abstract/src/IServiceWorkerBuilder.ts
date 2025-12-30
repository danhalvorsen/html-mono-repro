import { Types } from "./types.js";

    export interface IServiceWorkerBuilder {
      enableOffline(): this;
      enableCacheBust(): this;
      addRuntimeCaching(rule: Types.RuntimeCachingRule): this;
      build(): Types.PwaServiceWorkerConfig;
    }