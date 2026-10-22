// Read-to-me uses the browser's own speech engine: no network, no AI service.

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}

/** On-device voices only: a network ("remote") voice would break the no-network rule. */
export function localVoices(): SpeechSynthesisVoice[] {
  return canSpeak() ? window.speechSynthesis.getVoices().filter((v) => v.localService) : [];
}

export function speak(text: string, onDone: () => void, options: { voiceURI?: string; rate?: number } = {}): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = options.rate ?? 0.85;
  const voice = options.voiceURI ? localVoices().find((v) => v.voiceURI === options.voiceURI) : undefined;
  if (voice) u.voice = voice;
  u.onend = onDone;
  u.onerror = onDone;
  window.speechSynthesis.speak(u);
}

/** Text read aloud for a page: its title and paragraphs. Choices are not read. */
export function pageSpeech(title: string | undefined, paragraphs: string[]): string {
  return [title ?? '', ...paragraphs].filter(Boolean).join(' ');
}
