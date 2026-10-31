// navegacao.js - abre e fecha o menu hambúrguer em telas pequenas.

const botaoMenu = document.querySelector('#botaoMenu');
const menuPrincipal = document.querySelector('#menuPrincipal');

function alternarMenu(abrir = !menuPrincipal.classList.contains('aberto')) {
  menuPrincipal.classList.toggle('aberto', abrir);
  botaoMenu.setAttribute('aria-expanded', abrir);
  botaoMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
}

botaoMenu.addEventListener('click', () => alternarMenu());

// Fecha o menu com a tecla Esc e devolve o foco ao botão.
document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape' && menuPrincipal.classList.contains('aberto')) {
    alternarMenu(false);
    botaoMenu.focus();
  }
});
