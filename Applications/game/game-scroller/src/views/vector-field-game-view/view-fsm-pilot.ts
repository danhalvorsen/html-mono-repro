import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { FsmBuilder, FsmEngine, type IInput } from "@monorepo/core-fsm";

type PilotStateId = "Idle";

class PilotStates {
  public static readonly Idle: PilotStateId = "Idle";
}

class PilotTransitionTypes {
  public static readonly Increment = "Increment" as const;
  public static readonly Decrement = "Decrement" as const;
}

type IncrementInput = IInput<typeof PilotTransitionTypes.Increment, number>;
type DecrementInput = IInput<typeof PilotTransitionTypes.Decrement, number>;
type PilotInput = IncrementInput | DecrementInput;

type PilotContext = Readonly<{
  counter: number;
}>;

type PilotOutput = Readonly<{
  action: "increment" | "decrement";
  amount: number;
}>;

interface IPilotFsmFactory {
  create(): FsmEngine<PilotStateId, PilotContext, PilotInput, PilotOutput>;
}

class DefaultPilotFsmFactory implements IPilotFsmFactory {
  public create(): FsmEngine<PilotStateId, PilotContext, PilotInput, PilotOutput> {
    const definition = new FsmBuilder<PilotStateId, PilotContext, PilotInput, PilotOutput>()
      .initial(PilotStates.Idle)

      .from(PilotStates.Idle)
      .on(PilotTransitionTypes.Increment)
      .withAction(({ context, input }: { context: PilotContext; input: IncrementInput }): PilotContext => ({
        ...context,
        counter: context.counter + input.payload,
      }))
      .withOutput(({ input }: { input: IncrementInput }): PilotOutput => ({
        action: "increment",
        amount: input.payload,
      }))
      .to(PilotStates.Idle)

      .from(PilotStates.Idle)
      .on(PilotTransitionTypes.Decrement)
      .withAction(({ context, input }: { context: PilotContext; input: DecrementInput }): PilotContext => ({
        ...context,
        counter: context.counter - input.payload,
      }))
      .withOutput(({ input }: { input: DecrementInput }): PilotOutput => ({
        action: "decrement",
        amount: input.payload,
      }))
      .to(PilotStates.Idle)

      .build();

    return new FsmEngine({
      definition,
      context: { counter: 0 },
    });
  }
}

@customElement("view-fsm-pilot")
export class ViewFsmPilot extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .panel {
      border: 1px solid #2a3042;
      border-radius: 12px;
      background: #121523;
      padding: 14px;
      display: grid;
      gap: 12px;
    }

    h2 {
      margin: 0;
      font-size: 16px;
      color: #bdc8f4;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    button {
      border: 1px solid #3a4466;
      border-radius: 8px;
      background: #1d2740;
      color: #dce6ff;
      padding: 8px 12px;
      cursor: pointer;
    }

    pre {
      margin: 0;
      overflow: auto;
      border-radius: 8px;
      padding: 10px;
      background: #0b1020;
      color: #bfd0ff;
      font: 12px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace;
    }
  `;

  private readonly fsm = new DefaultPilotFsmFactory().create();

  @state()
  private snapshot = this.createSnapshot(null);

  protected render(): TemplateResult {
    return html`
      <section class="panel">
        <h2>FSM Pilot View</h2>

        <div class="actions">
          <button type="button" @click=${this.onIncrement}>+1</button>
          <button type="button" @click=${this.onDecrement}>-1</button>
        </div>

        <pre>${JSON.stringify(this.snapshot, null, 2)}</pre>
      </section>
    `;
  }

  private readonly onIncrement = (): void => {
    void this.dispatch({ type: PilotTransitionTypes.Increment, payload: 1 });
  };

  private readonly onDecrement = (): void => {
    void this.dispatch({ type: PilotTransitionTypes.Decrement, payload: 1 });
  };

  private async dispatch(input: PilotInput): Promise<void> {
    const result = await this.fsm.dispatch(input);
    this.snapshot = this.createSnapshot(result);
  }

  private createSnapshot(
    result: Awaited<ReturnType<FsmEngine<PilotStateId, PilotContext, PilotInput, PilotOutput>["dispatch"]>> | null,
  ): Readonly<Record<string, unknown>> {
    return {
      state: this.fsm.state,
      context: this.fsm.context,
      lastTransition: result
        ? {
            from: result.from,
            to: result.to,
            input: result.input,
            outputs: result.outputs,
            transitionTaken: result.transitionTaken,
          }
        : null,
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "view-fsm-pilot": ViewFsmPilot;
  }
}
