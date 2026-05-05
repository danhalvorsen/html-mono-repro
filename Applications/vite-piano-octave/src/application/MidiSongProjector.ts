import { SimpleMidiTextFormatter, midiToText } from "@monorepo/music-core-midi";
import type { AccordStep } from "../music/Accords";
import { NOTE_SYMBOLS, type NoteSymbol } from "../domain/NoteDomain";

export interface ProjectedSongStep {
  readonly octaveIndex: number;
  readonly note: NoteSymbol;
  readonly startMs: number;
  readonly holdMs: number;
}

type TempoPoint = {
  tick: number;
  usPerQuarter: number;
};

type NoteOnEvent = {
  tick: number;
  midiNote: number;
};

type NoteOffEvent = {
  tick: number;
  midiNote: number;
};

export class MidiSongProjector {
  public async projectFromUrl(url: string): Promise<readonly ProjectedSongStep[]> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch MIDI file: ${url}`);
    }

    const data = new Uint8Array(await response.arrayBuffer());
    return this.projectFromBytes(data);
  }

  public projectFromBytes(data: Uint8Array): readonly ProjectedSongStep[] {
    const text = midiToText(data, new SimpleMidiTextFormatter());
    const lines = text.split("\n");

    const tempoPoints: TempoPoint[] = [{ tick: 0, usPerQuarter: 500000 }];
    const noteOns: NoteOnEvent[] = [];
    const noteOffs: NoteOffEvent[] = [];

    const tpqn = this.parseTicksPerQuarter(lines);

    for (const line of lines) {
      const tempoMatch = line.match(/^(\d+): META Tempo (\d+)us\/q/);
      if (tempoMatch) {
        tempoPoints.push({ tick: Number(tempoMatch[1]), usPerQuarter: Number(tempoMatch[2]) });
        continue;
      }

      const noteOnMatch = line.match(/^(\d+): NoteOn ch=\d+ note=(\d+) vel=(\d+)/);
      if (noteOnMatch) {
        const tick = Number(noteOnMatch[1]);
        const midiNote = Number(noteOnMatch[2]);
        const velocity = Number(noteOnMatch[3]);
        if (velocity === 0) {
          noteOffs.push({ tick, midiNote });
        } else {
          noteOns.push({ tick, midiNote });
        }
        continue;
      }

      const noteOffMatch = line.match(/^(\d+): NoteOff ch=\d+ note=(\d+) vel=\d+/);
      if (noteOffMatch) {
        noteOffs.push({ tick: Number(noteOffMatch[1]), midiNote: Number(noteOffMatch[2]) });
      }
    }

    tempoPoints.sort((a, b) => a.tick - b.tick);

    const availableOffTicks = new Map<number, number[]>();
    for (const off of noteOffs) {
      const arr = availableOffTicks.get(off.midiNote) ?? [];
      arr.push(off.tick);
      availableOffTicks.set(off.midiNote, arr);
    }
    for (const arr of availableOffTicks.values()) {
      arr.sort((a, b) => a - b);
    }

    const steps: ProjectedSongStep[] = [];

    noteOns.sort((a, b) => a.tick - b.tick);

    for (const on of noteOns) {
      const offTick = this.takeFirstOffTickAfter(on.tick, availableOffTicks.get(on.midiNote) ?? []);
      const startMs = this.tickToMs(on.tick, tempoPoints, tpqn);
      const endMs = this.tickToMs(offTick ?? on.tick + tpqn / 2, tempoPoints, tpqn);
      const holdMs = Math.max(80, Math.round(endMs - startMs));

      const octaveIndex = this.toOctaveIndex(on.midiNote);
      const note = this.toNoteSymbol(on.midiNote);
      steps.push({ octaveIndex, note, startMs: Math.round(startMs), holdMs });
    }

    return steps;
  }

  private parseTicksPerQuarter(lines: readonly string[]): number {
    const headerLine = lines.find((line) => line.startsWith("MIDI format="));
    const match = headerLine?.match(/tpqn=(\d+)/);
    return match ? Number(match[1]) : 480;
  }

  private takeFirstOffTickAfter(startTick: number, offTicks: number[]): number | null {
    const idx = offTicks.findIndex((tick) => tick >= startTick);
    if (idx < 0) return null;
    const [value] = offTicks.splice(idx, 1);
    return value ?? null;
  }

  private tickToMs(tick: number, tempos: readonly TempoPoint[], tpqn: number): number {
    let totalUs = 0;
    for (let i = 0; i < tempos.length; i++) {
      const current = tempos[i];
      const next = tempos[i + 1];
      const segmentEnd = next ? Math.min(next.tick, tick) : tick;
      if (segmentEnd <= current.tick) continue;
      const deltaTicks = segmentEnd - current.tick;
      totalUs += (deltaTicks * current.usPerQuarter) / tpqn;
      if (segmentEnd === tick) break;
    }
    return totalUs / 1000;
  }

  private toOctaveIndex(midiNote: number): number {
    if (midiNote < 54) return 0;
    if (midiNote < 66) return 1;
    if (midiNote < 78) return 2;
    return 3;
  }

  private toNoteSymbol(midiNote: number): NoteSymbol {
    const semitone = ((midiNote % 12) + 12) % 12;
    return NOTE_SYMBOLS[semitone];
  }
}

export function toAccordStepsByOctave(
  song: readonly ProjectedSongStep[],
  octaveIndex: number
): readonly AccordStep[] {
  const filtered = song
    .filter((s) => s.octaveIndex === octaveIndex)
    .sort((a, b) => a.startMs - b.startMs);

  let previousStartMs = 0;
  return filtered.map((s) => {
    const waitBeforeMs = Math.max(0, s.startMs - previousStartMs);
    previousStartMs = s.startMs;
    return {
      notes: [s.note],
      waitBeforeMs,
      holdMs: s.holdMs
    };
  });
}
