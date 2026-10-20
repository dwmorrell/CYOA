import { useState, type FormEvent } from 'react';
import type { Repo } from '../storage/repo';
import { Page } from './common';

/** First run: one parent profile (PIN-locked) and one child profile on this device. */
export function Setup({ repo, onDone }: { repo: Repo; onDone: () => void }) {
  const [child, setChild] = useState('');
  const [parent, setParent] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pin !== pin2) return setError('The two PINs are different.');
    try {
      await repo.setup(parent, pin, child);
      onDone();
    } catch (err) {
      setError((err as Error).message);
    }
  };
  return (
    <Page title="Welcome to Story Quest">
      <p>A grown-up sets this up once. The reader plays; the grown-up area is locked with a PIN.</p>
      <form className="form" onSubmit={submit}>
        <label htmlFor="child-name">Reader’s name</label>
        <input id="child-name" className="input" value={child} onChange={(e) => setChild(e.target.value)} autoComplete="off" required />
        <label htmlFor="parent-name">Grown-up’s name</label>
        <input id="parent-name" className="input" value={parent} onChange={(e) => setParent(e.target.value)} autoComplete="off" />
        <label htmlFor="pin">Grown-up PIN (4 to 8 digits)</label>
        <input id="pin" className="input" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} autoComplete="new-password" required />
        <label htmlFor="pin2">PIN again</label>
        <input id="pin2" className="input" type="password" inputMode="numeric" value={pin2} onChange={(e) => setPin2(e.target.value)} autoComplete="new-password" required />
        <p className="muted small">The PIN keeps the grown-up area separate from play. It is a lock for convenience, not a security measure.</p>
        <button type="submit" className="btn primary">
          Start
        </button>
        {error && (
          <p className="status bad" role="alert">
            {error}
          </p>
        )}
      </form>
    </Page>
  );
}
