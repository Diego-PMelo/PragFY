// Roteador, estado e eventos do protótipo

const params = new URLSearchParams(location.search);
const SHOT = params.has('shot');
if (SHOT) document.body.classList.add('shot');

// Estado mutável de cada perfil de exemplo (cada um começa com seus próprios dados)
function novoEstado(id) {
  const p = PERSONAS[id];
  return {
    tx: p.tx.map(t => ({ ...t })),
    pendentes: p.pendentes.map(t => ({ ...t })),
    banks: [...p.banks],
    diag: JSON.parse(JSON.stringify(p.diag)),
    econ: Object.fromEntries(p.economias.map(e => [e.id, !!e.on])),
    estrategia: 'juros',
    usar13: true,
    classOpen: null,
    lembrar: {},
  };
}

const state = {
  persona: PERSONAS[params.get('p')] ? params.get('p') : 'maria',
  ps: Object.fromEntries(Object.keys(PERSONAS).map(id => [id, novoEstado(id)])),
  connecting: 'horizonte',
  flowDone: true,
  ofPerms: { cadastro: true, contas: true, cartao: true, credito: true },
  ofPrazo: '12',
  open: SHOT && params.get('open') ? { [params.get('c') || 'fiis']: Number(params.get('open')) } : {},
  ask: SHOT && params.get('ask') ? { [params.get('c') || 'fiis']: Number(params.get('ask')) } : {},
  txFilter: 'todas',
  sheet: false,
  newTx: { tipo: 'DESPESA', cat: 'mercado', valor: '', desc: '' },
  theme: 'dark',
  toast: null,
};
if (SHOT && params.get('class')) state.ps[state.persona].classOpen = params.get('class');

const TAB_OF = {
  inicio: 'inicio', analise: 'inicio',
  transacoes: 'transacoes', categorias: 'transacoes', classificar: 'transacoes',
  plano: 'plano', carteira: 'plano', situacao: 'plano', economias: 'plano', negociar: 'plano',
  aprender: 'aprender', classe: 'aprender',
  conta: 'conta',
};

function parse(hash) {
  const parts = (hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
  const [name = 'splash', ...rest] = parts;
  return { name, rest };
}

function resolve({ name, rest }) {
  const simple = ['splash', 'onboarding', 'login', 'cadastro', 'analisando', 'situacao', 'carteira', 'plano', 'economias', 'negociar',
                  'classificar', 'aprender', 'classe', 'analise', 'inicio', 'categorias', 'conta'];
  if (name === 'carteira') return { fn: Screens.plano, rest };   // a carteira só existe na fase 3; nas outras, mostra o plano da fase
  if (simple.includes(name)) return { fn: Screens[name], rest };
  if (name === 'transacoes') { state.sheet = rest[0] === 'nova'; return { fn: Screens.transacoes, rest }; }
  if (name === 'diagnostico') return { fn: rest.length ? Screens.diagnostico : Screens.diagnosticoIntro, rest };
  if (name === 'conectar') {
    const sub = { bancos: 'conectarBancos', permissoes: 'conectarPermissoes', autorizando: 'conectarAutorizando', ok: 'conectarOk' }[rest[0]];
    return { fn: Screens[sub || 'conectar'], rest };
  }
  return { fn: Screens.splash, rest: [] };
}

const $screen = () => document.getElementById('screen');
let autoTimer = null;

function render() {
  const route = parse(location.hash);
  const { fn, rest } = resolve(route);
  const app = document.getElementById('app');
  app.classList.toggle('light', state.theme === 'light');
  app.classList.toggle('on-splash', route.name === 'splash');

  $screen().innerHTML = fn(state, rest);
  document.getElementById('overlay').innerHTML = Screens._overlay(state, route.name);

  const tab = TAB_OF[route.name];
  const bar = document.getElementById('tabbar');
  bar.style.display = tab ? '' : 'none';
  bar.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  const pend = state.ps[state.persona].pendentes.length;
  bar.querySelector('[data-tab=transacoes]').classList.toggle('has-badge', pend > 0);

  const cur = location.hash || '#/splash';
  document.querySelectorAll('.jump a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === cur));
  document.querySelectorAll('.persona-pick button').forEach(b => b.classList.toggle('on', b.dataset.v === state.persona));

  document.getElementById('toast').innerHTML = state.toast ? `<div class="toast"><i class="bi bi-check-circle-fill"></i>${state.toast}</div>` : '';

  // Modo de captura: ?scroll=N (ou end) rola a tela para tirar print de partes mais baixas
  if (SHOT && params.get('scroll')) {
    const v = params.get('scroll');
    $screen().scrollTop = v === 'end' ? 1e6 : Number(v);
  }

  // Telas de transição avançam sozinhas (exceto no modo de captura de prints)
  clearTimeout(autoTimer);
  if (!SHOT) {
    const auto = { splash: ['#/onboarding/1', 2200], analisando: ['#/situacao', 3200] }[route.name];
    if (route.name === 'conectar' && rest[0] === 'autorizando') autoTimer = setTimeout(() => go('#/conectar/ok'), 2400);
    else if (auto) autoTimer = setTimeout(() => go(auto[0]), auto[1]);
  }
}

function go(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
  const scr = $screen();
  if (scr) scr.scrollTop = 0;
}

function rerenderKeepScroll() {
  const scr = $screen();
  const top = scr ? scr.scrollTop : 0;
  render();
  if (scr) scr.scrollTop = top;
}

function toast(msg) {
  state.toast = msg;
  rerenderKeepScroll();
  setTimeout(() => { state.toast = null; document.getElementById('toast').innerHTML = ''; }, 2400);
}

function parseValor(v) {
  const n = parseFloat(String(v).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
  return isFinite(n) ? n : 0;
}

const cur = () => state.ps[state.persona];

const ACTIONS = {
  login() { go('#/inicio'); },
  register() { state.flowDone = false; go('#/conectar'); },
  logout() { go('#/login'); },
  persona(el) {
    state.persona = el.dataset.v;
    state.open = {}; state.ask = {}; state.txFilter = 'todas';
    go('#/inicio');
    toast(`Vendo o app como ${PERSONAS[state.persona].nome}`);
  },
  pickBank(el) {
    state.connecting = el.dataset.v;
    if (!cur().banks.includes(el.dataset.v)) cur().banks.push(el.dataset.v);
    go('#/conectar/permissoes');
  },
  perm(el) { state.ofPerms[el.dataset.v] = !state.ofPerms[el.dataset.v]; rerenderKeepScroll(); },
  pick(el) {
    const { f, v, multi } = el.dataset;
    const d = cur().diag;
    if (f === 'ofPrazo') state.ofPrazo = v;
    else if (multi) d[f] = d[f].includes(v) ? d[f].filter(x => x !== v) : [...d[f], v];
    else d[f] = v;
    rerenderKeepScroll();
  },
  econ(el) { const e = cur().econ; e[el.dataset.v] = !e[el.dataset.v]; rerenderKeepScroll(); },
  estrategia(el) { cur().estrategia = el.dataset.v; rerenderKeepScroll(); },
  usar13() { cur().usar13 = !cur().usar13; rerenderKeepScroll(); },
  classOpen(el) { cur().classOpen = cur().classOpen === el.dataset.id ? null : el.dataset.id; rerenderKeepScroll(); },
  lembrar(el) { const l = cur().lembrar; l[el.dataset.id] = l[el.dataset.id] === false; rerenderKeepScroll(); },
  classify(el) {
    const st = cur();
    const p = st.pendentes.find(x => x.id === el.dataset.id);
    if (!p) return;
    st.pendentes = st.pendentes.filter(x => x.id !== p.id);
    st.tx.unshift({ desc: p.bruto, valor: p.valor, data: p.data, tipo: p.tipo, cat: el.dataset.cat, origem: p.origem });
    st.classOpen = null;
    toast(st.pendentes.length ? `Classificado como ${cat(el.dataset.cat).nome}` : 'Pronto! A análise da IA ficou mais precisa.');
  },
  copiar(el) {
    try { navigator.clipboard && navigator.clipboard.writeText(el.dataset.v); } catch (e) { /* protótipo */ }
    toast('Mensagem copiada');
  },
  toggle(el) {
    const { c, i } = el.dataset;
    const atual = state.open[c] === undefined ? 0 : state.open[c];
    state.open[c] = atual === Number(i) ? -1 : Number(i);
    rerenderKeepScroll();
  },
  ask(el) {
    const { c, i } = el.dataset;
    state.ask[c] = state.ask[c] === Number(i) ? undefined : Number(i);
    rerenderKeepScroll();
  },
  filter(el) { state.txFilter = el.dataset.v; render(); },
  tipo(el) {
    state.newTx.tipo = el.dataset.v;
    state.newTx.cat = CATEGORIES.find(c => c.tipo === el.dataset.v).id;
    render();
  },
  cat(el) { state.newTx.cat = el.dataset.v; render(); },
  saveTx() {
    const n = state.newTx;
    const valor = parseValor(n.valor);
    if (valor <= 0) { const i = document.getElementById('nt-valor'); i.focus(); i.placeholder = 'Informe o valor'; return; }
    cur().tx.unshift({ desc: n.desc.trim() || cat(n.cat).nome, valor, data: '2026-11-23', tipo: n.tipo, cat: n.cat, origem: 'manual' });
    state.newTx = { tipo: 'DESPESA', cat: 'mercado', valor: '', desc: '' };
    state.txFilter = 'todas';
    go('#/transacoes');
    toast('Lançamento salvo');
  },
  theme() { state.theme = state.theme === 'dark' ? 'light' : 'dark'; rerenderKeepScroll(); },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action], [data-go], [data-tab]');
  if (!el) return;
  if (el.dataset.action) { e.preventDefault(); e.stopPropagation(); ACTIONS[el.dataset.action](el); return; }
  if (el.dataset.go) { e.preventDefault(); if (el.dataset.go === '#/diagnostico' && location.hash.startsWith('#/conectar/ok')) state.flowDone = true; go(el.dataset.go); return; }
  if (el.dataset.tab) { go('#/' + el.dataset.tab); }
});

document.addEventListener('input', e => {
  if (e.target.id === 'nt-valor') state.newTx.valor = e.target.value;
  if (e.target.id === 'nt-desc') state.newTx.desc = e.target.value;
  if (e.target.id === 'diag-texto') cur().diag.texto = e.target.value;
});

window.addEventListener('hashchange', () => { render(); const s = $screen(); if (s) s.scrollTop = 0; });
render();
