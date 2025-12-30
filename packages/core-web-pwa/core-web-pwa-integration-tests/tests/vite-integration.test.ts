import { describe, it, expect } from "vitest";
import { defineConfig, type PluginOption } from "vite";

import {
  collectPlugins,
  PwaFeature,
  NetworkFirstStrategy
} from "@monorepo/core-web-pwa-impl";

describe("core-web-pwa-impl → Vite integration", () => {
  it("produces valid Vite plugins via OOP features", () => {
    const plugins = collectPlugins([
      new PwaFeature(NetworkFirstStrategy.Instance)
    ]) as PluginOption[];

    const config = defineConfig({ plugins });

    expect(Array.isArray(config.plugins)).toBe(true);
    expect(config.plugins!.length).toBeGreaterThan(0);

    // 🔑 FLATTEN — because some plugins return arrays
    const flat = config.plugins!.flat();

    for (const plugin of flat) {
      expect(plugin).toHaveProperty("name");
      expect(typeof (plugin as any).name).toBe("string");
    }
  });
});
