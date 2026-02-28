export type VitePlugin = unknown;
export interface ViteFeature {
    plugins(): readonly VitePlugin[];
}
export interface ServiceWorkerStrategy {
    readonly kind: "network-first" | "cache-first" | "stale-while-revalidate";
}
declare abstract class BaseStrategy implements ServiceWorkerStrategy {
    abstract readonly kind: "network-first" | "cache-first" | "stale-while-revalidate";
    protected constructor();
}
export declare class NetworkFirstStrategy extends BaseStrategy {
    readonly kind = "network-first";
    static readonly Instance: NetworkFirstStrategy;
}
export declare class CacheFirstStrategy extends BaseStrategy {
    readonly kind = "cache-first";
    static readonly Instance: CacheFirstStrategy;
}
export declare class StaleWhileRevalidateStrategy extends BaseStrategy {
    readonly kind = "stale-while-revalidate";
    static readonly Instance: StaleWhileRevalidateStrategy;
}
export declare class PwaFeature implements ViteFeature {
    private readonly strategy;
    constructor(strategy: ServiceWorkerStrategy);
    plugins(): readonly VitePlugin[];
    private resolveHandler;
}
export declare function collectPlugins(features: readonly ViteFeature[]): readonly VitePlugin[];
export {};
//# sourceMappingURL=code.d.ts.map