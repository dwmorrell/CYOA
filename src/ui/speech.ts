// Read-to-me uses the browser's own speech engine: no network, no AI service.

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}

export function speak(text: string, onDone: () => void): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.85;
  u.onend = onDone;
  u.onerror = onDone;
  window.speechSynthesis.speak(u);
}

/**
 * Text read aloud for a page: the title, the paragraphs, and any typing prompt
 * still open. The prompt is read so a child using read-aloud hears what to type,
 * and the word "optional" is spoken with it.
 */
export function pageSpeech(title: string | undefined, paragraphs: string[], openPuzzlePrompt?: string): string {
  const puzzle = openPuzzlePrompt ? `Optional typing: ${openPuzzlePrompt} You can skip this and carry on.` : '';
  return [title ?? '', ...paragraphs, puzzle].filter(Boolean).join(' ');
}
