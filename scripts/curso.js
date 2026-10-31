// curso.js - cartões dos cursos do certificado, filtros e total de créditos.
// Atualize "completed" conforme for concluindo cada curso.

const cursos = [
  {
    subject: 'CSE',
    number: 110,
    title: 'Introdução à Programação',
    credits: 2,
    certificate: 'Programação Web e de Computadores',
    technology: ['Python'],
    completed: true,
  },
  {
    subject: 'WDD',
    number: 130,
    title: 'Fundamentos da Web',
    credits: 2,
    certificate: 'Programação Web e de Computadores',
    technology: ['HTML', 'CSS'],
    completed: true,
  },
  {
    subject: 'CSE',
    number: 111,
    title: 'Programação com Funções',
    credits: 2,
    certificate: 'Programação Web e de Computadores',
    technology: ['Python'],
    completed: true,
  },
  {
    subject: 'CSE',
    number: 210,
    title: 'Programação com Classes',
    credits: 2,
    certificate: 'Programação Web e de Computadores',
    technology: ['C#'],
    completed: false,
  },
  {
    subject: 'WDD',
    number: 131,
    title: 'Fundamentos da Web Dinâmica',
    credits: 2,
    certificate: 'Desenvolvimento Web',
    technology: ['HTML', 'CSS', 'JavaScript'],
    completed: true,
  },
  {
    subject: 'WDD',
    number: 231,
    title: 'Desenvolvimento Web Frontend I',
    credits: 2,
    certificate: 'Desenvolvimento Web',
    technology: ['HTML', 'CSS', 'JavaScript'],
    completed: false,
  },
];

const filtros = {
  todos: () => true,
  wdd: (curso) => curso.subject === 'WDD',
  cse: (curso) => curso.subject === 'CSE',
};

const containerCursos = document.querySelector('#cursos');
const totalCreditos = document.querySelector('#totalCreditos');
const creditosConcluidos = document.querySelector('#creditosConcluidos');
const botoesFiltro = document.querySelectorAll('.botao-filtro');

function criarCartao(curso) {
  const cartao = document.createElement('article');
  cartao.className = `cartao-curso ${curso.completed ? 'concluido' : 'pendente'}`;
  cartao.innerHTML = `
    <h3>${curso.subject} ${curso.number}</h3>
    <p class="titulo-curso">${curso.title}</p>
    <p>${curso.credits} créditos</p>
    <span class="status">${curso.completed ? '✓ Concluído' : 'Pendente'}</span>`;
  return cartao;
}

const somarCreditos = (lista) => lista.reduce((soma, curso) => soma + curso.credits, 0);

function exibirCursos(lista) {
  containerCursos.replaceChildren(...lista.map(criarCartao));
  totalCreditos.textContent = somarCreditos(lista);
  creditosConcluidos.textContent = somarCreditos(lista.filter((curso) => curso.completed));
}

botoesFiltro.forEach((botao) => {
  botao.addEventListener('click', () => {
    botoesFiltro.forEach((outro) => outro.setAttribute('aria-pressed', outro === botao));
    exibirCursos(cursos.filter(filtros[botao.dataset.filtro]));
  });
});

exibirCursos(cursos);
