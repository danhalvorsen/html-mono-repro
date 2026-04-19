export interface IStylable<TSelf, TStyle> {
  readonly style: Readonly<TStyle>;

  getStyle(): Readonly<TStyle>;
  withStyle(style: Readonly<TStyle>): TSelf;
  withStylePatch(style: Readonly<Partial<TStyle>>): TSelf;
}
