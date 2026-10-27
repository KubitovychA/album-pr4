// Скрипт підключено з defer: він виконується після повної побудови DOM,
// тому всі елементи вже існують і доступні для querySelector.

// ---------- 1. Перемикач теми (classList.toggle) ----------
const themeBtn = document.querySelector('#theme-toggle');

function applyTheme(isLight) {
  document.body.classList.toggle('light', isLight);
  themeBtn.textContent = isLight ? 'Темна тема' : 'Світла тема';
  themeBtn.setAttribute('aria-pressed', String(isLight));
}

try { applyTheme(localStorage.getItem('theme') === 'light'); } catch (e) { applyTheme(false); }

themeBtn.addEventListener('click', () => {
  const isLight = !document.body.classList.contains('light');
  applyTheme(isLight);
  try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch (e) { /* сховище недоступне */ }
});

// ---------- 2. Лічильник вподобань ----------
const likeBtn = document.querySelector('#like-btn');
const likeCount = document.querySelector('#like-count');

likeBtn.addEventListener('click', () => {
  const liked = likeBtn.classList.toggle('liked');
  likeCount.textContent = Number(likeCount.textContent) + (liked ? 1 : -1);
  likeBtn.setAttribute('aria-pressed', String(liked));
});

// ---------- 3. Плеєр: кнопки треків і гаряча клавіша Space ----------
const audio = document.querySelector('#audio');
const nowPlaying = document.querySelector('#now-playing');

document.querySelectorAll('.play-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('tbody tr').forEach((row) => row.classList.remove('active'));
    btn.closest('tr').classList.add('active');
    nowPlaying.textContent = 'Зараз грає: ' + btn.dataset.title;
    audio.currentTime = 0;
    audio.play();
  });
});

document.addEventListener('keydown', (event) => {
  if (event.code !== 'Space') return;
  // Не перехоплюємо пробіл під час введення тексту або на кнопках/плеєрі
  if (event.target.closest('input, textarea, button, a, audio')) return;
  event.preventDefault(); // щоб сторінка не прокручувалась
  if (audio.paused) audio.play(); else audio.pause();
});

// ---------- 4. Модальне вікно "Поділитися" ----------
const modal = document.querySelector('#share-modal');
const shareLink = document.querySelector('#share-link');
const copyStatus = document.querySelector('#copy-status');

function openModal() {
  shareLink.value = location.href;        // BOM: об'єкт location
  copyStatus.textContent = '';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  shareLink.select();
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

document.querySelector('#share-open').addEventListener('click', openModal);
document.querySelector('#share-close').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });

document.querySelector('#copy-link').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value); // BOM: об'єкт navigator
    copyStatus.textContent = 'Посилання скопійовано!';
  } catch (e) {
    copyStatus.textContent = 'Не вдалося скопіювати. Виділіть посилання вручну.';
  }
});

// ---------- 5. Форма відгуків із валідацією ----------
const form = document.querySelector('#review-form');
const reviewsList = document.querySelector('#reviews');
const reviewCount = document.querySelector('#review-count');
const charsLeft = document.querySelector('#chars-left');
const fields = {
  name: document.querySelector('#name'),
  email: document.querySelector('#email'),
  message: document.querySelector('#message'),
};

const validators = {
  name: (v) => (v.trim().length >= 2 ? '' : 'Введіть ім’я (мінімум 2 символи).'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Введіть коректний email.'),
  message: (v) => (v.trim().length >= 10 ? '' : 'Відгук має містити мінімум 10 символів.'),
};

function validateField(key) {
  const error = validators[key](fields[key].value);
  document.querySelector('#' + key + '-error').textContent = error;
  fields[key].closest('.field').classList.toggle('invalid', error !== '');
  return error === '';
}

Object.keys(fields).forEach((key) => {
  fields[key].addEventListener('blur', () => validateField(key));
  fields[key].addEventListener('input', () => {
    if (fields[key].closest('.field').classList.contains('invalid')) validateField(key);
  });
});

fields.message.addEventListener('input', () => {
  charsLeft.textContent = fields.message.maxLength - fields.message.value.length;
});

form.addEventListener('submit', (event) => {
  event.preventDefault(); // не перезавантажуємо сторінку
  const allValid = Object.keys(fields).map(validateField).every(Boolean);
  if (!allValid) return;

  const item = document.createElement('li');
  const author = document.createElement('strong');
  const time = document.createElement('time');
  const text = document.createElement('p');
  author.textContent = fields.name.value.trim();
  time.textContent = new Date().toLocaleTimeString('uk-UA');
  text.textContent = fields.message.value.trim();   // textContent захищає від вставки HTML
  item.append(author, time, text);
  reviewsList.prepend(item);

  reviewCount.textContent = reviewsList.querySelectorAll('li').length;
  form.reset();
  charsLeft.textContent = fields.message.maxLength;
});

// ---------- 6. BOM: подія scroll і кнопка "Нагору" ----------
const toTop = document.querySelector('#to-top');

window.addEventListener('scroll', () => {
  toTop.classList.toggle('visible', window.scrollY > 300);
});
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
