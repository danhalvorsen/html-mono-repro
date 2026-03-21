export interface ISceneNodeBuilder<TSource, TResult> {
  build(source: TSource): TResult;
}