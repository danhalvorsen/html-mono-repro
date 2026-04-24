import type {
  ISequencerColumnIndicatorProjection,
  ISequencerControlProjection,
  ISequencerGridProjection,
  ISequencerTrackProjection,
  SequencerBpm,
} from "../../src/ui-contract.ts";

type LitLikeElement = Element & { updateComplete?: Promise<unknown> };

export class SequencerUiTestFixture {
  public static resetDocument(): void {
    document.body.innerHTML = "";
  }

  public static async mount<TElement extends Element>(
    element: TElement,
  ): Promise<TElement> {
    document.body.append(element);
    await SequencerUiTestFixture.waitForUpdate(element);
    return element;
  }

  public static async waitForUpdate(
    element: Element | null | undefined,
  ): Promise<void> {
    if (element === null || element === undefined) {
      return;
    }

    const maybeLitElement = element as LitLikeElement;
    if (maybeLitElement.updateComplete !== undefined) {
      await maybeLitElement.updateComplete;
      return;
    }

    await Promise.resolve();
  }

  public static createTrackProjection(
    trackId: number,
    stepStates: readonly boolean[],
    selected = true,
  ): ISequencerTrackProjection {
    return Object.freeze({
      trackId,
      selected,
      stepStates: Object.freeze([...stepStates]),
    });
  }

  public static createColumnIndicatorProjection(
    overrides: Partial<ISequencerColumnIndicatorProjection> = {},
  ): ISequencerColumnIndicatorProjection {
    return Object.freeze({
      enabled: overrides.enabled ?? false,
      playing: overrides.playing ?? false,
      currentColumn: overrides.currentColumn ?? -1,
    });
  }

  public static createGridProjection(
    tracks: readonly ISequencerTrackProjection[],
    columnIndicator = SequencerUiTestFixture.createColumnIndicatorProjection(),
  ): ISequencerGridProjection {
    return Object.freeze({
      tracks: Object.freeze([...tracks]),
      columnIndicator,
    });
  }

  public static createControlProjection(
    overrides: Partial<ISequencerControlProjection> = {},
  ): ISequencerControlProjection {
    const bpm = overrides.bpm ?? 130;

    return Object.freeze({
      playing: overrides.playing ?? false,
      bpm: bpm as SequencerBpm,
      columnIndicatorEnabled: overrides.columnIndicatorEnabled ?? false,
    });
  }
}