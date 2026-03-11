
import { describe, expect, it } from "vitest";
import { WebAudioRuntimeFixture } from "../Fixture/WebAudioRuntimeFixture.js";

describe("WebAudioPlaybackSession", () => {
  it("should resume suspended audio context on play", async () => {
    const fixture = new WebAudioRuntimeFixture();

    await fixture.playbackSession.play(fixture.tree.root);

    expect(fixture.context.resumeCount).toBe(1);
    expect(fixture.context.state).toBe("running");
  });

  it("should connect root output to destination on play", async () => {
    const fixture = new WebAudioRuntimeFixture();

    await fixture.playbackSession.play(fixture.tree.root);

    const mixerNode = fixture.context.createdGainNodes[0];
    expect(mixerNode.connections).toContain(fixture.context.destination);
  });

  it("should start all oscillator runtime nodes on play", async () => {
    const fixture = new WebAudioRuntimeFixture();

    await fixture.playbackSession.play(fixture.tree.root);

    expect(fixture.context.createdOscillatorNodes).toHaveLength(2);
    expect(fixture.context.createdOscillatorNodes[0].startCount).toBe(1);
    expect(fixture.context.createdOscillatorNodes[1].startCount).toBe(1);
  });

  it("should stop all started oscillators on stop", async () => {
    const fixture = new WebAudioRuntimeFixture();

    await fixture.playbackSession.play(fixture.tree.root);
    fixture.playbackSession.stop();

    expect(fixture.context.createdOscillatorNodes[0].stopCount).toBe(1);
    expect(fixture.context.createdOscillatorNodes[1].stopCount).toBe(1);
  });

  it("should disconnect current output on stop", async () => {
    const fixture = new WebAudioRuntimeFixture();

    await fixture.playbackSession.play(fixture.tree.root);
    const mixerNode = fixture.context.createdGainNodes[0];

    fixture.playbackSession.stop();

    expect(mixerNode.disconnectCount).toBeGreaterThan(0);
  });

  it("should dispose all runtime nodes on stop", async () => {
    const fixture = new WebAudioRuntimeFixture();

    await fixture.playbackSession.play(fixture.tree.root);

    const mixerNode = fixture.context.createdGainNodes[0];
    const gainNodeA = fixture.context.createdGainNodes[1];
    const gainNodeB = fixture.context.createdGainNodes[2];
    const oscNodeA = fixture.context.createdOscillatorNodes[0];
    const oscNodeB = fixture.context.createdOscillatorNodes[1];

    fixture.playbackSession.stop();

    expect(mixerNode.disconnectCount).toBeGreaterThan(0);
    expect(gainNodeA.disconnectCount).toBeGreaterThan(0);
    expect(gainNodeB.disconnectCount).toBeGreaterThan(0);
    expect(oscNodeA.disconnectCount).toBeGreaterThan(0);
    expect(oscNodeB.disconnectCount).toBeGreaterThan(0);
  });

  it("should be safe to stop when nothing is playing", () => {
    const fixture = new WebAudioRuntimeFixture();

    expect(() => fixture.playbackSession.stop()).not.toThrow();
  });

  it("should stop previous playback before starting a new one", async () => {
    const fixture = new WebAudioRuntimeFixture();

    await fixture.playbackSession.play(fixture.tree.root);
    const firstOscA = fixture.context.createdOscillatorNodes[0];
    const firstOscB = fixture.context.createdOscillatorNodes[1];

    await fixture.playbackSession.play(fixture.tree.root);

    expect(firstOscA.stopCount).toBe(1);
    expect(firstOscB.stopCount).toBe(1);
    expect(fixture.context.createdOscillatorNodes).toHaveLength(4);
  });

  it("should close context on dispose", async () => {
    const fixture = new WebAudioRuntimeFixture();

    await fixture.playbackSession.dispose();

    expect(fixture.context.closeCount).toBe(1);
    expect(fixture.context.state).toBe("closed");
  });

  it("should stop playback before closing context on dispose", async () => {
    const fixture = new WebAudioRuntimeFixture();

    await fixture.playbackSession.play(fixture.tree.root);

    const oscNodeA = fixture.context.createdOscillatorNodes[0];
    const oscNodeB = fixture.context.createdOscillatorNodes[1];

    await fixture.playbackSession.dispose();

    expect(oscNodeA.stopCount).toBe(1);
    expect(oscNodeB.stopCount).toBe(1);
    expect(fixture.context.closeCount).toBe(1);
  });
});