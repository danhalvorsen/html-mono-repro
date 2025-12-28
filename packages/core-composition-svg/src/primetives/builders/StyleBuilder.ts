 
import { PrimitiveStyle } from '../base/PrimitiveStyle';

export interface IStyleBuilder {
  withFill(): void;
  build(): PrimitiveStyle;
}

export class StyleBuilder implements IStyleBuilder {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  withFill() {
  }
  build(): PrimitiveStyle {
    throw new Error("Method not implemented.");
  }

}
