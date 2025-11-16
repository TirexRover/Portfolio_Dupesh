export async function embedQuery(_text: string): Promise<number[] | null> {
  console.warn('Local embedding pipeline is disabled; AI API will be used for Q&A.');
  return null;
}
