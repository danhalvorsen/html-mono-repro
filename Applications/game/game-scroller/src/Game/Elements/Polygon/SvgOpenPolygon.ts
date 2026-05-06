import type { IPolygon, SvgPolygonStyle } from './GamePolygon';
import { SvgPolygon } from './SvgPolygon';


export class SvgOpenPolygon extends SvgPolygon {
  public constructor(
    polygon: IPolygon,
    style: Omit<SvgPolygonStyle, 'closed'> = {}
  ) {
    super(polygon, { ...style, closed: false });
  }
}
