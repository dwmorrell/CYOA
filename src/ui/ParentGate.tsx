import { useState, type FormEvent } from 'react';
import { BackBar, Page } from './common';
import { useApp } from './context';

export function ParentGate() {
  const { repo, unlockParent } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (await repo.verifyPin(pin)) unlockParent();
    else {
      setError('That PIN is not right.');
      setPin('');
    }
  };
  return (
    <Page title="Grown-up area" nav={<BackBar />}>
      <form className="form" onSubmit={submit}>
        <label htmlFor="gate-pin">Enter the grown-up PIN</label>
        <input id="gate-pin" className="input" type="password" inputMode="numeric" autoComplete="current-password" value={pin} onChange={(e) => setPin(e.target.value)} />
        <button type="submit" className="btn primary">
          Open
        </button>
        <p role="status" className="muted">
          {error}
        </p>
      </form>
    </Page>
  );
}
