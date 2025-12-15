export function boxText(
  text: string,
  opts?: { borderChar?: string }
): string {
  const border = opts?.borderChar ?? "─";

  const lines = text.split("\n");
  const maxLen = Math.max(...lines.map(l => l.length));

  // top & bottom borders
  const top = border.repeat(maxLen + 4);
  const bottom = top;

  const body = lines
    .map(line => `│ ${line.padEnd(maxLen)} │`)
    .join("\n");

  return `${top}\n${body}\n${bottom}`;
}
