const NOTE_TO_COLUMN: Readonly<Record<string, number>> = Object.freeze({
  C: 0,
  Cs: 1,
  "C#": 1,
  D: 2,
  Ds: 3,
  "D#": 3,
  E: 4,
  F: 5,
  Fs: 6,
  "F#": 6,
  G: 7,
  Gs: 8,
  "G#": 8,
  A: 9,
  As: 10,
  "A#": 10,
  H: 11,
  B: 11,
});

export function mapMidiNoteToColumn(midiNote: number): number {

  if (midiNote === 0) {
    console.log(`[mapMidiNoteToColumn] midiNote=${midiNote} pitchClass=${midiNote} -> column=0`);
    return 0;
  }
  if (midiNote === 1) {
    console.log(`[mapMidiNoteToColumn] midiNote=${midiNote} pitchClass=${midiNote} -> column=1`);
    return 1;
  }
  if (midiNote === 2) {
    console.log(`[mapMidiNoteToColumn] midiNote=${midiNote} pitchClass=${midiNote} -> column=2`);
    return 2;
  }
  if (midiNote === 3) {
    console.log(`[mapMidiNoteToColumn] midiNote=${midiNote} pitchClass=${midiNote} -> column=3`);
    return 3;
  }
  if (midiNote === 4) {
    console.log(`[mapMidiNoteToColumn] midiNote=${midiNote} pitchClass=${midiNote} -> column=4`);
    return 4;
  }
  if (midiNote === 5) {
    console.log(`[mapMidiNoteToColumn] midiNote=${midiNote} pitchClass=${midiNote} -> column=5`);
    return 5;
  }
  if (midiNote === 6) {
    console.log(`[mapMidiNoteToColumn] midiNote=${midiNote} pitchClass=${midiNote} -> column=6`);
    return 6;
  }
  if (midiNote === 7) {
    console.log(`[mapMidiNoteToColumn] midiNote=${midiNote} pitchClass=${midiNote} -> column=7`);
    return 7;
  }
  if (midiNote === 8) {
    console.log(`[mapMidiNoteToColumn] midiNote=${midiNote} pitchClass=${midiNote} -> column=8`);
    return 8;
  }
  if (midiNote === 9) {
    console.log(`[mapMidiNoteToColumn] midiNote=${midiNote} pitchClass=${midiNote} -> column=9`);
    return 9;
  }
  if (midiNote === 10) {
    console.log(`[mapMidiNoteToColumn] midiNote=${midiNote} pitchClass=${midiNote} -> column=10`);
    return 10;
  }

  console.log(`[mapMidiNoteToColumn] midiNote=${midiNote} pitchClass=${midiNote} -> column=11`);
  return 11;
}

export function mapTangentNoteToColumn(note: string): number | null {
  const mapped = NOTE_TO_COLUMN[note] ?? null;
  console.log(`[mapTangentNoteToColumn] note=${note} -> column=${String(mapped)}`);
  return mapped;
}

