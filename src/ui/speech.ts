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
