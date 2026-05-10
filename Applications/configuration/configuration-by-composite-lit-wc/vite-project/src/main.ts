import "./index.css";
import "@monorepo/core-design-composite";
import type { IDispatchResult, IFsm } from "@monorepo/core-fsm";
import {
  bindCompositeEventsToFsm,
  readUiChangeValue,
  type CompositeFsmEventBinding,
} from "../../../../../packages/core-design-composite-fsm/src/index.ts";
import {
  DefaultViewFsmFactory,
  SetBlaValueTransitionInput,
  SetFooMaxTransitionInput,
  SetFooMinTransitionInput,
  SetModeTransitionInput,
  type ViewContext,
  type ViewMode,
  ViewModes,
  type ViewTransitionInput,
  type ViewTransitionOutput,
  type ViewState,
} from "./fsm/foo-bla-fsm.js";
import { DefaultFooBlaViewFactory } from "./foo-bla-ui.js";

class ViewSelectors {
  public static readonly AppRoot = "app";
  public static readonly ViewRoot = "view-root";
  public static readonly FsmOutput = "fsm-output";
  public static readonly InputSelect = "ui-input-select";
  public static readonly InputNumber = "ui-input-number";
  public static readonly InputRange = "ui-input-range";
}

interface IViewValueParser {
  toNumberOrNull(value: unknown): number | null;
  toModeOrNull(value: unknown): ViewMode | null;
}

class DefaultViewValueParser implements IViewValueParser {
  public toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  public toModeOrNull(value: unknown): ViewMode | null {
    if (value === ViewModes.Foo || value === ViewModes.Bla) {
      return value;
    }

    return null;
  }
}

interface IFsmSnapshotView {
  render(
    fsm: IFsm<ViewState, ViewContext, ViewTransitionInput, ViewTransitionOutput>,
    lastResult: IDispatchResult<ViewState, ViewTransitionInput, ViewContext, ViewTransitionOutput> | null,
  ): void;
}

class DefaultFsmSnapshotView implements IFsmSnapshotView {
  private readonly outputElement: HTMLPreElement;

  public constructor(outputElement: HTMLPreElement) {
    this.outputElement = outputElement;
  }

  public render(
    fsm: IFsm<ViewState, ViewContext, ViewTransitionInput, ViewTransitionOutput>,
    lastResult: IDispatchResult<ViewState, ViewTransitionInput, ViewContext, ViewTransitionOutput> | null,
  ): void {
    this.outputElement.textContent = JSON.stringify(
      {
        state: fsm.state,
        context: fsm.context,
        lastTransition: lastResult
          ? {
              from: lastResult.from,
              to: lastResult.to,
              input: lastResult.input,
              transitionTaken: lastResult.transitionTaken,
              outputs: lastResult.outputs,
            }
          : null,
      },
      null,
      2,
    );
  }
}

class DefaultFooBlaViewController {
  private readonly uiRoot: HTMLElement;
  private readonly fsm: IFsm<ViewState, ViewContext, ViewTransitionInput, ViewTransitionOutput>;
  private readonly snapshotView: IFsmSnapshotView;
  private readonly valueParser: IViewValueParser;
  private lastResult: IDispatchResult<
    ViewState,
    ViewTransitionInput,
    ViewContext,
    ViewTransitionOutput
  > | null = null;

  public constructor(
    uiRoot: HTMLElement,
    fsm: IFsm<ViewState, ViewContext, ViewTransitionInput, ViewTransitionOutput>,
    snapshotView: IFsmSnapshotView,
    valueParser: IViewValueParser,
  ) {
    this.uiRoot = uiRoot;
    this.fsm = fsm;
    this.snapshotView = snapshotView;
    this.valueParser = valueParser;
  }

  public bind(): void {
    const bindings: readonly CompositeFsmEventBinding<
      ViewState,
      ViewContext,
      ViewTransitionInput,
      ViewTransitionOutput
    >[] = [
      {
        selector: ViewSelectors.InputSelect,
        toInput: ({ event }) => {
          const mode = this.valueParser.toModeOrNull(readUiChangeValue<unknown>(event));
          if (!mode) {
            return null;
          }

          return new SetModeTransitionInput(mode);
        },
      },
      {
        selector: ViewSelectors.InputNumber,
        toInput: ({ event, element }: { event: Event; element: Element }) => {
          const numberInputs = Array.from(this.uiRoot.querySelectorAll(ViewSelectors.InputNumber));
          const inputIndex = numberInputs.indexOf(element);
          const value = this.valueParser.toNumberOrNull(readUiChangeValue<unknown>(event));

          if (inputIndex === 0) {
            return new SetFooMinTransitionInput(value);
          }

          if (inputIndex === 1) {
            return new SetFooMaxTransitionInput(value);
          }

          return null;
        },
      },
      {
        selector: ViewSelectors.InputRange,
        toInput: ({ event }) =>
          new SetBlaValueTransitionInput(
            this.valueParser.toNumberOrNull(readUiChangeValue<unknown>(event)),
          ),
      },
    ];

    bindCompositeEventsToFsm(this.uiRoot, this.fsm, bindings, {
      onDispatched: (result: IDispatchResult<ViewState, ViewTransitionInput, ViewContext, ViewTransitionOutput>) => {
        this.lastResult = result;
        this.snapshotView.render(this.fsm, this.lastResult);
      },
    });

    this.snapshotView.render(this.fsm, this.lastResult);
  }
}

class FooBlaViewCompositionRoot {
  public compose(): void {
    const app = document.getElementById(ViewSelectors.AppRoot);
    if (!(app instanceof HTMLElement)) {
      throw new Error("Missing #app element");
    }

    app.innerHTML = `
      <div class="layout">
        <section class="panel">
          <h2>Composite View</h2>
          <div id="${ViewSelectors.ViewRoot}"></div>
        </section>
        <section class="panel">
          <h2>FSM</h2>
          <pre id="${ViewSelectors.FsmOutput}"></pre>
        </section>
      </div>
    `;

    const viewRoot = app.querySelector(`#${ViewSelectors.ViewRoot}`);
    const fsmOutput = app.querySelector(`#${ViewSelectors.FsmOutput}`);

    if (!(viewRoot instanceof HTMLDivElement) || !(fsmOutput instanceof HTMLPreElement)) {
      throw new Error("Missing view mounts.");
    }

    const viewFactory = new DefaultFooBlaViewFactory();
    const fsmFactory = new DefaultViewFsmFactory();

    const ui = viewFactory.create();
    viewRoot.replaceChildren(ui);

    const fsm = fsmFactory.create();

    const controller = new DefaultFooBlaViewController(
      ui,
      fsm,
      new DefaultFsmSnapshotView(fsmOutput),
      new DefaultViewValueParser(),
    );

    controller.bind();
  }
}

class FooBlaApplicationBootstrap {
  public run(): void {
    document.addEventListener("DOMContentLoaded", () => {
      new FooBlaViewCompositionRoot().compose();
    });
  }
}

new FooBlaApplicationBootstrap().run();
