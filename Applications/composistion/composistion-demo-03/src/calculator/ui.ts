import { BoxUI, ButtonUI, ColumnUI, InputNumberUI, LabelUI, RectangleUI, RowUI, SpacerUI, SurfaceUI, type Component } from "@monorepo/core-design-composite";

export class UI {
    public static make():Component {
        return new BoxUI("DemoRoot").add(
            new SurfaceUI("FormSurface").add(
              new ColumnUI("Calculator").add(
                new RectangleUI("InputSection")
                  .add(new LabelUI("Calculator"))
                  .add(new SpacerUI(4))
                  .add(new InputNumberUI(""))
                  .add(new SpacerUI(8))
                  .add(
                    new RowUI("Ops")
                      .add(new ButtonUI(new LabelUI("/")))
                      .add(new ButtonUI(new LabelUI("*")))
                      .add(new ButtonUI(new LabelUI("+")))
                      .add(new ButtonUI(new LabelUI("-"))),
                  )
                  .add(new SpacerUI(4))
                  .add(
                    new RowUI("Row1")
                      .add(new ButtonUI(new LabelUI("7")))
                      .add(new ButtonUI(new LabelUI("8")))
                      .add(new ButtonUI(new LabelUI("9"))),
                  )
                  .add(new SpacerUI(4))
                  .add(
                    new RowUI("Row2")
                      .add(new ButtonUI(new LabelUI("4")))
                      .add(new ButtonUI(new LabelUI("5")))
                      .add(new ButtonUI(new LabelUI("6"))),
                  )
                  .add(new SpacerUI(4))
                  .add(
                    new RowUI("Row3")
                      .add(new ButtonUI(new LabelUI("1")))
                      .add(new ButtonUI(new LabelUI("2")))
                      .add(new ButtonUI(new LabelUI("3"))),
                  )
                  .add(new SpacerUI(4))
                  .add(
                    new RowUI("Row4")
                      .add(new ButtonUI(new LabelUI("0")))
                      .add(new ButtonUI(new LabelUI("CR")))
                      .add(new ButtonUI(new LabelUI("="), "primary")),
                  ),
              ),
            ),
          );
    }
}