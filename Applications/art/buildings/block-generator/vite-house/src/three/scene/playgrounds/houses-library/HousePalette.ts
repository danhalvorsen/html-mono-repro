export interface IHousePalette {
  readonly wall: string;
  readonly accent: string;
  readonly roof: string;
  readonly base: string;
  readonly window: string;
}

export const HOUSE_PALETTES: readonly IHousePalette[] = Object.freeze([
  { wall: "#F1E5D4", accent: "#E67E5F", roof: "#F94F3D", base: "#D8C7B3", window: "#2D2D2D" },
  { wall: "#EFE0CF", accent: "#F2B507", roof: "#315F3B", base: "#D4C5B2", window: "#2A2A2A" },
  { wall: "#F6EDE3", accent: "#2C5EAD", roof: "#406AAF", base: "#DCCDBA", window: "#1F2C3A" },
  { wall: "#F5D9C9", accent: "#F45B26", roof: "#D12052", base: "#DDC9B7", window: "#3A1E2A" },
  { wall: "#F0E8DD", accent: "#4E9F83", roof: "#C8B49B", base: "#D3C3AF", window: "#2A3330" },
]);
