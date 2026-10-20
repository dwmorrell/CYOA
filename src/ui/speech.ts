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

/** Text read aloud for a page: its title and paragraphs. Choices are not read. */
export function pageSpeech(title: string | undefined, paragraphs: string[]): string {
  return [title ?? '', ...paragraphs].filter(Boolean).join(' ');
}
