 
import { IDrawableShape } from "@monorepo/core-new-shapes-abstract";
import { IControllerHost } from "@monorepo/core-reactive-abstract";

import { IThreeDrawContext } from "./IThreeDrawContext.js";
import { IThreeObjectProvider } from "./IThreeObjectProvider.js";

export interface IThreeShape
    extends IDrawableShape<IThreeDrawContext>, IControllerHost<IThreeShape>, IThreeObjectProvider {
    dispose(): void;
}
