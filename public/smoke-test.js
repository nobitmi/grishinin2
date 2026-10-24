/* Smoke-тест магазина на jsdom */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'http://localhost:8777/',
  pretendToBeVisual: true
});

const { window } = dom;
const doc = window.document;

const errors = [];
window.addEventListener('error', e => errors.push('window error: ' + e.message));
window.onerror = (m) => errors.push('onerror: ' + m);

window.addEventListener('load', () => {
  setTimeout(() => {
  try {
    window.localStorage.clear();

    const $ = s => doc.querySelector(s);
    const $$ = s => [...doc.querySelectorAll(s)];
    const ok = [];
    const fail = [];
    const check = (name, cond) => (cond ? ok : fail).push(name);

    check('каталог отрисован (8 карточек)', $$('#grid .card').length === 8);
    check('категории отрисованы', $$('#cats .cat').length === 5);
    check('вкусы Гришинина на карточке изолята', $$('#grid .card [data-pick]').length > 0);
    check('счётчик корзины 0', $('#cart-count').textContent === '0');
    check('бейдж скрыт при пустой корзине', $('#cart-count').classList.contains('is-empty'));

    // поиск
    $('#search').value = 'изолят';
    $('#search').dispatchEvent(new window.Event('input', { bubbles: true }));
    check('поиск «изолят» → 1 товар', $$('#grid .card').length === 1);
    $('#search').value = '';
    $('#search').dispatchEvent(new window.Event('input', { bubbles: true }));
    check('сброс поиска → 8 товаров', $$('#grid .card').length === 8);

    // фильтр по категории
    $$('#cats .cat').find(c => c.dataset.cat === 'accessory').dispatchEvent(new window.Event('click', { bubbles: true }));
    check('категория «Аксессуары» → 1 товар', $$('#grid .card').length === 1);
    check('показаны чипсы фильтра', $$('#active-filters .chip-filter').length === 1);

    // сортировка
    $('#sort').value = 'cheap';
    $('#sort').dispatchEvent(new window.Event('change', { bubbles: true }));
    const prices = $$('#grid .price-box__now').map(e => parseInt(e.textContent.replace(/\D/g, ''), 10));
    check('сортировка по цене работает', prices.every((v, i) => i === 0 || prices[i - 1] <= v));

    // выбор вкуса + добавление в корзину
    $$('#cats .cat').find(c => c.dataset.cat === 'all').dispatchEvent(new window.Event('click', { bubbles: true }));
    const isolateCard = $$('#grid .card').find(c => c.textContent.includes('Изолят'));
    const chip = isolateCard.querySelector('[data-pick]');
    chip.dispatchEvent(new window.Event('click', { bubbles: true }));
    check('вкус выбран (is-active)', chip.classList.contains('is-active'));
    isolateCard.querySelector('[data-add]').dispatchEvent(new window.Event('click', { bubbles: true }));
    check('товар в корзине', $('#cart-count').textContent === '1');

    // открытие корзины
    $('#cart-open').dispatchEvent(new window.Event('click', { bubbles: true }));
    check('корзина открыта', $('#cart').classList.contains('is-open'));
    check('позиция в корзине', $$('#cart-body .cart-item').length === 1);
    check('сумма > 0', parseInt($('#sum-total').textContent.replace(/\D/g, ''), 10) > 0);

    // промокод
    $('#promo').value = 'grisha';
    $('#promo-apply').dispatchEvent(new window.Event('click', { bubbles: true }));
    check('промокод GRISHA применён', $('#promo-msg').textContent.includes('10%'));
    check('скидка показана', $('#disc-row').hidden === false);

    // количество
    const plus = $('#cart-body [data-plus]');
    plus.dispatchEvent(new window.Event('click', { bubbles: true }));
    check('количество 2', $('#cart-count').textContent === '2');

    // оформление заказа
    $('#checkout').dispatchEvent(new window.Event('click', { bubbles: true }));
    check('форма заказа открыта', $('#order-modal').hidden === false);
    const form = $('#order-form');
    form.querySelector('[name="name"]').value = 'Иван';
    form.querySelector('[name="phone"]').value = '+7 917 555-24-17';
    form.querySelector('[name="addr"]').value = 'г. Белорецк, ул. Советская, 42';
    form.querySelector('[name="agree"]').checked = true;
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    check('заказ оформлен (экран успеха)', $('#success').hidden === false);
    check('номер заказа БР-', $('#success-title').textContent.includes('БР-'));
    check('корзина очищена', $('#cart-count').textContent === '0');

    // модалка товара
    const card = $$('#grid .card')[0];
    card.querySelector('.card__name').dispatchEvent(new window.Event('click', { bubbles: true }));
    check('модалка товара открыта', $('#product-modal').hidden === false);
    check('в модалке есть вкусы', $$('#product-card [data-pick]').length > 0);
    $('#product-card [data-add]').dispatchEvent(new window.Event('click', { bubbles: true }));
    check('добавление из модалки', $('#cart-count').textContent === '1');

    console.log('ПРОЙДЕНО (' + ok.length + '):');
    ok.forEach(o => console.log('  ✓ ' + o));
    if (fail.length) {
      console.log('ПРОВАЛЕНО (' + fail.length + '):');
      fail.forEach(f => console.log('  ✗ ' + f));
    }
    if (errors.length) {
      console.log('ОШИБКИ:');
      errors.forEach(e => console.log('  ! ' + e));
    }
    process.exit(fail.length || errors.length ? 1 : 0);
  } catch (e) {
    console.error('CRASH:', e);
    process.exit(1);
  }
  }, 200);
}, 300);
