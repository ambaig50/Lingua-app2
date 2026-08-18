/**
 * Reflows raw OCR line output into clean, translatable prose.
 *
 * Problem: OCR returns text one physical line at a time, exactly as it
 * wrapped in the photographed page/sign/label. If we join those lines with
 * "\n", a sentence that happened to wrap mid-sentence in the image gets cut
 * into two fragments. Translating a fragment on its own often produces
 * output that isn't a real sentence.
 *
 * Fix: treat OCR lines as soft-wrapped text. Join them with spaces so
 * sentences reconnect, but still start a new paragraph when a line clearly
 * ends a thought (ends in ./!/?/:) or the source had a blank line.
 */
export function cleanScannedText(lines: string[]): string {
  const trimmedLines = lines.map(l => l.trim()).filter(l => l.length > 0);
  if (trimmedLines.length === 0) return '';

  let result = '';

  for (let i = 0; i < trimmedLines.length; i++) {
    let line = trimmedLines[i];

    // Fix hyphenated word breaks e.g. "trans-" + "lation" -> "translation"
    if (line.endsWith('-') && i < trimmedLines.length - 1) {
      line = line.slice(0, -1);
      result += line;
      continue; // no space, next line continues the word
    }

    result += line;

    const endsThought = /[.!?:؟۔]$/.test(line);
    const isLast = i === trimmedLines.length - 1;

    if (!isLast) {
      result += endsThought ? '\n\n' : ' ';
    }
  }

  return normalizeWhitespace(result);
}

/** Collapses accidental double spaces/newlines left over from cleanup. */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
