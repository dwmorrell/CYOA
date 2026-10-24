// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { canSpeak, localVoices, speak, stopSpeaking } from '../../src/ui/speech';

function mockVoice(voiceURI: string, localService: boolean): SpeechSynthesisVoice {
  return { voiceURI, name: voiceURI, lang: 'en-US', localService, default: false } as SpeechSynthesisVoice;
}

interface Spoken {
  text: string;
  voice: SpeechSynthesisVoice | null;
  rate: number;
}

/** jsdom has no Web Speech API, so tests install a minimal stand-in and remove it afterwards. */
function installSpeechSynthesis(voices: SpeechSynthesisVoice[]) {
  const spoken: Spoken[] = [];
  const cancel = vi.fn();
  const synth = {
    cancel,
    getVoices: () => voices,
    speak: (u: SpeechSynthesisUtterance) => spoken.push({ text: u.text, voice: u.voice, rate: u.rate }),
  } as unknown as SpeechSynthesis;
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  class FakeUtterance {
    text: string;
    voice: SpeechSynthesisVoice | null = null;
    rate = 1;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(text: string) {
      this.text = text;
    }
  }
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: FakeUtterance, configurable: true });
  return { cancel, spoken };
}

afterEach(() => {
  Reflect.deleteProperty(window, 'speechSynthesis');
  Reflect.deleteProperty(window, 'SpeechSynthesisUtterance');
});

describe('read-aloud speech', () => {
  it('reports no support and no voices when the browser lacks speech synthesis', () => {
    expect(canSpeak()).toBe(false);
    expect(localVoices()).toEqual([]);
  });

  it('offers only on-device voices, never network ones, so read-aloud stays offline', () => {
    const local = mockVoice('local-1', true);
    const remote = mockVoice('remote-1', false);
    installSpeechSynthesis([local, remote]);
    expect(localVoices()).toEqual([local]);
  });

  it('speaks with the requested local voice and rate', () => {
    const local = mockVoice('local-1', true);
    const { spoken } = installSpeechSynthesis([local]);
    speak('hello there', () => undefined, { voiceURI: 'local-1', rate: 0.7 });
    expect(spoken).toEqual([{ text: 'hello there', voice: local, rate: 0.7 }]);
  });

  it('falls back to the device default voice and rate when none is requested', () => {
    const local = mockVoice('local-1', true);
    const { spoken } = installSpeechSynthesis([local]);
    speak('hello there', () => undefined);
    expect(spoken).toEqual([{ text: 'hello there', voice: null, rate: 0.85 }]);
  });

  it('falls back to the device default voice when the requested voiceURI is not an on-device voice', () => {
    const remote = mockVoice('remote-1', false);
    const { spoken } = installSpeechSynthesis([remote]);
    speak('hello there', () => undefined, { voiceURI: 'remote-1' });
    expect(spoken[0]!.voice).toBeNull();
  });

  it('cancels any speech in progress', () => {
    const { cancel } = installSpeechSynthesis([]);
    stopSpeaking();
    expect(cancel).toHaveBeenCalled();
  });
});
