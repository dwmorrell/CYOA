import { useEffect, useRef, type ReactNode } from 'react';
import { useApp } from './context';

/** Decorative symbol hidden from screen readers. */
export const Icon = ({ children }: { children: string }) => <span aria-hidden="true">{children}</span>;

/** Moves focus to the page heading whenever `focusKey` changes, so screen readers announce the new page. */
export function Page({ title, focusKey, className = 'library', children, nav }: { title: ReactNode; focusKey?: unknown; className?: string; children: ReactNode; nav?: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [focusKey]);
  return (
    <main id="main" className={className} tabIndex={-1}>
      {nav}
      <h1 ref={ref} tabIndex={-1}>
        {title}
      </h1>
      {children}
    </main>
  );
}

export function BackBar({ to = '#/', label = 'Library', extra }: { to?: string; label?: string; extra?: ReactNode }) {
  const { go } = useApp();
  return (
    <nav className="reader-bar" aria-label="Page controls">
      <button type="button" className="btn small" onClick={() => go(to)}>
        <Icon>← </Icon>
        {label}
      </button>
      {extra}
    </nav>
  );
}
