import { createContext, useContext } from 'react';
import type { ReadingPrefs } from '../engine/persistence';
import type { Profile, Repo } from '../storage/repo';
import type { Catalog } from './catalog';

export interface AppCtx {
  repo: Repo;
  profiles: Profile[];
  /** The child currently reading. */
  child: Profile;
  setChild: (id: string) => void;
  parentUnlocked: boolean;
  unlockParent: () => void;
  lockParent: () => void;
  prefs: ReadingPrefs;
  setPrefs: (p: ReadingPrefs) => void;
  catalog: Catalog;
  reloadProfiles: () => Promise<void>;
  go: (hash: string) => void;
}

export const AppContext = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp outside AppContext');
  return ctx;
}
