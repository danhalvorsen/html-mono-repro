import { css, type CSSResultGroup } from "lit";

export class BaseGameObjectStyles {
  public static readonly styles: CSSResultGroup = css`
    :host {
      display: block;
      pointer-events: none;
    }

    .world {
      position: relative;
      width: var(--world-width);
      height: var(--world-height);
      pointer-events: none;
    }

    .transform {
      position: absolute;
      transform-origin: center;
      pointer-events: none;
    }

    .visual {
      position: relative;
      pointer-events: none;
    }

    .children {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
  `;

  private constructor() {}
}
