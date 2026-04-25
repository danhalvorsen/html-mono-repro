// packages/Audio/music-core-synthesizer/module-basic-tester/src/infrastructure/Style.ts

import { css } from "lit";

export class Style {
  private static readonly globalStyleElementId = "module-basic-global-style";

  private constructor() {}

  public static installGlobal(): void {
    if (document.getElementById(Style.globalStyleElementId) !== null) {
      return;
    }

    const styleElement = document.createElement("style");
    styleElement.id = Style.globalStyleElementId;
    styleElement.textContent = Style.globalCssText;

    document.head.appendChild(styleElement);
  }

  public static readonly globalCssText = `
    :root {
      color-scheme: light dark;
      background-color: #ffffff;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        background-color: #16171d;
      }
    }

    body {
      min-width: 320px;
      min-height: 100svh;
      margin: 0;
      overflow-x: hidden;
      font-synthesis: none;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `;

  public static readonly appShell = css`
    :host {
      display: block;
      width: 100%;
      min-height: 100svh;
    }

    .layout {
      display: grid;
      grid-template-columns: 15% 85%;
      width: 100%;
      min-height: 100svh;
    }

    .navigation-column {
      box-sizing: border-box;
      padding: 1rem;
      border-right: 1px solid #d7d7d7;
      background: #f7f7f9;
    }

    .view-column {
      box-sizing: border-box;
      min-width: 0;
      padding: 2rem;
      background: #ffffff;
      color: #222222;
    }

    .red {
      color: red;
    }

    @media (prefers-color-scheme: dark) {
      .navigation-column {
        border-right-color: #343743;
        background: #1c1e26;
      }

      .view-column {
        background: #22242c;
        color: #ffffff;
      }
    }
  `;

  public static readonly navMenu = css`
    :host {
      display: block;
      width: 100%;
    }

    nav {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
      width: 100%;
    }

    ::slotted(nav-menu-item) {
      display: block;
      width: 100%;
    }
  `;

  public static readonly navMenuItem = css`
    :host {
      display: block;
      width: 100%;
    }

    button {
      width: 100%;
      padding: 0.65rem 0.75rem;
      border: 1px solid #aaa;
      border-radius: 6px;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-size: 1rem;
      text-align: left;
    }

    button.active {
      border-color: #aa3bff;
      background: #aa3bff22;
      color: #aa3bff;
    }

    button:hover:not(.active) {
      background: #eeeeee;
    }

    @media (prefers-color-scheme: dark) {
      button:hover:not(.active) {
        background: #2b2e38;
      }
    }
  `;
}