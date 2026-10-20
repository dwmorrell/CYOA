// Optional headless browser smoke test (not run in CI). Needs Playwright installed globally
// and a running preview: npm run build && npx vite preview --port 4173, then
// node tests/browser/smoke.cjs <screenshot-dir>
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => {
  const browser = await chromium.launch();
  const out = [];
  for (const [name, opts] of [['Pixel 7 (Android phone)', devices['Pixel 7']], ['Chromebook-size 1366x768', { viewport: { width: 1366, height: 768 } }]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto('http://localhost:4173/');
    await page.waitForSelector('h1');
    out.push(`${name}: library h1="${await page.textContent('h1')}" text="${(await page.textContent('main')).slice(0, 80)}"`);
    await page.screenshot({ path: `${process.argv[2]}/${name.split(' ')[0]}-library.png` });
    await page.click('text=For grown-ups');
    await page.waitForSelector('#gate-answer');
    const q = await page.textContent('label[for=gate-answer]');
    const [a, b] = q.match(/(\d+) × (\d+)/).slice(1).map(Number);
    await page.fill('#gate-answer', String(a * b));
    await page.click('text=Continue');
    await page.waitForSelector('text=Parent studio');
    await page.click('text=Play preview');
    await page.waitForSelector('.page h1');
    out.push(`  preview first page: "${await page.textContent('.page h1')}", choices=${await page.locator('.choice').count()}, banner=${await page.locator('.banner').count()}`);
    await page.screenshot({ path: `${process.argv[2]}/${name.split(' ')[0]}-reader.png`, fullPage: true });
    // play: always pick first available choice until ending (max 30 steps)
    const found = new Set();
    let seed = 7;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648), seed / 2147483648);
    for (let run = 0; run < 12 && found.size < 3; run++) {
      for (let i = 0; i < 80; i++) {
        if (await page.locator('.ending').count()) break;
        const open = page.locator('.choice:not(.locked)');
        await open.nth(Math.floor(rnd() * (await open.count()))).click();
      }
      if (await page.locator('.ending').count()) found.add(await page.textContent('.page h1'));
      if (found.size < 3) await page.click('text=Play again');
    }
    out.push('  endings reached by random play: ' + [...found].join(' | '));
    out.push(`  reached: "${await page.textContent('.page h1')}" ending=${await page.locator('.ending').count()} ${await page.locator('.ending p').nth(1).textContent().catch(() => '')}`);
    await page.reload();
    await page.waitForSelector('h1');
    out.push(`  after reload: "${await page.textContent('h1')}"`);
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    out.push(`  horizontal overflow: ${scrollW}; page errors: ${errors.length ? errors.join(' | ') : 'none'}`);
    await ctx.close();
  }
  await browser.close();
  console.log(out.join('\n'));
})().catch((e) => { console.error(e); process.exit(1); });
