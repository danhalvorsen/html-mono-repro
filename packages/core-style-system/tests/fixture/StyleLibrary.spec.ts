import { describe, expect, it } from "vitest";

import {
  StyleLibrary,
  type IStyleToken,
} from "../../src/index.js";
import { StyleResolverFixture } from "./StyleResolverFixture.js";

describe("StyleLibrary", () => {
  it("should expose tokens as a readonly copy", () => {
    const fixture = new StyleResolverFixture();
    const tokens = fixture.createTokens();

    const library = new StyleLibrary(tokens);

    expect(library.tokens).toEqual(tokens);
    expect(library.tokens).not.toBe(tokens);
  });

  it("should freeze the tokens container", () => {
    const fixture = new StyleResolverFixture();
    const tokens = fixture.createTokens();

    const library = new StyleLibrary(tokens);

    expect(Object.isFrozen(library.tokens)).toBe(true);
  });

  it("should preserve token lookup by name", () => {
    const tokens = {
      sample: {
        name: "sample",
        style: {
          opacity: 0.5,
        },
      },
    } as const satisfies Record<string, IStyleToken>;

    const library = new StyleLibrary(tokens);

    expect(library.tokens.sample).toEqual(tokens.sample);
  });
});
