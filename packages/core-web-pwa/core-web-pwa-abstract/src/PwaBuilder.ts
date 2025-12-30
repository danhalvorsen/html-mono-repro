import { Builders } from "./builders.js";
import { PwaManifestBuilder } from "./PwaManifestBuilder.js";
import { ServiceWorkerBuilder } from "./ServiceWorkerBuilder.js";
import { IServiceWorkerBuilder } from "./IServiceWorkerBuilder.js";
import { Types } from "./types.js";

//
// ────────────────────────────────────────────────
//   ROOT PWA BUILDER
// ────────────────────────────────────────────────
//

export class PwaBuilder implements Builders.IPwaBuilder {
    private manifestBuilder = new PwaManifestBuilder();
    private serviceWorkerBuilder = new ServiceWorkerBuilder();

    configureManifest(fn: (m: Builders.IPwaManifestBuilder) => void): this {
        fn(this.manifestBuilder);
        return this;
    }

    configureServiceWorker(fn: (sw: IServiceWorkerBuilder) => void): this {
        fn(this.serviceWorkerBuilder);
        return this;
    }

    build(): Types.PwaConfig {
        return {
            manifest: this.manifestBuilder.build(),
            serviceWorker: this.serviceWorkerBuilder.build()
        };
    }
}
