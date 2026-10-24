/* Проверка вёрстки: переполнения, размеры, адаптив */
const puppeteer = require('puppeteer-core');
const path = require('path');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto('http://127.0.0.1:8777/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  const report = async (label) => {
    const r = await page.evaluate(() => {
      const out = { overflowX: document.documentElement.scrollWidth > window.innerWidth, scrollW: document.documentElement.scrollWidth, win: window.innerWidth, issues: [] };
      const els = document.querySelectorAll('body *');
      for (const el of els) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.right > window.innerWidth + 2 || rect.left < -2) {
          out.issues.push(`${el.tagName}.${el.className || '-'} left=${Math.round(rect.left)} right=${Math.round(rect.right)}`);
        }
      }
      out.issues = out.issues.slice(0, 8);
      const g = document.querySelector('#grid');
      const cards = [...document.querySelectorAll('#grid .card')];
      const tops = new Set(cards.map(c => Math.round(c.getBoundingClientRect().top)));
      out.grid = { cols: tops.size, cards: cards.length };
      const hero = document.querySelector('.hero__title');
      out.hero = { fontSize: getComputedStyle(hero).fontSize, height: Math.round(hero.getBoundingClientRect().height) };
      const can = document.querySelector('.puck__can');
      out.can = { w: Math.round(can.getBoundingClientRect().width), h: Math.round(can.getBoundingClientRect().height) };
      const footer = document.querySelector('.footer__bottom');
      out.footerVisible = footer.getBoundingClientRect().height > 0;
      return out;
    });
    console.log(label, JSON.stringify(r, null, 1));
  };

  await report('DESKTOP 1440:');
  await page.setViewport({ width: 1024, height: 800 }); await new Promise(r => setTimeout(r, 300));
  await report('TABLET 1024:');
  await page.setViewport({ width: 390, height: 844 }); await new Promise(r => setTimeout(r, 300));
  await report('MOBILE 390:');

  // проверка открытия корзины и модалок на мобильном
  await page.evaluate(() => document.querySelector('#cart-open').click());
  await new Promise(r => setTimeout(r, 400));
  const cart = await page.evaluate(() => {
    const c = document.querySelector('#cart').getBoundingClientRect();
    return { left: Math.round(c.left), right: Math.round(c.right), width: Math.round(c.width), visible: c.left < window.innerWidth };
  });
  console.log('MOBILE CART:', JSON.stringify(cart));

  await browser.close();
})();
