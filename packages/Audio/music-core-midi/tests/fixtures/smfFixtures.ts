export function asciiBytes(value: string): number[] {
  return Array.from(value, (ch) => ch.charCodeAt(0));
}

export function encodeVlq(value: number): number[] {
  if (value < 0) {
    throw new Error("VLQ value must be >= 0");
  }

  let buffer = value & 0x7f;
  const bytes: number[] = [];

  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }

  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8;
      continue;
    }
    break;
  }

  return bytes;
}

export function buildHeader(
  format: 0 | 1 | 2,
  tracks: number,
  divisionRaw: number,
): number[] {
  return [
    ...asciiBytes("MThd"),
    0x00, 0x00, 0x00, 0x06,
    (format >> 8) & 0xff,
    format & 0xff,
    (tracks >> 8) & 0xff,
    tracks & 0xff,
    (divisionRaw >> 8) & 0xff,
    divisionRaw & 0xff,
  ];
}

export function buildTrack(events: number[]): number[] {
  const length = events.length;
  return [
    ...asciiBytes("MTrk"),
    (length >>> 24) & 0xff,
    (length >>> 16) & 0xff,
    (length >>> 8) & 0xff,
    length & 0xff,
    ...events,
  ];
}

export function buildSmf(
  format: 0 | 1 | 2,
  divisionRaw: number,
  trackEvents: number[][],
): Uint8Array {
  const header = buildHeader(format, trackEvents.length, divisionRaw);
  const allTracks = trackEvents.flatMap((events) => buildTrack(events));
  return new Uint8Array([...header, ...allTracks]);
}

export function metaEvent(delta: number, type: number, data: number[]): number[] {
  return [...encodeVlq(delta), 0xff, type & 0xff, ...encodeVlq(data.length), ...data];
}

export function sysExEvent(delta: number, status: 0xf0 | 0xf7, data: number[]): number[] {
  return [...encodeVlq(delta), status, ...encodeVlq(data.length), ...data];
}

export function channelEvent(delta: number, status: number, data: number[]): number[] {
  return [...encodeVlq(delta), status & 0xff, ...data];
}

export function runningStatusData(delta: number, data: number[]): number[] {
  return [...encodeVlq(delta), ...data];
}
