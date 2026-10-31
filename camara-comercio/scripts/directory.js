// directory.js - lista de associados com alternância Grade / Lista.
import { $, $$, getJSON, memberCard } from './main.js';

const container = $('#members');
const buttons = $$('[data-view]');
const STORAGE_KEY = 'directory-view';

function setView(view) {
  container.classList.toggle('grid', view === 'grid');
  container.classList.toggle('list', view === 'list');
  buttons.forEach((button) => button.setAttribute('aria-pressed', button.dataset.view === view));
  try { localStorage.setItem(STORAGE_KEY, view); } catch { /* armazenamento indisponível */ }
}

async function renderMembers() {
  try {
    const members = await getJSON('data/members.json');
    members.sort((a, b) => b.membershipLevel - a.membershipLevel || a.name.localeCompare(b.name, 'pt-BR'));
    container.replaceChildren(...members.map(memberCard));
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="muted">Não foi possível carregar o diretório. Tente novamente mais tarde.</p>';
  }
}

buttons.forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));

let savedView = 'grid';
try { savedView = localStorage.getItem(STORAGE_KEY) ?? 'grid'; } catch { /* usa o padrão */ }
setView(savedView);
renderMembers();
