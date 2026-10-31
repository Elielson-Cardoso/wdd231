// data.js - preenche o ano atual e a data da última modificação no rodapé.

const anoAtual = document.querySelector('#anoAtual');
const ultimaModificacao = document.querySelector('#ultimaModificacao');

anoAtual.textContent = new Date().getFullYear();

const dataModificacao = new Date(document.lastModified);
ultimaModificacao.textContent = `Última modificação: ${dataModificacao.toLocaleString('pt-BR')}`;
