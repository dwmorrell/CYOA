import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReadingPrefs } from '../engine/persistence';
import type { Profile, Repo } from '../storage/repo';
import { AdventureLog } from './AdventureLog';
import type { Catalog } from './catalog';
import { AppContext, type AppCtx } from './context';
import { Library } from './Library';
import { ParentGate } from './ParentGate';
import { applyPrefs } from './prefs';
import { PlayChild, PlayPreview } from './Play';
import { parseRoute, type Route } from './routes';
import { Settings } from './Settings';
import { Setup } from './Setup';
import { stopSpeaking } from './speech';

// The parent area (editor, validators) is loaded only when a parent opens it,
// so the child's first load stays small.
const ParentHome = lazy(() => import('./parent/ParentHome'));
const StoryEditor = lazy(() => import('./parent/StoryEditor'));

const LAST_CHILD = 'cyoa:last-child';

export function App({ repo, catalog }: { repo: Repo; catalog: Catalog }) {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [childId, setChildId] = useState<string | null>(null);
  const [prefs, setPrefsState] = useState<ReadingPrefs | null>(null);
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [route, setRoute] = useState<Route>(() => parseRoute(location.hash));

  const reloadProfiles = useCallback(async () => setProfiles(await repo.profiles()), [repo]);
  useEffect(() => void reloadProfiles(), [reloadProfiles]);

  useEffect(() => {
    const onHash = () => {
      stopSpeaking();
      setRoute(parseRoute(location.hash));
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('pagehide', stopSpeaking);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('pagehide', stopSpeaking);
    };
  }, []);

  const children = useMemo(() => (profiles ?? []).filter((p) => p.kind === 'child'), [profiles]);
  const child = children.find((c) => c.id === childId) ?? children.find((c) => c.id === safeGet(LAST_CHILD)) ?? children[0];

  useEffect(() => {
    if (!child) return;
    let live = true;
    void repo.prefs(child.id).then((p) => {
      if (!live) return;
      setPrefsState(p);
      applyPrefs(document.documentElement, p);
    });
    return () => {
      live = false;
    };
  }, [repo, child]);

  const go = useCallback((hash: string) => {
    if (location.hash === hash) setRoute(parseRoute(hash));
    else location.hash = hash;
  }, []);

  if (profiles === null) return <Loading />;
  if (!child) return <Setup repo={repo} onDone={reloadProfiles} />;
  if (!prefs) return <Loading />;

  const ctx: AppCtx = {
    repo,
    profiles,
    child,
    setChild: (id) => {
      safeSet(LAST_CHILD, id);
      setChildId(id);
    },
    parentUnlocked,
    unlockParent: () => setParentUnlocked(true),
    lockParent: () => setParentUnlocked(false),
    prefs,
    setPrefs: (p) => {
      setPrefsState(p);
      applyPrefs(document.documentElement, p);
      void repo.setPrefs(child.id, p);
    },
    catalog,
    reloadProfiles,
    go,
  };

  const parentOnly = route.view === 'parent' || route.view === 'edit' || route.view === 'preview';
  let view;
  if (parentOnly && !parentUnlocked) view = <ParentGate />;
  else if (route.view === 'read') view = <PlayChild key={`${child.id}:${route.id}`} storyId={route.id} />;
  else if (route.view === 'preview') view = <PlayPreview key={`${route.source}:${route.id}`} source={route.source} storyId={route.id} />;
  else if (route.view === 'settings') view = <Settings />;
  else if (route.view === 'log') view = <AdventureLog />;
  else if (route.view === 'parent') view = <ParentHome />;
  else if (route.view === 'edit') view = <StoryEditor key={route.id} storyId={route.id} />;
  else view = <Library />;

  return (
    <AppContext.Provider value={ctx}>
      {!repo.kv.persistent && (
        <p className="banner" role="note">
          This browser is not letting the game save on this device, so progress will be lost when the page closes.
        </p>
      )}
      <Suspense fallback={<Loading />}>{view}</Suspense>
    </AppContext.Provider>
  );
}

export function Loading() {
  return (
    <main id="main" className="library" tabIndex={-1}>
      <p role="status">Loading…</p>
    </main>
  );
}

// The last-used child is a UI convenience only; losing it is harmless.
function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}
