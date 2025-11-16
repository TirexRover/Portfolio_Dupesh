const WORD_REGEX = /[\p{L}\p{N}]+/gu;

export function tokenize(input: string): string[] {
  return (input.match(WORD_REGEX) || []).map((word) => word.toLowerCase());
}

export function chunkText(paragraph: string, size = 320, overlap = 60): string[] {
  const words = tokenize(paragraph);
  if (!words.length) return [];
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += size - overlap) {
    const slice = words.slice(i, i + size);
    chunks.push(slice.join(' '));
    if (i + size >= words.length) break;
  }
  return chunks;
}

export function highlight(text: string, query: string): string {
  const parts = tokenize(query);
  if (!parts.length) return text;
  const pattern = new RegExp(`(${parts.join('|')})`, 'gi');
  return text.replace(pattern, '<mark>$1</mark>');
}
