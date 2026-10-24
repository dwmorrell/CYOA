import '@fontsource/lexend/400.css';
import '@fontsource/lexend/700.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import './styles.css';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { Repo } from './storage/repo';
import { openKv } from './storage/kv';
import { App } from './ui/App';
import { fetchCatalog, type Catalog } from './ui/catalog';

// Entry point: open on-device storage, load the packaged story list, render.
// Everything runs in the browser; there is no server or runtime AI.

const root = createRoot(document.getElementById('app')!);

async function start(): Promise<void> {
  const repo = new Repo(await openKv());
  let catalog: Catalog;
  try {
    catalog = await fetchCatalog();
  } catch {
    // Offline with nothing cached: device-library stories still work.
    catalog = { catalogVersion: 1, published: [], previews: [] };
  }
  root.render(<App repo={repo} catalog={catalog} />);
}

void start().catch((e: unknown) => {
  root.render(
    <main id="main" className="library">
      <h1>Story Quest could not start</h1>
      <p>{e instanceof Error ? e.message : String(e)}</p>
      <button type="button" className="btn" onClick={() => location.reload()}>
        Try again
      </button>
    </main>,
  );
});

registerSW({ immediate: true });
