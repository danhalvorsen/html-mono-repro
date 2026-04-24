const LABEL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createDrawingTextLabel(seed: string): string {
    let hash = hashText(seed);
    const length = 3 + Math.abs(hash % 3);
    let label = "";

    for (let index = 0; index < length; index += 1) {
        const cursor = Math.abs(hash) % LABEL_ALPHABET.length;
        label += LABEL_ALPHABET.charAt(cursor);
        hash = (hash * 1664525 + 1013904223) | 0;
    }

    return label;
}

function hashText(value: string): number {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return hash | 0;
}
