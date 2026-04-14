export type PlotMenuCommand =
  | { readonly type: "select"; readonly plotId: string }
  | { readonly type: "toggle-visible"; readonly plotId: string }
  | { readonly type: "remove"; readonly plotId: string };
