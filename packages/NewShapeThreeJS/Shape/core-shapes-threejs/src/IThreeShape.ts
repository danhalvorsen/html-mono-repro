 
import { IDrawableShape } from "@monorepo/core-shapes-abstract";

import { IThreeDrawContext } from "./IThreeDrawContext.js";
import { IThreeObjectProvider } from "./IThreeObjectProvider.js";
import { IControllerHost } from "@monorepo/core-reactive-abstract";

export interface IThreeShape
    extends IDrawableShape<IThreeDrawContext>, IControllerHost<IThreeShape>, IThreeObjectProvider {
    dispose(): void;
}
