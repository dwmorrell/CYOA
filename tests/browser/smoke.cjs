// Manual browser smoke test (not run in CI). Build and serve first:
//   npm run build && npx vite preview --port 4173
// then: NODE_PATH=$(npm root -g) node tests/browser/smoke.cjs
// Uses the preinstalled Chromium when present.
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const p = await b.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  p.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await p.goto('http://localhost:4173/', { waitUntil: 'load' });
  await p.waitForSelector('#child-name', { timeout: 15000 });
  await p.fill('#child-name', 'Ada');
  await p.fill('#parent-name', 'Sam');
  await p.fill('#pin', '2468');
  await p.fill('#pin2', '2468');
  await p.click('button[type=submit]');
  await p.waitForSelector('text=Hi Ada', { timeout: 15000 });
  console.log('library heading:', await p.textContent('h1'));
  await p.goto('http://localhost:4173/#/parent', { waitUntil: 'load' });
  await p.waitForSelector('#gate-pin', { timeout: 15000 });
  await p.fill('#gate-pin', '2468');
  await p.click('button:has-text("Open")');
  await p.waitForSelector('text=Grown-up area', { timeout: 15000 });
  console.log('grown-up heading:', await p.textContent('h1'));
  console.log('errors:', errors.length ? errors : 'none');
  await b.close();
  if (errors.length) process.exit(1);
})().catch((e) => {
  console.error('SMOKE FAILED', e.message);
  process.exit(1);
});
