import { BoxUI } from '../layout/box.js';
import { ColumnUI } from '../layout/column.js';
import { SpacerUI } from '../layout/spacer.js';
import { DividerUI } from '../layout/divider.js';
import { SurfaceUI } from '../layout/surface.js';

import { LabelUI } from '../input/label.js';
import { InputTextUI } from '../input/input-text.js';
import { InputNumberUI } from '../input/input-number.js';
import { InputSelectUI } from '../input/input-select.js';
import { ErrorMessageUI } from '../input/error.js';

import { ClickableUI } from '../behavior/clickable.js';
import { HoverableUI } from '../behavior/hoverable.js';

export function createDemoUI() {
    return new BoxUI('DemoRoot')
        .add(
            new SurfaceUI('Form')
                .add(
                    new ColumnUI('FormColumn')
                        .add(new LabelUI('Name'))
                        .add(new InputTextUI('Your name'))
                        .add(new SpacerUI(12))

                        .add(new LabelUI('Age'))
                        .add(new InputNumberUI('0'))
                        .add(new SpacerUI(12))

                        .add(new LabelUI('Favorite Color'))
                        .add(new InputSelectUI(['Red', 'Green', 'Blue']))
                        .add(new SpacerUI(12))

                        .add(new ClickableUI(new HoverableUI(new LabelUI('Submit'))))
                        .add(new SpacerUI(8))
                        .add(new DividerUI())
                        .add(new ErrorMessageUI('Example error message'))
                )
        );
}
