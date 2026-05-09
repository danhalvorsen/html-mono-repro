export class DefaultPianoTangentNamingPolicy {
  public toTangentId(noteName: string, octaveIndex: number): string {
    return `${noteName}${octaveIndex + 1}`;
  }
}
