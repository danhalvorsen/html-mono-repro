const WHITESPACE = /\s/;

/**
 * Splits a CLI string into arguments, honoring quoted segments and escaping.
 */
export function tokenizeInput(input: string): string[] {
  const tokens: string[] = [];
  let buffer = '';
  let inQuotes = false;
  let quoteChar = '';
  let escaping = false;

  const flush = () => {
    if (buffer.length > 0) {
      tokens.push(buffer);
      buffer = '';
    }
  };

  for (const char of input) {
    if (escaping) {
      buffer += char;
      escaping = false;
      continue;
    }

    if (char === '\\') {
      escaping = true;
      continue;
    }

    if (inQuotes) {
      if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
        continue;
      }
      buffer += char;
      continue;
    }

    if (char === '"' || char === "'") {
      inQuotes = true;
      quoteChar = char;
      continue;
    }

    if (WHITESPACE.test(char)) {
      flush();
      continue;
    }

    buffer += char;
  }

  flush();
  return tokens;
}
