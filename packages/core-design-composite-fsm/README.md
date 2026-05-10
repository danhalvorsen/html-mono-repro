# @monorepo/core-design-composite-fsm

Adapter module that wires `@monorepo/core-design-composite` views to `@monorepo/core-fsm`.

`core-design-composite` stays UI-only. FSM wiring lives here.

## Basic usage

```ts
import { createDemoUI } from "@monorepo/core-design-composite/dist/demo/demo-ui.js";
import { FsmBuilder, FsmEngine, type IInput } from "@monorepo/core-fsm";
import { mountCompositeView, bindCompositeEventsToFsm, readUiChangeValue } from "@monorepo/core-design-composite-fsm";

type State = "Editing";
type Ctx = { name: string };
type Input = IInput<"nameChanged", string>;

const def = new FsmBuilder<State, Ctx, Input, never>()
  .initial("Editing")
  .from("Editing")
  .on("nameChanged")
  .withAction(({ context, input }) => ({ ...context, name: input.payload }))
  .to("Editing")
  .build();

const fsm = new FsmEngine({ definition: def, context: { name: "" } });

const root = document.getElementById("app")!;
const view = mountCompositeView(root, createDemoUI());

bindCompositeEventsToFsm(view, fsm, [
  {
    selector: "ui-input-text",
    eventName: "ui-change",
    toInput: ({ event }) => {
      const value = readUiChangeValue<string>(event);
      return { type: "nameChanged", payload: value ?? "" };
    },
  },
]);
```
