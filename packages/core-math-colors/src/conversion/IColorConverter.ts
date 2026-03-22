 
export interface IColorConverter<TSource, TTarget> {
  convert(source: TSource): TTarget;
}