// Async key-value store backed by IndexedDB (master spec section 6). Falls
// back to memory when IndexedDB is unavailable (some private modes, managed
// Chromebooks), and says so, so the app can warn that progress won't persist.

export interface KvStore {
  readonly persistent: boolean;
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  /** Keys starting with prefix, sorted. */
  keys(prefix: string): Promise<string[]>;
}

export function memoryKv(): KvStore {
  const map = new Map<string, string>();
  return {
    persistent: false,
    get: async <T>(k: string) => {
      const raw = map.get(k);
      return raw === undefined ? undefined : (JSON.parse(raw) as T);
    },
    set: async (k, v) => void map.set(k, JSON.stringify(v)),
    delete: async (k) => void map.delete(k),
    keys: async (prefix) => [...map.keys()].filter((k) => k.startsWith(prefix)).sort(),
  };
}

const DB_NAME = 'story-quest';
const STORE = 'kv';

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function indexedDbKv(factory: IDBFactory = indexedDB, name = DB_NAME): Promise<KvStore> {
  const open = factory.open(name, 1);
  open.onupgradeneeded = () => open.result.createObjectStore(STORE);
  const db = await request(open);
  const tx = (mode: IDBTransactionMode) => db.transaction(STORE, mode).objectStore(STORE);
  return {
    persistent: true,
    get: async <T>(k: string) => (await request(tx('readonly').get(k))) as T | undefined,
    set: async (k, v) => void (await request(tx('readwrite').put(structuredClone(v), k))),
    delete: async (k) => void (await request(tx('readwrite').delete(k))),
    keys: async (prefix) => {
      const range = IDBKeyRange.bound(prefix, `${prefix}￿`);
      return ((await request(tx('readonly').getAllKeys(range))) as string[]).sort();
    },
  };
}

export async function openKv(): Promise<KvStore> {
  try {
    if (typeof indexedDB === 'undefined') return memoryKv();
    const kv = await indexedDbKv();
    // Ask the browser not to evict saves under storage pressure; best effort.
    void navigator.storage?.persist?.().catch(() => undefined);
    return kv;
  } catch {
    return memoryKv();
  }
}
