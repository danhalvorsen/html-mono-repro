// src/code.ts
// ======================================================
// Thin OOP abstraction over Vite plugins
// Self-contained, monorepo-safe, NodeNext-safe
// ======================================================

import { VitePWA } from "vite-plugin-pwa";

/* ---------------------------------------------
 * OPAQUE TYPES (no vite import leakage)
 * --------------------------------------------- */

export type VitePlugin = unknown;

/* ---------------------------------------------
 * FEATURE CONTRACT
 * --------------------------------------------- */

export interface ViteFeature {
  plugins(): readonly VitePlugin[];
}

/* ---------------------------------------------
 * SERVICE WORKER STRATEGY (domain model)
 * --------------------------------------------- */

export interface ServiceWorkerStrategy {
  readonly kind:
    | "network-first"
    | "cache-first"
    | "stale-while-revalidate";
}

/* ---------------------------------------------
 * STRATEGY BASE (protected constructor)
 * --------------------------------------------- */

abstract class BaseStrategy implements ServiceWorkerStrategy {
  abstract readonly kind:
    | "network-first"
    | "cache-first"
    | "stale-while-revalidate";

  protected constructor() {}
}

/* ---------------------------------------------
 * CONCRETE STRATEGIES
 * --------------------------------------------- */

export class NetworkFirstStrategy extends BaseStrategy {
  readonly kind = "network-first";
  static readonly Instance = new NetworkFirstStrategy();
}

export class CacheFirstStrategy extends BaseStrategy {
  readonly kind = "cache-first";
  static readonly Instance = new CacheFirstStrategy();
}

export class StaleWhileRevalidateStrategy extends BaseStrategy {
  readonly kind = "stale-while-revalidate";
  static readonly Instance = new StaleWhileRevalidateStrategy();
}

/* ---------------------------------------------
 * PWA FEATURE (Vite is contained here only)
 * --------------------------------------------- */

export class PwaFeature implements ViteFeature {
  constructor(private readonly strategy: ServiceWorkerStrategy) {}

  plugins(): readonly VitePlugin[] {
    return [
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.method === "GET",
              handler: this.resolveHandler()
            }
          ]
        }
      })
    ];
  }

  private resolveHandler():
    | "NetworkFirst"
    | "CacheFirst"
    | "StaleWhileRevalidate" {
    switch (this.strategy.kind) {
      case "network-first":
        return "NetworkFirst";
      case "cache-first":
        return "CacheFirst";
      case "stale-while-revalidate":
        return "StaleWhileRevalidate";
      default:
        // exhaustive safety
        return "NetworkFirst";
    }
  }
}

/* ---------------------------------------------
 * FEATURE AGGREGATION
 * --------------------------------------------- */

export function collectPlugins(
  features: readonly ViteFeature[]
): readonly VitePlugin[] {
  return features.flatMap(f => f.plugins());
}
