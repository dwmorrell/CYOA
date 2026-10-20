export type Route =
  | { view: 'library' }
  | { view: 'read'; id: string }
  | { view: 'preview'; id: string; source: 'device' | 'workshop' }
  | { view: 'settings' }
  | { view: 'log' }
  | { view: 'parent' }
  | { view: 'edit'; id: string };

export function parseRoute(hash: string): Route {
  const [, view, a, b] = (hash || '#/').split('/').map((p) => decodeURIComponent(p ?? ''));
  if (view === 'read' && a) return { view: 'read', id: a };
  if (view === 'preview' && a && b) return { view: 'preview', source: a === 'workshop' ? 'workshop' : 'device', id: b };
  if (view === 'settings') return { view: 'settings' };
  if (view === 'log') return { view: 'log' };
  if (view === 'parent' && a === 'edit' && b) return { view: 'edit', id: b };
  if (view === 'parent') return { view: 'parent' };
  return { view: 'library' };
}
