import type { PidStencilSvgViewModel } from "./PidStencilSvgViewModel.js";

export interface PidStencilSvgGroupFilterResult {
  readonly availableGroupIds: readonly string[];
  readonly visibleItems: readonly PidStencilSvgViewModel[];
}

export class PidStencilSvgGroupFilter {
  public filter(
    items: readonly PidStencilSvgViewModel[],
    selectedGroupIds: readonly string[],
  ): PidStencilSvgGroupFilterResult {
    const availableGroupIds = this.getAvailableGroupIds(items);

    if (selectedGroupIds.length === 0) {
      return {
        availableGroupIds,
        visibleItems: items,
      };
    }

    const selected = new Set(selectedGroupIds);

    return {
      availableGroupIds,
      visibleItems: items.filter((item) => selected.has(item.groupId)),
    };
  }

  public getAvailableGroupIds(
    items: readonly PidStencilSvgViewModel[],
  ): readonly string[] {
    return [...new Set(items.map((item) => item.groupId))]
      .sort((left, right) => left.localeCompare(right));
  }
}