// Typing practice is offered only when a hardware keyboard is likely. Browsers
// do not report a connected keyboard, so two signals are used: a fine pointer
// (a mouse or trackpad, as on a Chromebook) and a key a person pressed on this
// device, which is saved so it survives a reload. Neither is perfect: after a
// keyboard is unplugged the option can stay visible.

/** A key press from a physical keyboard, not a virtual keyboard or a script. */
export function isHardwareKey(e: KeyboardEvent): boolean {
  return e.isTrusted && e.key !== 'Unidentified' && e.keyCode !== 229;
}

export function pointerSuggestsKeyboard(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(any-pointer: fine)').matches;
}
