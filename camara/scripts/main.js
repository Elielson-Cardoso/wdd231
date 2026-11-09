// main.js - comportamentos comuns a todas as páginas + recursos de cada página.
// Carregado como módulo ES6; directory.js importa os utilitários exportados aqui.

const CITY = { name: 'Goiânia', lat: -16.6869, lon: -49.2648 };

export const LEVELS = {
  1: { name: 'Membro', css: 'level-1' },
  2: { name: 'Prata', css: 'level-2' },
  3: { name: 'Ouro', css: 'level-3' },
};

export const $ = (selector, scope = document) => scope.querySelector(selector);
export const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

export async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao carregar ${url}: ${response.status}`);
  return response.json();
}

// Escapa texto vindo de JSON antes de inseri-lo via innerHTML.
export const escapeHTML = (text = '') =>
  String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function memberCard(member) {
  const level = LEVELS[member.membershipLevel] ?? LEVELS[1];
  const article = document.createElement('article');
  article.className = `member-card ${level.css}`;
  article.innerHTML = `
    <img src="images/members/${escapeHTML(member.image)}" alt="Logotipo de ${escapeHTML(member.name)}" width="96" height="96" loading="lazy">
    <h3>${escapeHTML(member.name)}</h3>
    <p class="tagline">${escapeHTML(member.tagline)}</p>
    <p>${escapeHTML(member.address)}</p>
    <p><a href="tel:${escapeHTML(member.phone.replace(/\D/g, ''))}">${escapeHTML(member.phone)}</a></p>
    <p><a href="${escapeHTML(member.url)}" target="_blank" rel="noopener">${escapeHTML(member.url.replace(/^https?:\/\//, ''))}</a></p>
    <span class="badge ${level.css}">${level.name}</span>`;
  return article;
}

// ---------------------------------------------------------------- comuns
function initNav() {
  const button = $('#menu-btn');
  const nav = $('#primary-nav');
  button.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', open);
    button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
}

function initFooter() {
  $('#year').textContent = new Date().getFullYear();
  $('#last-modified').textContent = new Date(document.lastModified).toLocaleString('pt-BR');
}

// ---------------------------------------------------------------- index
const WEATHER_CODES = [
  [[0], '☀️', 'Céu limpo'],
  [[1, 2], '🌤️', 'Parcialmente nublado'],
  [[3], '☁️', 'Nublado'],
  [[45, 48], '🌫️', 'Neblina'],
  [[51, 53, 55, 56, 57], '🌦️', 'Garoa'],
  [[61, 63, 65, 66, 67], '🌧️', 'Chuva'],
  [[71, 73, 75, 77, 85, 86], '❄️', 'Neve'],
  [[80, 81, 82], '🌧️', 'Pancadas de chuva'],
  [[95, 96, 99], '⛈️', 'Trovoadas'],
];

const describeWeather = (code) => {
  const found = WEATHER_CODES.find(([codes]) => codes.includes(code));
  return found ? { icon: found[1], text: found[2] } : { icon: '🌡️', text: 'Indisponível' };
};

async function renderWeather() {
  const box = $('#weather');
  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${CITY.lat}&longitude=${CITY.lon}`
    + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min'
    + '&timezone=America%2FSao_Paulo&forecast_days=4';
  try {
    const { current, daily } = await getJSON(url);
    const now = describeWeather(current.weather_code);
    const days = daily.time.slice(1, 4).map((date, i) => {
      const day = new Date(`${date}T12:00`).toLocaleDateString('pt-BR', { weekday: 'short' });
      const { icon, text } = describeWeather(daily.weather_code[i + 1]);
      return `<li><strong>${day}</strong><span aria-label="${text}">${icon}</span><br>
        ${Math.round(daily.temperature_2m_max[i + 1])}° / ${Math.round(daily.temperature_2m_min[i + 1])}°</li>`;
    });
    box.innerHTML = `
      <div class="weather-now">
        <span class="weather-icon" aria-hidden="true">${now.icon}</span>
        <div>
          <div class="weather-temp">${Math.round(current.temperature_2m)}°C</div>
          <p class="weather-meta">${now.text} · Umidade ${current.relative_humidity_2m}% · Vento ${Math.round(current.wind_speed_10m)} km/h</p>
        </div>
      </div>
      <ul class="forecast" aria-label="Previsão para os próximos 3 dias">${days.join('')}</ul>`;
  } catch (error) {
    console.error(error);
    box.innerHTML = '<p class="muted">Não foi possível carregar a previsão do tempo agora.</p>';
  }
}

async function renderEvents() {
  const list = $('#events');
  try {
    const events = await getJSON('dados/events.json');
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = events
      .filter((event) => event.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);

    list.innerHTML = upcoming.length ? '' : '<li class="muted">Nenhum evento agendado.</li>';
    upcoming.forEach((event) => {
      const date = new Date(`${event.date}T12:00`);
      const li = document.createElement('li');
      li.innerHTML = `
        <time class="event-date" datetime="${event.date}">
          <span>${date.getDate()}</span>
          <small>${date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small>
        </time>
        <div>
          <h3>${escapeHTML(event.title)}</h3>
          <p>${escapeHTML(event.time)} · ${escapeHTML(event.location)}</p>
        </div>`;
      list.append(li);
    });
  } catch (error) {
    console.error(error);
    list.innerHTML = '<li class="muted">Não foi possível carregar os eventos.</li>';
  }
}

// Fisher-Yates: embaralha uma cópia sem alterar o array original.
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function renderSpotlights() {
  const container = $('#spotlights');
  try {
    const members = await getJSON('dados/membros.json');
    const eligible = members.filter((member) => member.membershipLevel >= 2);
    container.replaceChildren(...shuffle(eligible).slice(0, 3).map(memberCard));
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="muted">Não foi possível carregar os destaques.</p>';
  }
}

// ---------------------------------------------------------------- discover
function initLazyImages() {
  const images = $$('img[data-src]');
  const load = (img) => {
    img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  };

  if (!('IntersectionObserver' in window)) {
    images.forEach(load);
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        load(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px 150px 0px' });
  images.forEach((img) => observer.observe(img));
}

// ---------------------------------------------------------------- join
const LEVEL_NAMES = { np: 'Sem fins lucrativos', bronze: 'Bronze', prata: 'Prata', ouro: 'Ouro' };

function initJoinForm() {
  const form = $('#join-form');
  const timestamp = $('#timestamp');
  timestamp.value = new Date().toISOString();
  form.addEventListener('submit', () => {
    timestamp.value = new Date().toISOString();
  });
  showConfirmation();
}

function showConfirmation() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('email')) return;

  const sentAt = new Date(params.get('timestamp'));
  const rows = [
    ['Nome', `${params.get('nome')} ${params.get('sobrenome')}`],
    ['E-mail', params.get('email')],
    ['Celular', params.get('celular')],
    ['Empresa', params.get('empresa')],
    ['Nível', LEVEL_NAMES[params.get('nivel')] ?? '-'],
    ['Enviado em', Number.isNaN(sentAt.getTime()) ? '-' : sentAt.toLocaleString('pt-BR')],
  ];
  const section = $('#confirmation');
  section.innerHTML = `
    <h2>Obrigado, ${escapeHTML(params.get('nome'))}! Recebemos sua inscrição.</h2>
    <p>Nossa equipe entrará em contato em até 2 dias úteis.</p>
    <dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${escapeHTML(v)}</dd>`).join('')}</dl>`;
  section.hidden = false;
  section.scrollIntoView();
}

// ---------------------------------------------------------------- start
const pageInit = {
  index: () => Promise.all([renderWeather(), renderEvents(), renderSpotlights()]),
  discover: initLazyImages,
  join: initJoinForm,
};

initNav();
initFooter();
pageInit[document.body.dataset.page]?.();
