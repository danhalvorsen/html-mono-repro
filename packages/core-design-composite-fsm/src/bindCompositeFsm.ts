import type { Component } from "@monorepo/core-design-composite";
import type { IFsm } from "@monorepo/core-fsm";
import type { IDispatchResult, IInput, InputType, StateId } from "@monorepo/core-fsm";

export interface CompositeFsmEventBinding<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, unknown>,
  TOut,
> {
  readonly selector: string;
  readonly eventName?: string;
  readonly toInput: (args: {
    readonly event: Event;
    readonly element: Element;
    readonly fsm: IFsm<TState, TContext, TInput, TOut>;
  }) => TInput | null;
}

export interface BindCompositeFsmOptions<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, unknown>,
  TOut,
> {
  readonly onDispatched?: (
    result: IDispatchResult<TState, TInput, TContext, TOut>,
  ) => void;
  readonly onDispatchError?: (error: unknown) => void;
}

export function mountCompositeView(
  mountPoint: HTMLElement,
  component: Component,
): HTMLElement {
  const element = component.createElement();
  (element as { model?: Component }).model = component;
  mountPoint.replaceChildren(element);
  return element;
}

export function bindCompositeEventsToFsm<
  TState extends StateId,
  TContext,
  TInput extends IInput<InputType, unknown>,
  TOut,
>(
  rootElement: HTMLElement,
  fsm: IFsm<TState, TContext, TInput, TOut>,
  bindings: readonly CompositeFsmEventBinding<TState, TContext, TInput, TOut>[],
  options: BindCompositeFsmOptions<TState, TContext, TInput, TOut> = {},
): () => void {
  const disposers: Array<() => void> = [];

  for (const binding of bindings) {
    const eventName = binding.eventName ?? "ui-change";

    const handler = (event: Event): void => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const matched = target.closest(binding.selector);
      if (!matched || !rootElement.contains(matched)) {
        return;
      }

      const input = binding.toInput({ event, element: matched, fsm });
      if (!input) {
        return;
      }

      void fsm.dispatch(input)
        .then((result) => {
          options.onDispatched?.(result);
        })
        .catch((error: unknown) => {
          options.onDispatchError?.(error);
        });
    };

    rootElement.addEventListener(eventName, handler);
    disposers.push(() => rootElement.removeEventListener(eventName, handler));
  }

  return () => {
    for (const dispose of disposers) {
      dispose();
    }
  };
}

export function readUiChangeValue<TValue = unknown>(event: Event): TValue | undefined {
  return (event as CustomEvent<{ value?: TValue }>).detail?.value;
}

export function readUiCheckedValue(event: Event): boolean | undefined {
  return (event as CustomEvent<{ checked?: boolean }>).detail?.checked;
}
