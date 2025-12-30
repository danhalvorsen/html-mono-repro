export namespace Pwa {

  //
  // ────────────────────────────────────────────────
  //   ENUMS
  // ────────────────────────────────────────────────
  //
  export namespace Enums {
    export enum DisplayMode {
      Standalone = "standalone",
      Fullscreen = "fullscreen",
      MinimalUi = "minimal-ui",
      Browser = "browser"
    }

    export enum IconPurpose {
      Any = "any",
      Maskable = "maskable",
      Monochrome = "monochrome"
    }

    export enum CachingStrategy {
      CacheFirst = "CacheFirst",
      NetworkFirst = "NetworkFirst",
      StaleWhileRevalidate = "StaleWhileRevalidate"
    }
  }
}
