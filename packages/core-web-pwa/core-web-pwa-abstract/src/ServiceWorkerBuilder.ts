import { IServiceWorkerBuilder } from "./IServiceWorkerBuilder.js";
import { Types } from "./types.js";

//
// ────────────────────────────────────────────────
//   SERVICE WORKER BUILDER
// ────────────────────────────────────────────────
//

export class ServiceWorkerBuilder implements IServiceWorkerBuilder {
    private config: Types.PwaServiceWorkerConfig = {};

    enableOffline(): this {
        this.config.offline = true;
        return this;
    }

    enableCacheBust(): this {
        this.config.cacheBust = true;
        return this;
    }

    addRuntimeCaching(rule: Types.RuntimeCachingRule): this {
        if (!this.config.runtimeCaching) this.config.runtimeCaching = [];
        this.config.runtimeCaching.push(rule);
        return this;
    }

    build(): Types.PwaServiceWorkerConfig {
        return { ...this.config };
    }
}
