import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

export const TurtleCommandExampleSelectedEventName =
  "turtle-command-example-selected";

export type TurtleCommandExampleSelectedEventDetail = {
  readonly example: string;
};

export type TurtleCommandListItem = {
  readonly command: string;
  readonly aliases: readonly string[];
  readonly example: string;
  readonly description: string;
  readonly category: "movement" | "pen" | "stack" | "style" | "canvas";
};

const AvailableCommands: readonly TurtleCommandListItem[] = Object.freeze([
  {
    command: "forward <distance>",
    aliases: ["fd <distance>", "move <distance>"],
    example: "forward 100",
    description: "Move forward along the current turtle heading.",
    category: "movement",
  },
  {
    command: "back <distance>",
    aliases: ["backward <distance>", "bk <distance>"],
    example: "back 40",
    description: "Move backward by emitting a negative forward movement.",
    category: "movement",
  },
  {
    command: "left <degrees>",
    aliases: ["lt <degrees>", "turnleft <degrees>"],
    example: "left 90",
    description: "Rotate the turtle counterclockwise.",
    category: "movement",
  },
  {
    command: "right <degrees>",
    aliases: ["rt <degrees>", "turnright <degrees>"],
    example: "right 90",
    description: "Rotate the turtle clockwise.",
    category: "movement",
  },
  {
    command: "penup",
    aliases: ["pu"],
    example: "penup",
    description: "Move without emitting primitives.",
    category: "pen",
  },
  {
    command: "pendown",
    aliases: ["pd"],
    example: "pendown",
    description: "Resume primitive emission during movement.",
    category: "pen",
  },
  {
    command: "push",
    aliases: ["["],
    example: "push",
    description: "Push current turtle state to the turtle state stack.",
    category: "stack",
  },
  {
    command: "pop",
    aliases: ["]"],
    example: "pop",
    description: "Restore the last pushed turtle state.",
    category: "stack",
  },
  {
    command: "stroke <color> <width>",
    aliases: [],
    example: "stroke blue 3",
    description: "Set stroke color and stroke width.",
    category: "style",
  },
  {
    command: "fill <color>",
    aliases: [],
    example: "fill none",
    description: "Set fill color for supported primitives.",
    category: "style",
  },
  {
    command: "reset",
    aliases: [],
    example: "reset",
    description: "Reset turtle state and clear emitted primitives.",
    category: "canvas",
  },
  {
    command: "clear",
    aliases: [],
    example: "clear",
    description: "Clear emitted primitives without resetting turtle orientation.",
    category: "canvas",
  },
]);

const CategoryLabel: Readonly<Record<TurtleCommandListItem["category"], string>> =
  Object.freeze({
    movement: "Movement",
    pen: "Pen",
    stack: "State stack",
    style: "Style",
    canvas: "Canvas",
  });

@customElement("turtle-command-list")
export class TurtleCommandList extends LitElement {
  @property({ attribute: false })
  public commands: readonly TurtleCommandListItem[] = AvailableCommands;

  protected override render() {
    const categories = this.getCategories();

    return html`
      <section class="command-list-shell">
        <header>
          <div>
            <h2>Available commands</h2>
            <p>Commands currently supported by the turtle command parser.</p>
          </div>
        </header>

        <div class="categories">
          ${categories.map((category) => this.renderCategory(category))}
        </div>
      </section>
    `;
  }

  private renderCategory(category: TurtleCommandListItem["category"]) {
    const commands = this.commands.filter((command) => command.category === category);

    return html`
      <section class="category">
        <h3>${CategoryLabel[category]}</h3>

        <div class="items">
          ${commands.map((command) => this.renderCommand(command))}
        </div>
      </section>
    `;
  }

  private renderCommand(command: TurtleCommandListItem) {
    return html`
      <button
        type="button"
        class="command"
        title=${`Insert example: ${command.example}`}
        @click=${() => this.selectExample(command.example)}
      >
        <span class="command-main">
          <code>${command.command}</code>
        </span>

        ${command.aliases.length === 0
          ? html``
          : html`
              <span class="aliases">
                aliases:
                ${command.aliases.map((alias) => html`<code>${alias}</code>`)}
              </span>
            `}

        <span class="description">${command.description}</span>
        <span class="example">Example: <code>${command.example}</code></span>
      </button>
    `;
  }

  private getCategories(): readonly TurtleCommandListItem["category"][] {
    const categories: TurtleCommandListItem["category"][] = [];

    for (const command of this.commands) {
      if (!categories.includes(command.category)) {
        categories.push(command.category);
      }
    }

    return categories;
  }

  private selectExample(example: string): void {
    this.dispatchEvent(
      new CustomEvent<TurtleCommandExampleSelectedEventDetail>(
        TurtleCommandExampleSelectedEventName,
        {
          bubbles: true,
          composed: true,
          detail: {
            example,
          },
        },
      ),
    );
  }

  public static override styles = css`
    :host {
      display: block;
      min-width: 0;
    }

    .command-list-shell {
      display: grid;
      gap: 12px;
    }

    header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 12px;
    }

    h2 {
      margin: 0;
      font-size: 18px;
      color: var(--text-strong);
    }

    h3 {
      margin: 0 0 8px;
      color: var(--text-strong);
      font-size: 14px;
    }

    p {
      margin: 4px 0 0;
      color: var(--text-muted);
      font-size: 13px;
    }

    .categories {
      display: grid;
      gap: 12px;
    }

    .category {
      display: grid;
      gap: 8px;
    }

    .items {
      display: grid;
      gap: 8px;
    }

    .command {
      display: grid;
      gap: 6px;
      width: 100%;
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 12px;
      text-align: left;
      color: var(--text);
      background: var(--surface-2);
      cursor: pointer;
    }

    .command:hover {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-soft);
    }

    .command-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .aliases {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 5px;
      color: var(--text-muted);
      font-size: 12px;
    }

    .description {
      color: var(--text-muted);
      font-size: 12px;
      line-height: 1.4;
    }

    .example {
      color: var(--text-muted);
      font-size: 12px;
    }

    code {
      font: 11px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace;
      color: var(--text-strong);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 2px 5px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "turtle-command-list": TurtleCommandList;
  }
}