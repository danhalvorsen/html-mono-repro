 
import {
  STYLE_TOKENS,
  StyleLibrary,
  StyleResolver,
  type IStyleLibrary,
  type IStyleToken,
} from "../../src/index.js";

export class StyleResolverFixture {
  public readonly defaultTokens: Readonly<Record<string, IStyleToken>>;
  public readonly defaultLibrary: IStyleLibrary;
  public readonly defaultResolver: StyleResolver;

  public constructor() {
    this.defaultTokens = STYLE_TOKENS;
    this.defaultLibrary = new StyleLibrary(this.defaultTokens);
    this.defaultResolver = new StyleResolver([this.defaultLibrary]);
  }

  public createLibrary(
    tokens: Readonly<Record<string, IStyleToken>>,
  ): IStyleLibrary {
    return new StyleLibrary(tokens);
  }

  public createResolver(
    ...libraries: readonly IStyleLibrary[]
  ): StyleResolver {
    return new StyleResolver(libraries);
  }

  public createTokens(): Readonly<Record<string, IStyleToken>> {
    return {
      base: {
        name: "base",
        style: {
          stroke: {
            color: "black",
            width: 1,
            dash: [],
          },
          fill: {
            color: "white",
          },
          opacity: 1,
        },
      },

      accent: {
        name: "accent",
        extends: ["base"],
        style: {
          stroke: {
            color: "red",
          },
        },
      },

      emphasis: {
        name: "emphasis",
        extends: ["accent"],
        style: {
          fill: {
            color: "yellow",
          },
          opacity: 0.75,
        },
      },

      dashed: {
        name: "dashed",
        extends: ["base"],
        style: {
          stroke: {
            dash: [4, 2],
          },
        },
      },
    } as const satisfies Record<string, IStyleToken>;
  }

  public createCircularTokens(): Readonly<Record<string, IStyleToken>> {
    return {
      a: {
        name: "a",
        extends: ["b"],
        style: {},
      },
      b: {
        name: "b",
        extends: ["a"],
        style: {},
      },
    } as const satisfies Record<string, IStyleToken>;
  }

  public createOverrideTokens(): Readonly<Record<string, IStyleToken>> {
    return {
      shared: {
        name: "shared",
        style: {
          stroke: {
            color: "blue",
            width: 2,
          },
          fill: {
            color: "lightblue",
          },
          opacity: 0.9,
        },
      },
    } as const satisfies Record<string, IStyleToken>;
  }
}
