/* Гришинин — логика магазина */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = {
  category: 'all',
  query: '',
  sort: 'popular',
  priceMin: null,
  priceMax: null,
  onlyStock: true,
  onlyHit: false,
  cart: load('grishinin_cart', []),
  promo: load('grishinin_promo', null),
  selected: {} // id -> выбранный вкус
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* приватный режим */ }
}

const money = (n) => n.toLocaleString('ru-RU') + ' ₽';

/* ---------------- Каталог ---------------- */

function categoryTitle(id) {
  const c = CATEGORIES.find(c => c.id === id);
  return c ? c.title : '';
}

function countByCategory(cat) {
  return PRODUCTS.filter(p => cat === 'all' || p.category === cat).length;
}

function getVisible() {
  const q = state.query.trim().toLowerCase();
  let list = PRODUCTS.filter(p => {
    if (state.category !== 'all' && p.category !== state.category) return false;
    if (state.priceMin !== null && p.price < state.priceMin) return false;
    if (state.priceMax !== null && p.price > state.priceMax) return false;
    if (state.onlyStock && p.stock <= 0) return false;
    if (state.onlyHit && !p.badge) return false;
    if (q) {
      const hay = [p.name, p.brand, p.desc, p.weight, categoryTitle(p.category),
        ...p.flavors.map(f => f.name)].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sorters = {
    popular: (a, b) => b.reviews - a.reviews,
    cheap: (a, b) => a.price - b.price,
    expensive: (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    discount: (a, b) => disc(b) - disc(a)
  };
  return list.sort(sorters[state.sort]);
}

const disc = (p) => (p.oldPrice ? p.oldPrice - p.price : 0);

function visualFor(p, flavorName) {
  const flavor = p.flavors.find(f => f.name === flavorName);
  const src = (flavor && flavor.image) || p.image;
  if (src) {
    const alt = flavor ? `${p.name} — ${flavor.name}` : p.name;
    return `<img class="product-img" src="${encodeURI(src)}" alt="${alt}" loading="lazy">`;
  }
  if (p.category === 'protein' || p.category === 'gainers' || p.category === 'amino') {
    const cls = p.category === 'amino' ? 'jug--wide' : '';
    return `<div class="jug ${cls}"><span>ГРИШИНИН</span></div>`;
  }
  if (p.id === 'protein-bar') return `<div class="jug jug--bar"><span>ГРИШИНИН</span></div>`;
  return `<div class="jug jug--wide"><span>ГРИШИНИН</span></div>`;
}

function renderCats() {
  $('#cats').innerHTML = CATEGORIES.map(c => `
    <div class="cat ${state.category === c.id ? 'is-active' : ''}" data-cat="${c.id}">
      <span>${c.title}</span><span class="cat__n">${countByCategory(c.id)}</span>
    </div>`).join('');
}

function renderChips() {
  const chips = [];
  if (state.category !== 'all') chips.push({ t: categoryTitle(state.category), k: 'category' });
  if (state.query) chips.push({ t: `«${state.query}»`, k: 'query' });
  if (state.priceMin !== null) chips.push({ t: `от ${money(state.priceMin)}`, k: 'priceMin' });
  if (state.priceMax !== null) chips.push({ t: `до ${money(state.priceMax)}`, k: 'priceMax' });
  if (state.onlyHit) chips.push({ t: 'хиты и новинки', k: 'onlyHit' });

  $('#active-filters').innerHTML = chips.map(c => `
    <span class="chip-filter">${c.t}<button data-clear="${c.k}" aria-label="Сбросить">×</button></span>
  `).join('');
}

function renderGrid() {
  const list = getVisible();
  const grid = $('#grid');
  $('#empty').hidden = list.length > 0;
  $('#catalog-sub').textContent = `Найдено товаров: ${list.length} · Производство: г. Белорецк · автор Гриша`;

  grid.innerHTML = list.map(p => {
    const flavors = p.flavors.map(f => `
      <span class="flavor ${state.selected[p.id] === f.name ? 'is-active' : ''}" data-pick="${p.id}" data-flavor="${f.name}">
        <i style="--c:${f.color}"></i>${f.name}
      </span>`).join('');

    return `
    <article class="card">
      <div class="card__media" data-open="${p.id}">
        ${p.badge ? `<span class="card__badge ${p.oldPrice ? 'card__badge--old' : ''}">${p.badge}</span>` : ''}
        <span class="card__stock">${p.stock > 0 ? `в наличии ${p.stock}` : 'нет в наличии'}</span>
        <div class="card__visual">${visualFor(p, getFlavor(p))}</div>
      </div>
      <div class="card__body">
        <span class="card__brand">${p.brand}</span>
        <h3 class="card__name" data-open="${p.id}">${p.name}</h3>
        <div class="card__meta">
          <span class="rating">★ ${p.rating.toFixed(1)}</span>
          <span>${p.reviews} отзывов</span>
          <span>· ${p.weight}</span>
        </div>
        <span class="card__made">Сделано в ${p.madeIn} · автор ${p.author}</span>
        <div class="flavors">${flavors}</div>
        <div class="card__foot">
          <div class="price-box">
            <span class="price-box__now">${money(p.price)}</span>
            ${p.oldPrice ? `<span class="price-box__old">${money(p.oldPrice)}</span>` : ''}
          </div>
          <div class="card__btns">
            <button class="btn btn--ghost btn--sm" data-open="${p.id}">Подробнее</button>
            <button class="btn btn--lime btn--sm" data-add="${p.id}">В корзину</button>
          </div>
        </div>
      </div>
    </article>`;
  }).join('');
}

function renderAll() {
  renderCats();
  renderChips();
  renderGrid();
}

/* ---------------- Корзина ---------------- */

function cartKey(item) { return `${item.id}::${item.flavor}`; }

function getFlavor(p) {
  return state.selected[p.id] || (p.flavors[0] && p.flavors[0].name) || 'Стандарт';
}

function addToCart(id, flavor) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const fl = flavor || getFlavor(p);
  const key = cartKey({ id, flavor: fl });
  const found = state.cart.find(i => cartKey(i) === key);
  if (found) {
    if (found.qty >= p.stock) return toast(`Больше нет в наличии: ${p.name}`);
    found.qty += 1;
  } else {
    if (p.stock <= 0) return toast(`${p.name} — нет в наличии`);
    state.cart.push({ id, flavor: fl, qty: 1 });
  }
  save('grishinin_cart', state.cart);
  renderCart();
  toast(`${p.name} (${fl}) — в корзине`);
}

function changeQty(key, delta) {
  const item = state.cart.find(i => cartKey(i) === key);
  if (!item) return;
  const p = PRODUCTS.find(x => x.id === item.id);
  item.qty += delta;
  if (item.qty > p.stock) { item.qty = p.stock; toast('Достигнут предел по складу в Белорецке'); }
  if (item.qty <= 0) state.cart = state.cart.filter(i => cartKey(i) !== key);
  save('grishinin_cart', state.cart);
  renderCart();
}

function removeItem(key) {
  state.cart = state.cart.filter(i => cartKey(i) !== key);
  save('grishinin_cart', state.cart);
  renderCart();
}

function totals() {
  const goods = state.cart.reduce((sum, i) => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  let ship = goods >= 2000 || goods === 0 ? 0 : 250;
  let discPct = state.promo && PROMOS[state.promo] ? PROMOS[state.promo] : 0;
  const discount = Math.round(goods * discPct / 100);
  return { goods, count, ship, discPct, discount, total: goods + ship - discount };
}

function renderCart() {
  const body = $('#cart-body');
  const t = totals();

  if (!state.cart.length) {
    body.innerHTML = `<div class="cart-empty">
      <b>Корзина пуста</b>
      <p>Добавьте протеин Гришинин или аксессуары из Белорецка</p>
      <button class="btn btn--lime" data-close-cart>К каталогу</button>
    </div>`;
  } else {
    body.innerHTML = state.cart.map(i => {
      const p = PRODUCTS.find(x => x.id === i.id);
      if (!p) return '';
      const swatch = p.flavors.find(f => f.name === i.flavor);
      const cimg = swatch && swatch.image ? swatch.image : p.image;
      return `
      <div class="cart-item">
        <div class="cart-item__img"><img src="${encodeURI(cimg)}" alt="${p.name} ${i.flavor}" loading="lazy"></div>
        <div>
          <div class="cart-item__name">${p.name}</div>
          <div class="cart-item__flavor">${i.flavor} · ${p.weight}</div>
          <div class="cart-item__price">${money(p.price * i.qty)}</div>
          <button class="cart-item__del" data-del="${cartKey(i)}">Удалить</button>
        </div>
        <div class="qty">
          <button data-minus="${cartKey(i)}">−</button>
          <span>${i.qty}</span>
          <button data-plus="${cartKey(i)}">+</button>
        </div>
      </div>`;
    }).join('');
  }

  $('#cart-count').textContent = t.count;
  $('#cart-count').classList.toggle('is-empty', t.count === 0);
  $('#sum-goods').textContent = money(t.goods);
  $('#sum-ship').textContent = t.ship === 0 ? 'бесплатно' : money(t.ship);
  $('#disc-row').hidden = !t.discount;
  $('#sum-disc').textContent = '−' + money(t.discount);
  $('#sum-total').textContent = money(t.total);
  $('#checkout').disabled = t.count === 0;
  $('#checkout').style.opacity = t.count === 0 ? '.5' : '1';
}

/* ---------------- Модалка товара ---------------- */

function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const card = $('#product-card');
  const cur = getFlavor(p);

  card.innerHTML = `
    <button class="icon-btn modal__close" data-close="product-modal" aria-label="Закрыть">
      <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <div class="pm">
      <div class="pm__media">${visualFor(p, cur)}</div>
      <div>
        <span class="card__brand">${p.brand}</span>
        <h2 class="pm__title">${p.name}</h2>
        <div class="card__meta">
          <span class="rating">★ ${p.rating.toFixed(1)}</span><span>${p.reviews} отзывов</span>
          <span>· ${p.weight}</span><span>· остаток ${p.stock} шт.</span>
        </div>
        <p class="pm__desc">${p.desc}</p>
        <div class="pm__specs">
          <div class="spec"><b>${p.protein}</b><span>белок</span></div>
          <div class="spec"><b>${p.carbs}</b><span>углеводы</span></div>
          <div class="spec"><b>${p.fat}</b><span>жиры</span></div>
          <div class="spec"><b>${p.kcal}</b><span>ккал</span></div>
        </div>
        <div class="pm__label">Выберите вкус</div>
        <div class="flavors">
          ${p.flavors.map(f => `
            <span class="flavor ${cur === f.name ? 'is-active' : ''}" data-pick="${p.id}" data-flavor="${f.name}">
              <i style="--c:${f.color}"></i>${f.name}
            </span>`).join('')}
        </div>
        <div class="pm__buy">
          <div class="pm__price">${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}${money(p.price)}</div>
          <button class="btn btn--lime btn--lg" data-add="${p.id}">В корзину</button>
        </div>
        <div class="pm__made">Произведено в <b>${p.madeIn}</b> · автор продукции — <b>${p.author}</b> · ${BRAND.tagline}</div>
      </div>
    </div>`;

  $('#product-modal').hidden = false;
  document.body.classList.add('is-locked');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
  if ($('#order-modal').hidden && $('#product-modal').hidden) {
    document.body.classList.remove('is-locked');
    if (!document.querySelector('.cart.is-open')) document.body.classList.remove('is-locked');
  }
}

/* ---------------- Корзина / модалки: открытие ---------------- */

function openCart() {
  $('#cart').classList.add('is-open');
  $('#cart').setAttribute('aria-hidden', 'false');
  $('#overlay').hidden = false;
  document.body.classList.add('is-locked');
}
function closeCart() {
  $('#cart').classList.remove('is-open');
  $('#cart').setAttribute('aria-hidden', 'true');
  if (!isAnyModalOpen()) $('#overlay').hidden = true;
  document.body.classList.remove('is-locked');
}
function isAnyModalOpen() {
  return !$('#product-modal').hidden || !$('#order-modal').hidden;
}

/* ---------------- Тост ---------------- */

let toastTimer;
function toast(text) {
  const t = $('#toast');
  t.textContent = text;
  t.hidden = false;
  requestAnimationFrame(() => t.classList.add('is-show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove('is-show');
    setTimeout(() => { t.hidden = true; }, 250);
  }, 2200);
}

/* ---------------- Промокод ---------------- */

function applyPromo() {
  const code = ($('#promo').value || '').trim().toUpperCase();
  const msg = $('#promo-msg');
  if (!code) { msg.textContent = 'Введите промокод'; msg.classList.add('is-bad'); return; }
  if (!PROMOS[code]) {
    msg.textContent = `Промокод «${code}» не найден`;
    msg.classList.add('is-bad');
    state.promo = null;
  } else {
    state.promo = code;
    save('grishinin_promo', code);
    msg.textContent = `Промокод применён — скидка ${PROMOS[code]}%`;
    msg.classList.remove('is-bad');
    toast(`Скидка ${PROMOS[code]}% по промокоду ${code}`);
  }
  renderCart();
}

/* ---------------- Заказ ---------------- */

function openCheckout() {
  if (!state.cart.length) return;
  closeCart();
  $('#order-form').hidden = false;
  $('#success').hidden = true;
  $('#order-modal').hidden = false;
  document.body.classList.add('is-locked');
}

function submitOrder(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  let ok = true;

  $$('input[required]', form).forEach(input => {
    const bad = !input.value.trim() || (input.type === 'checkbox' && !input.checked);
    input.classList.toggle('is-error', bad);
    if (bad) ok = false;
  });

  const phone = (data.get('phone') || '').replace(/\D/g, '');
  if (phone.length < 10) {
    const tel = form.querySelector('[name="phone"]');
    tel.classList.add('is-error');
    ok = false;
  }

  if (!ok) return toast('Проверьте заполнение полей');

  const t = totals();
  const num = 'БР-' + String(Date.now()).slice(-6);
  const list = state.cart.map(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return `${p.name} (${i.flavor}) — ${i.qty} шт. × ${money(p.price)}`;
  }).join('; ');

  $('#order-form').hidden = true;
  $('#success').hidden = false;
  $('#success-title').textContent = `Заказ ${num} принят!`;
  $('#success-text').innerHTML = `
    Спасибо, ${data.get('name')}! Гриша уже собирает заказ на производстве в Белорецке.<br><br>
    <b>${list}</b><br><br>
    Доставка: ${data.get('addr')}<br>
    Оплата: ${data.get('pay')}<br>
    К оплате: <b>${money(t.total)}</b>${t.discount ? ` (скидка ${t.discount} ₽)` : ''}<br>
    ${data.get('note') ? `Комментарий: ${data.get('note')}<br>` : ''}
    Свяжемся по телефону ${data.get('phone')}.`;

  state.cart = [];
  state.promo = null;
  save('grishinin_cart', state.cart);
  save('grishinin_promo', null);
  $('#promo').value = '';
  $('#promo-msg').textContent = '';
  renderCart();
  toast('Заказ оформлен');
}

/* ---------------- События ---------------- */

document.addEventListener('click', (e) => {
  const t = e.target;

  const cat = t.closest('[data-cat]');
  if (cat) {
    state.category = cat.dataset.cat;
    renderAll();
    syncNav();
    return;
  }

  const add = t.closest('[data-add]');
  if (add) {
    const id = add.dataset.add;
    const flavor = add.dataset.flavor || getFlavor(PRODUCTS.find(p => p.id === id));
    if (add.dataset.flavor) state.selected[id] = add.dataset.flavor;
    addToCart(id, flavor);
    return;
  }

  const pick = t.closest('[data-pick]');
  if (pick) {
    const id = pick.dataset.pick;
    state.selected[id] = pick.dataset.flavor;
    $$(`[data-pick="${id}"]`).forEach(el => {
      el.classList.toggle('is-active', el.dataset.flavor === pick.dataset.flavor);
    });
    const p = PRODUCTS.find(x => x.id === id);
    if (p) {
      const img = visualFor(p, pick.dataset.flavor);
      const card = pick.closest('.card');
      const cardVisual = card && card.querySelector('.card__visual');
      if (cardVisual) cardVisual.innerHTML = img;
      const modal = pick.closest('#product-card');
      const modalVisual = modal && modal.querySelector('.pm__media');
      if (modalVisual) modalVisual.innerHTML = img;
    }
    return;
  }

  const open = t.closest('[data-open]');
  if (open) { openProduct(open.dataset.open); return; }

  const close = t.closest('[data-close]');
  if (close) { closeModal(close.dataset.close); return; }

  if (t.closest('[data-close-cart]')) { closeCart(); document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' }); return; }

  const plus = t.closest('[data-plus]');
  if (plus) { changeQty(plus.dataset.plus, 1); return; }

  const minus = t.closest('[data-minus]');
  if (minus) { changeQty(minus.dataset.minus, -1); return; }

  const del = t.closest('[data-del]');
  if (del) { removeItem(del.dataset.del); return; }

  const clear = t.closest('[data-clear]');
  if (clear) {
    const k = clear.dataset.clear;
    if (k === 'category') state.category = 'all';
    if (k === 'query') { state.query = ''; $('#search').value = ''; }
    if (k === 'priceMin') { state.priceMin = null; $('#price-min').value = ''; }
    if (k === 'priceMax') { state.priceMax = null; $('#price-max').value = ''; }
    if (k === 'onlyHit') { state.onlyHit = false; $('#only-hit').checked = false; }
    renderAll();
    syncNav();
    return;
  }

  const nav = t.closest('[data-nav]');
  if (nav) {
    const id = nav.dataset.nav;
    state.category = id === 'all' ? 'all' : id;
    renderAll();
    syncNav();
  }
});

$('#cart-open').addEventListener('click', openCart);
$('#cart-close').addEventListener('click', closeCart);
$('#overlay').addEventListener('click', () => { closeCart(); });
$('#checkout').addEventListener('click', openCheckout);
$('#promo-apply').addEventListener('click', applyPromo);
$('#promo').addEventListener('keydown', (e) => { if (e.key === 'Enter') applyPromo(); });

$('#search').addEventListener('input', (e) => {
  state.query = e.target.value;
  renderChips();
  renderGrid();
});

$('#sort').addEventListener('change', (e) => { state.sort = e.target.value; renderGrid(); });

$('#price-apply').addEventListener('click', () => {
  const min = parseInt($('#price-min').value, 10);
  const max = parseInt($('#price-max').value, 10);
  state.priceMin = Number.isNaN(min) ? null : min;
  state.priceMax = Number.isNaN(max) ? null : max;
  renderAll();
});

$('#only-stock').addEventListener('change', (e) => { state.onlyStock = e.target.checked; renderGrid(); });
$('#only-hit').addEventListener('change', (e) => { state.onlyHit = e.target.checked; renderAll(); });

$('#reset-filters').addEventListener('click', () => {
  state.category = 'all';
  state.query = '';
  state.priceMin = state.priceMax = null;
  state.onlyStock = true;
  state.onlyHit = false;
  $('#search').value = '';
  $('#price-min').value = '';
  $('#price-max').value = '';
  $('#only-stock').checked = true;
  $('#only-hit').checked = false;
  renderAll();
  syncNav();
});

$('#hero-catalog').addEventListener('click', () => { state.category = 'all'; renderAll(); syncNav(); });

$('#burger').addEventListener('click', () => $('#nav').classList.toggle('is-open'));

$('#order-form').addEventListener('submit', submitOrder);

$$('.modal').forEach(m => m.addEventListener('click', (e) => {
  if (e.target === m) closeModal(m.id);
}));

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('#product-modal').hidden) closeModal('product-modal');
  else if (!$('#order-modal').hidden) closeModal('order-modal');
  else if ($('#cart').classList.contains('is-open')) closeCart();
});

window.addEventListener('scroll', () => {
  $('#header').classList.toggle('is-stuck', window.scrollY > 10);
});

function syncNav() {
  $$('.nav__link[data-nav]').forEach(a => {
    const id = a.dataset.nav;
    a.classList.toggle('is-active', id === 'all' ? state.category === 'all' : state.category === id);
  });
}

/* ---------------- Старт ---------------- */

$('#year').textContent = new Date().getFullYear();

if (state.promo) {
  $('#promo').value = state.promo;
  $('#promo-msg').textContent = `Промокод ${state.promo} — скидка ${PROMOS[state.promo]}%`;
}

PRODUCTS.forEach(p => { state.selected[p.id] = p.flavors[0].name; });

renderAll();
renderCart();
syncNav();
