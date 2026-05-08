import {
  BoxUI,
  ColumnUI,
  SurfaceUI,
  LabelUI,
  InputSelectUI,
  InputNumberUI,
  InputRangeUI,
  SpacerUI,
} from "@monorepo/core-design-composite";
import { DefaultFooOption, type FooOption } from "./domain/Foo.js";
import { DefaultBlaOption, type BlaOption } from "./domain/Bla.js";

export interface IFooBlaViewFactory {
  create(): HTMLElement;
}

export class DefaultFooBlaViewFactory implements IFooBlaViewFactory {
  private readonly fooOption: FooOption;
  private readonly blaOption: BlaOption;

  public constructor(
    fooOption: FooOption = { ...DefaultFooOption },
    blaOption: BlaOption = { ...DefaultBlaOption },
  ) {
    this.fooOption = fooOption;
    this.blaOption = blaOption;
  }

  public create(): HTMLElement {
    const [min, max] = this.blaOption.scale;

    const ui = new BoxUI("FooBlaRoot").add(
      new SurfaceUI("FooBlaSurface").add(
        new ColumnUI("FooBlaColumn")
          .add(new LabelUI("Foo / Bla Configuration IO"))
          .add(new SpacerUI(8))
          .add(new LabelUI("Option Set"))
          .add(new InputSelectUI(["Foo", "Bla"]))
          .add(new SpacerUI(8))
          .add(new LabelUI("Foo Min"))
          .add(new InputNumberUI(String(this.fooOption.min)))
          .add(new LabelUI("Foo Max"))
          .add(new InputNumberUI(String(this.fooOption.max)))
          .add(new LabelUI("Bla Value"))
          .add(
            new InputRangeUI({
              label: this.blaOption.label ?? "Bla",
              min,
              max,
              step: this.blaOption.step ?? 1,
              value: this.blaOption.currentValue ?? min,
            }),
          )
          .add(new SpacerUI(8))
          .add(new LabelUI("Output"))
          .add(new LabelUI(JSON.stringify({ foo: this.fooOption, bla: this.blaOption }, null, 2))),
      ),
    );

    return ui.createElement();
  }
}
