import { css, type CSSResult } from "lit";

export class Style {
  public static readonly appShell: CSSResult = css`
    :host {
      display: grid;
      grid-template-columns: 15% 85%;
      min-height: 100vh;
      font-family: system-ui, sans-serif;
      color: #f4f4f5;
      background: #0f1117;
    }

    .navigation-column {
      min-height: 100vh;
      padding: 1rem;
      border-right: 1px solid #2a2f3a;
      background: #11141b;
    }

    .view-column {
      min-height: 100vh;
      padding: 1rem;
      overflow: auto;
    }
  `;

  public static readonly navMenu: CSSResult = css`
    :host {
      display: block;
    }

    nav {
      display: grid;
      gap: 0.5rem;
    }
  `;

  public static readonly navMenuItem: CSSResult = css`
    :host {
      display: block;
    }

    button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0.75rem 1rem;
      border: 1px solid #2a2f3a;
      border-radius: 0.5rem;
      background: #171a22;
      color: #f4f4f5;
      font: inherit;
      cursor: pointer;
      text-align: left;
    }

    button:hover {
      background: #202532;
    }

    button.active,
    button[aria-current="page"] {
      border-color: #6ea8fe;
      background: #1f2a44;
    }
  `;

  public static installGlobal(): void {
    if (document.getElementById("module-basic-global-style") !== null) {
      return;
    }

    const style = document.createElement("style");
    style.id = "module-basic-global-style";
    style.textContent = `
      html,
      body {
        margin: 0;
        min-height: 100%;
        background: #0f1117;
        color: #f4f4f5;
      }

      * {
        box-sizing: border-box;
      }
    `;

    document.head.appendChild(style);
  }
}
