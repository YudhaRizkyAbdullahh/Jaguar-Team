const puppeteer = require('puppeteer');

const PAGES = [
  '/html/index.html',
  '/html/menu.html',
  '/html/about.html',
  '/html/contact.html',
  '/html/reviews.html',
  '/html/checkout.html',
];

async function checkPage(browser, url) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');

  const consoleLogs = [];
  const pageErrors = [];
  page.on('console', msg => consoleLogs.push(`${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => pageErrors.push(err.message));

  const full = `http://localhost:8000${url}`;
  const result = { url: full, ok: false, reason: null, details: {}, console: [], errors: [] };

  try {
    const resp = await page.goto(full, { waitUntil: 'domcontentloaded', timeout: 10000 });
    result.status = resp && resp.status();

  // Wait a moment for scripts to initialize
  await new Promise(r => setTimeout(r, 250));

    // Query expected elements
    const hasToggle = await page.$('#mobile-toggle') !== null;
    const hasMenu = await page.$('#mobile-menu') !== null;
    const hasHamburger = await page.$('#hamburger') !== null;
    const hasClose = await page.$('#close-x') !== null;

    result.details.elements = { hasToggle, hasMenu, hasHamburger, hasClose };

    if (!hasToggle || !hasMenu) {
      result.reason = 'missing-toggle-or-menu';
      await page.close();
      result.console = consoleLogs;
      result.errors = pageErrors;
      return result;
    }

    const ariaBefore = await page.$eval('#mobile-toggle', el => el.getAttribute('aria-expanded'));

  // Click the toggle
  await page.click('#mobile-toggle');
  await new Promise(r => setTimeout(r, 450));

    const menuOpen = await page.$eval('#mobile-menu', el => el.classList.contains('menu-open') && !el.classList.contains('hidden'));
    const ariaAfter = await page.$eval('#mobile-toggle', el => el.getAttribute('aria-expanded'));
    const hamburgerHidden = await page.$eval('#hamburger', el => el.classList.contains('hidden'));
    const closeHidden = await page.$eval('#close-x', el => el.classList.contains('hidden'));

    result.details.interaction = { ariaBefore, ariaAfter, menuOpen, hamburgerHidden, closeHidden };

    // Basic pass condition
    if (ariaAfter === 'true' && menuOpen && hamburgerHidden && !closeHidden) {
      result.ok = true;
      result.reason = 'ok';
    } else {
      result.ok = false;
      result.reason = 'toggle-behavior-mismatch';
    }
  } catch (err) {
    result.reason = 'exception';
    result.exception = err && err.message;
  }

  result.console = consoleLogs;
  result.errors = pageErrors;
  try { await page.close(); } catch {}
  return result;
}

async function main() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const results = [];
  for (const p of PAGES) {
    // small delay between pages
    await new Promise(r => setTimeout(r, 200));
    const r = await checkPage(browser, p);
    results.push(r);
    console.log(JSON.stringify(r, null, 2));
  }
  await browser.close();

  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) {
    console.log(`\nHEADLESS CHECK: ${failed.length}/${results.length} pages FAILED`);
    process.exitCode = 2;
  } else {
    console.log(`\nHEADLESS CHECK: All ${results.length} pages passed`);
    process.exitCode = 0;
  }
}

main().catch(err => { console.error(err); process.exit(3); });
