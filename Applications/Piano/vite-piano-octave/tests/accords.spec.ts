import { describe, expect, it, vi } from "vitest";
import { Accords } from "../src/music/Accords";

describe("Accords", () => {
  it("should play each accord with configured wait and hold", () => {
    vi.useFakeTimers();

    const playback = vi.fn();
    const accords = new Accords(
      [
        { notes: ["C", "E", "G"], waitBeforeMs: 100, holdMs: 400 },
        { notes: ["F", "A", "C"], waitBeforeMs: 200, holdMs: 500 }
      ],
      300,
      350
    );

    accords.play(playback);
    expect(playback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(playback).toHaveBeenCalledTimes(1);
    expect(playback).toHaveBeenNthCalledWith(1, {
      notes: ["C", "E", "G"],
      holdMs: 400
    });

    vi.advanceTimersByTime(200);
    expect(playback).toHaveBeenCalledTimes(2);
    expect(playback).toHaveBeenNthCalledWith(2, {
      notes: ["F", "A", "C"],
      holdMs: 500
    });

    vi.useRealTimers();
  });
});
