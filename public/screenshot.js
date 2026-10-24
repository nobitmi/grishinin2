/* Скриншоты магазина (Edge через puppeteer-core) */
const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = __dirname;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  await page.goto('http://127.0.0.1:8777/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  await page.screenshot({ path: path.join(OUT, '01-hero.png') });

  await page.evaluate(() => document.querySelector('#catalog').scrollIntoView());
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT, '02-catalog.png') });

  // добавить в корзину и открыть её
  await page.evaluate(() => {
    const card = [...document.querySelectorAll('#grid .card')].find(c => c.textContent.includes('Изолят'));
    card.querySelector('[data-add]').click();
    card.querySelector('[data-pick][data-flavor="Шоколад"]').click();
    card.querySelector('[data-add]').click();
  });
  await new Promise(r => setTimeout(r, 300));
  await page.click('#cart-open');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, '03-cart.png') });

  // модалка товара
  await page.evaluate(() => document.querySelector('#cart-close').click());
  await page.evaluate(() => {
    [...document.querySelectorAll('#grid .card')].find(c => c.textContent.includes('Изолят')).querySelector('.card__name').click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUT, '04-product.png') });

  // форма заказа
  await page.evaluate(() => document.querySelector('[data-close="product-modal"]').click());
  await page.evaluate(() => {
    document.querySelector('#cart-open').click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => document.querySelector('#checkout').click());
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUT, '05-order.png') });

  // блок «о бренде»
  await page.evaluate(() => {
    document.querySelector('[data-close="order-modal"]').click();
    document.querySelector('#about').scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT, '06-about.png') });

  // мобильная версия
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, '07-mobile.png') });

  console.log(errors.length ? 'ОШИБКИ КОНСОЛИ:\n' + errors.join('\n') : 'Ошибок в консоли нет');
  await browser.close();
})();
