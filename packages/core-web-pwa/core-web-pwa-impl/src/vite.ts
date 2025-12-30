import type { Plugin } from "vite";
import { Types, Pwa } from "@monorepo/core-web-pwa-abstract";

export interface VitePwaOptions {
  config: Types.PwaConfig;
  manifestFileName?: string;
  serviceWorkerFileName?: string;
}

export class CoreWebPwaPlugin implements Plugin {
  name = "core-web-pwa";

  private readonly manifestFile: string;
  private readonly swFile: string;

  constructor(private readonly pwaOptions: VitePwaOptions) {
    this.manifestFile = pwaOptions.manifestFileName ?? "manifest.webmanifest";
    this.swFile = pwaOptions.serviceWorkerFileName ?? "service-worker.js";
  }

  transformIndexHtml(html: string) {
    return html.replace(
      "</head>",
      `
<link rel="manifest" href="/${this.manifestFile}">
<script>
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/${this.swFile}");
  });
}
</script>
</head>`
    );
  }

  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: this.manifestFile,
      source: JSON.stringify(this.pwaOptions.config.manifest, null, 2)
    });

    this.emitFile({
      type: "asset",
      fileName: this.swFile,
      source: this.buildServiceWorkerSource()
    });
  }

  private buildServiceWorkerSource(): string {
    const sw = this.pwaOptions.config.serviceWorker ?? {};
    const parts: string[] = [];

    if (sw.offline) {
      parts.push(`
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
`);
    }

    if (sw.runtimeCaching?.length) {
      parts.push(this.buildFetchHandler(sw.runtimeCaching));
    }

    parts.push(this.buildStrategies());

    return parts.join("\n");
  }

  private buildFetchHandler(
    rules: Types.RuntimeCachingRule[]
  ): string {
    const conditions = rules
      .map(rule => `
if (${rule.urlPattern}.test(url)) {
  return ${this.strategyToFn(rule.strategy)}(request);
}`)
      .join(" else ");

    return `
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = request.url;

  event.respondWith((async () => {
    ${conditions}
    return fetch(request);
  })());
});
`;
  }

  private strategyToFn(
    strategy: Pwa.Enums.CachingStrategy
  ): string {
    switch (strategy) {
      case Pwa.Enums.CachingStrategy.CacheFirst:
        return "cacheFirst";
      case Pwa.Enums.CachingStrategy.NetworkFirst:
        return "networkFirst";
      case Pwa.Enums.CachingStrategy.StaleWhileRevalidate:
        return "staleWhileRevalidate";
      default:
        return "networkFirst";
    }
  }

  private buildStrategies(): string {
    return `
const CACHE_NAME = "pwa-cache";

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    return cache.match(request);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const network = fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  });

  return cached || network;
}
`;
  }
}
