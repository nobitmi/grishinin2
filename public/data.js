/* Каталог магазина «Гришинин» — г. Белорецк, автор Гриша */

const BRAND = {
  name: 'ГРИШИНИН',
  tagline: 'Сделано в Белорецке',
  author: 'Автор — Гриша',
  city: 'Белорецк, Башкортостан',
  phone: '+7 (917) 555-24-17',
  email: 'zakaz@grishinin.sport',
  address: 'г. Белорецк, ул. Советская, 42',
  hours: 'Ежедневно 09:00 – 21:00'
};

const CATEGORIES = [
  { id: 'all',      title: 'Всё',            icon: 'M4 5h16v14H4z' },
  { id: 'protein',  title: 'Протеин',        icon: 'M12 3v6m0 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
  { id: 'gainers',  title: 'Гейнеры',        icon: 'M5 9h14v10H5zM9 5h6' },
  { id: 'amino',    title: 'Аминокислоты',   icon: 'M7 7h10v10H7z' },
  { id: 'accessory',title: 'Аксессуары',     icon: 'M6 9h12l-1 10H7zM9 9a3 3 0 0 1 6 0' }
];

const PRODUCTS = [
  {
    id: 'grishinin-isolate',
    image: 'Изолят ваниль.jpg',
    name: 'Гришинин Изолят «Белорецкий»',
    brand: 'Гришинин',
    category: 'protein',
    price: 3490,
    oldPrice: 3990,
    rating: 4.9,
    reviews: 128,
    badge: 'Хит',
    madeIn: 'Белорецк, РБ',
    author: 'Гриша',
    desc: 'Протеин изолят молочной сыворотки с 27 г белка на порцию. Ультрафильтрация, без сахара, без глютена. Фабрика в Белорецке.',
    weight: '900 г / 30 порций',
    protein: '27 г',
    carbs: '1.2 г',
    fat: '0.6 г',
    kcal: '113',
    flavors: [
      { name: 'Ваниль', color: '#f3e3c3', image: 'Изолят ваниль.jpg' },
      { name: 'Шоколад', color: '#6b3f21', image: 'Изолят шоколад.jpg' },
      { name: 'Клубника', color: '#e14d6d', image: 'Изолят клубника.jpg' }
    ],
    stock: 24
  },
  {
    id: 'grishinin-whey',
    image: 'Концентрат ваниль.jpg',
    name: 'Гришинин Сывороточный Концентрат',
    brand: 'Гришинин',
    category: 'protein',
    price: 2790,
    oldPrice: null,
    rating: 4.8,
    reviews: 96,
    badge: 'Хит',
    madeIn: 'Белорецк, РБ',
    author: 'Гриша',
    desc: 'Классический сывороточный концентрат. Быстрое усвоение, 24 г белка, вкус не «приторный». Варится на молоке или воде.',
    weight: '1000 г / 33 порции',
    protein: '24 г',
    carbs: '3.4 г',
    fat: '1.8 г',
    kcal: '124',
    flavors: [
      { name: 'Ваниль', color: '#f3e3c3', image: 'Концентрат ваниль.jpg' },
      { name: 'Шоколад', color: '#6b3f21', image: 'Концентрат шоколад.jpg' },
      { name: 'Лимон', color: '#f2e34a', image: 'Концентрат лимон.jpg' }
    ],
    stock: 31
  },
  {
    id: 'grishinin-casein',
    image: 'Казеин карамель.jpg',
    name: 'Гришинин Казеин «Ночная формула»',
    brand: 'Гришинин',
    category: 'protein',
    price: 3190,
    oldPrice: null,
    rating: 4.7,
    reviews: 64,
    badge: 'Новинка',
    madeIn: 'Белорецк, РБ',
    author: 'Гриша',
    desc: 'Медленный белок для ночного восстановления. Растворяется густо — идеально как «пудинг» на ночь.',
    weight: '900 г / 30 порций',
    protein: '25 г',
    carbs: '2.0 г',
    fat: '1.1 г',
    kcal: '118',
    flavors: [
      { name: 'Карамель', color: '#c98a3d', image: 'Казеин карамель.jpg' },
      { name: 'Шоколад', color: '#6b3f21', image: 'Казеин шоколад.jpg' },
      { name: 'Ваниль', color: '#f3e3c3', image: 'Казеин ваниль.jpg' }
    ],
    stock: 18
  },
  {
    id: 'grishinin-bcaa',
    image: 'BCAA лимон.jpg',
    name: 'Гришинин BCAA 2:1:1',
    brand: 'Гришинин',
    category: 'amino',
    price: 1990,
    oldPrice: 2390,
    rating: 4.8,
    reviews: 211,
    badge: null,
    madeIn: 'Белорецк, РБ',
    author: 'Гриша',
    desc: 'Аминокислоты BCAA в соотношении 2:1:1 для восстановления на тренировке. Без сахара, 5 г BCAA в порции.',
    weight: '400 г / 80 порций',
    protein: '5 г BCAA',
    carbs: '0 г',
    fat: '0 г',
    kcal: '20',
    flavors: [
      { name: 'Лимон', color: '#f2e34a', image: 'BCAA лимон.jpg' },
      { name: 'Арбуз', color: '#e04b5f', image: 'BCAA арбуз.jpg' }
    ],
    stock: 42
  },
  {
    id: 'grishinin-gainer',
    image: 'Гейнер шоколад.jpg',
    name: 'Гришинин Гейнер «Масса»',
    brand: 'Гришинин',
    category: 'gainers',
    price: 3690,
    oldPrice: null,
    rating: 4.6,
    reviews: 57,
    badge: null,
    madeIn: 'Белорецк, РБ',
    author: 'Гриша',
    desc: 'Углеводы + протеин для набора массы. 120 г углеводов и 25 г белка на порцию. Плотный, как каша.',
    weight: '1000 г / 20 порций',
    protein: '25 г',
    carbs: '120 г',
    fat: '2.4 г',
    kcal: '620',
    flavors: [
      { name: 'Шоколад', color: '#6b3f21', image: 'Гейнер шоколад.jpg' },
      { name: 'Банановый крем', color: '#f4d35e', image: 'Гейнер бананы.jpg' }
    ],
    stock: 15
  },
  {
    id: 'grishinin-creatine',
    image: 'Креатин без вкуса.jpg',
    name: 'Гришинин Креатин Моногидрат',
    brand: 'Гришинин',
    category: 'amino',
    price: 1690,
    oldPrice: 1890,
    rating: 5.0,
    reviews: 143,
    badge: null,
    madeIn: 'Белорецк, РБ',
    author: 'Гриша',
    desc: 'Чистый микронизированный креатин моногидрат 500 г. Нейтральный вкус, без добавок.',
    weight: '500 г',
    protein: '0 г',
    carbs: '0 г',
    fat: '0 г',
    kcal: '0',
    flavors: [
      { name: 'Без вкуса (нейтральный)', color: '#dfe3ea', image: 'Креатин без вкуса.jpg' }
    ],
    stock: 60
  },
  {
    id: 'grishinin-shaker',
    image: 'Шейкер.jpg',
    name: 'Шейкер Гришинин 700 мл',
    brand: 'Гришинин',
    category: 'accessory',
    price: 690,
    oldPrice: 890,
    rating: 4.7,
    reviews: 84,
    badge: null,
    madeIn: 'Белорецк, РБ',
    author: 'Гриша',
    desc: 'Прочная бутылка с мерной шкалой и встроенной встряхивающей камерой. Не пахнет, не трескается.',
    weight: '700 мл',
    protein: '—',
    carbs: '—',
    fat: '—',
    kcal: '—',
    flavors: [
      { name: 'Прозрачный', color: '#cfe3ea', image: 'Шейкер.jpg' }
    ],
    stock: 120
  },
  {
    id: 'protein-bar',
    image: 'Батончик грецкий орех.jpg',
    name: 'Протеиновый батончик Гришинин «Орех»',
    brand: 'Гришинин',
    category: 'protein',
    price: 129,
    oldPrice: null,
    rating: 4.4,
    reviews: 158,
    badge: null,
    madeIn: 'Белорецк, РБ',
    author: 'Гриша',
    desc: '20 г белка, без сахара, только фруктовые сладости. Не крошится в кармане.',
    weight: '60 г',
    protein: '20 г',
    carbs: '6 г',
    fat: '7 г',
    kcal: '196',
    flavors: [
      { name: 'Грецкий орех', color: '#a97845', image: 'Батончик грецкий орех.jpg' },
      { name: 'Арахисовая паста', color: '#c08a3c', image: 'Батончик арахисовая паста.jpg' },
      { name: 'Тёмный шоколад', color: '#4a2c1a', image: 'Батончик темный шоколад.jpg' }
    ],
    stock: 300
  }
];

const PROMOS = {
  GRISHA: 10,
  BELORETSK: 15,
  SPORT20: 20
};
