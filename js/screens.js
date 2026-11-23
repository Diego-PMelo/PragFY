// Telas do protótipo. Cada função recebe (state, params) e devolve HTML.
// PS(s) = dados fixos do perfil atual · ST(s) = estado mutável desse perfil.

const PS = s => PERSONAS[s.persona];
const ST = s => s.ps[s.persona];

const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const brl0 = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const brlS = v => (v < 0 ? '−' : '') + brl(Math.abs(v));
const cat = id => CATEGORIES.find(c => c.id === id);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const pct = v => Math.round(v * 100) + '%';
const taxaTxt = t => (t * 100).toFixed(1).replace('.', ',').replace(',0', '') + '% ao mês';

function totals(tx) {
  const rec = tx.filter(t => t.tipo === 'RECEITA').reduce((s, t) => s + t.valor, 0);
  const des = tx.filter(t => t.tipo === 'DESPESA').reduce((s, t) => s + t.valor, 0);
  return { rec, des, saldo: rec - des };
}

function despesasPorCategoria(tx) {
  const map = {};
  tx.filter(t => t.tipo === 'DESPESA').forEach(t => { map[t.cat] = (map[t.cat] || 0) + t.valor; });
  return Object.entries(map).map(([id, v]) => ({ c: cat(id), v })).sort((a, b) => b.v - a.v);
}

function despesasPorGrupo(tx) {
  const map = {};
  tx.filter(t => t.tipo === 'DESPESA').forEach(t => { const g = cat(t.cat).grupo; map[g] = (map[g] || 0) + t.valor; });
  return Object.keys(GRUPOS).filter(g => map[g]).map(g => ({ g, G: GRUPOS[g], v: map[g] }));
}

function conic(parts) {
  let acc = 0;
  const stops = parts.map(p => { const s = `${p.color} ${acc}% ${acc + p.pct}%`; acc += p.pct; return s; });
  return `conic-gradient(${stops.join(',')})`;
}

const diaLabel = iso => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' });
const mesLabel = m => `${MESES[(10 + m) % 12]}/${26 + Math.floor((10 + m) / 12)}`;   // m=1 → dez/26
const back = to => `<button class="iconbtn" data-go="${to}" aria-label="Voltar"><i class="bi bi-chevron-left"></i></button>`;
const risk = r => `<span class="risk" title="${RISCO_TXT[r]}">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= r ? 'on' : ''}"></i>`).join('')}</span>`;
const bankLogo = (id, size = 36) => { const b = BANKS[id]; return `<span class="bank" style="width:${size}px;height:${size}px;background:${b.cor}">${b.sigla}</span>`; };
const detected = (txt = 'Detectado via Open Finance') => `<span class="of-tag"><i class="bi bi-arrow-repeat"></i>${txt}</span>`;
const aiBadge = (txt = 'IA') => `<span class="badge ai"><i class="bi bi-stars"></i> ${txt}</span>`;
const avatar = (P, cls = 'avatar') => `<div class="${cls}" style="background:${P.avatar}">${P.nome[0]}</div>`;

/* ── Regras de negócio ──────────────────────────────────────────────── */
const custoVida = P => P.custo.fixos + P.custo.variaveis;
const economiaTotal = s => PS(s).economias.filter(e => ST(s).econ[e.id]).reduce((a, e) => a + e.economia, 0);
const resultadoMes = s => totals(ST(s).tx).saldo;
const dividasCaras = P => P.dividas.filter(d => d.tipo === 'cara');
const jurosMes = P => dividasCaras(P).reduce((a, d) => a + d.saldo * d.taxa, 0);
const totalDividas = P => P.dividas.reduce((a, d) => a + d.saldo, 0);
const pmt = (pv, i, n) => pv * i / (1 - Math.pow(1 + i, -n));

// Quanto dá para colocar nas dívidas por mês: o que já paga + juros que já saem como gasto + resultado + economias escolhidas
const capacidade = s => { const P = PS(s); return P.pagaDividas + P.jurosNosGastos + resultadoMes(s) + economiaTotal(s); };

// Simulação mês a mês: o cartão já renegociado, mínimos primeiro e o resto na ordem da estratégia
function simular(s, { usar13 = ST(s).usar13, estrategia = ST(s).estrategia, economias = true } = {}) {
  const P = PS(s);
  const debts = P.dividas.map(d => ({
    id: d.id, nome: d.nome, ini: d.saldo, saldo: d.saldo,
    taxa: d.reneg ? d.reneg.taxa : d.taxa,
    min: d.reneg ? pmt(d.saldo, d.reneg.taxa, d.reneg.parcelas) : d.min,
  }));
  const ordem = [...debts].sort(estrategia === 'juros' ? (a, b) => b.taxa - a.taxa : (a, b) => a.ini - b.ini);
  const cap = economias ? capacidade(s) : capacidade(s) - economiaTotal(s);
  const serie = [debts.reduce((a, d) => a + d.saldo, 0)];
  const quit = {};
  let juros = 0;
  for (let m = 1; m <= 48 && debts.some(d => d.saldo > 0.5); m++) {
    debts.forEach(d => { if (d.saldo > 0) { const j = d.saldo * d.taxa; juros += j; d.saldo += j; } });
    let pay = cap + (m === 1 && usar13 ? P.extra13 : 0);
    ordem.forEach(d => { const p = Math.min(d.min, d.saldo, pay); d.saldo -= p; pay -= p; });
    ordem.forEach(d => { const p = Math.min(d.saldo, pay); d.saldo -= p; pay -= p; });
    debts.forEach(d => { if (d.saldo <= 0.5 && !quit[d.id]) { d.saldo = 0; quit[d.id] = m; } });
    serie.push(debts.reduce((a, d) => a + d.saldo, 0));
  }
  const meses = debts.every(d => d.saldo <= 0.5) ? serie.length - 1 : null;
  return { serie, quit, ordem, meses, juros, cap };
}

// Sem plano: pagando só o mínimo, o rotativo cresce (até o teto legal de 100% de juros)
function semPlano(P, meses = 6) {
  const c = P.dividas.find(d => d.id === 'cartao');
  if (!c) return null;
  let v = c.saldo;
  for (let i = 0; i < meses; i++) v = Math.min(v * (1 + c.taxa) - c.min, c.saldo * 2);
  return v;
}

function perfilKey(s) {
  return { venderia: 'CONSERVADOR', preocupado: 'MODERADO', tranquilo: 'ARROJADO' }[ST(s).diag.reacao] || 'MODERADO';
}

function alocacao(s) {
  const d = ST(s).diag;
  const key = perfilKey(s);
  const aloc = { ...PERFIS[key].aloc };
  const ajustes = [];
  const medioPrazo = d.objetivos.filter(o => ['imovel', 'carro', 'estudos'].includes(o));
  if (medioPrazo.length) {
    let movido = 0;
    [['acoes', 2], ['internacional', 2], ['cripto', 1]].forEach(([k, v]) => { const t = Math.min(v, aloc[k]); aloc[k] -= t; movido += t; });
    if (movido < 5) { aloc.acoes -= 5 - movido; movido = 5; }
    aloc['renda-fixa'] += movido;
    const o = OPT.objetivos.find(x => x[0] === medioPrazo[0]);
    ajustes.push(`Renda Fixa +${movido} pontos: o objetivo "${o[2].toLowerCase()}" é em ${o[3]} e precisa de mais previsibilidade.`);
  }
  if (d.texto.toLowerCase().includes('medo') && key !== 'CONSERVADOR') ajustes.push('Você disse que tem medo de perder o que juntou: o perfil ficou com viés conservador.');
  return { key, perfil: PERFIS[key], aloc, ajustes };
}

function reservaInfo(s) {
  const P = PS(s);
  const meta = custoVida(P) * P.mesesReserva;
  return { meta, pct: P.reservaAtual / meta, meses: P.reservaAtual / custoVida(P), falta: meta - P.reservaAtual };
}

function txRow(t) {
  const c = cat(t.cat);
  const inn = t.tipo === 'RECEITA';
  const origem = t.origem === 'manual' ? '<i class="bi bi-pencil"></i> Manual' : `<span class="dot-bank" style="background:${BANKS[t.origem].cor}"></span>${BANKS[t.origem].nome}`;
  return `<div class="tx">
    <div class="ic" style="background:${c.cor}22;color:${c.cor}"><i class="bi ${c.icone}"></i></div>
    <div class="info"><div class="d">${esc(t.desc)}</div><div class="c">${c.nome} · ${origem}</div></div>
    <div class="v ${inn ? 'in' : ''}">${inn ? '+' : '−'} ${brl(t.valor)}</div>
  </div>`;
}

function chips(field, opts, sel, multi = false) {
  return `<div class="chips">${opts.map(([v, l]) => {
    const on = multi ? sel.includes(v) : sel === v;
    return `<button class="chip ${on ? 'on' : ''}" data-action="pick" data-f="${field}" data-v="${v}" ${multi ? 'data-multi="1"' : ''}>${l}</button>`;
  }).join('')}</div>`;
}

function optList(field, opts, sel) {
  return `<div class="opts">${opts.map(([v, l, d]) => `<button class="opt ${sel === v ? 'on' : ''}" data-action="pick" data-f="${field}" data-v="${v}">
    <span class="radio"></span><span>${l}${d ? `<small>${d}</small>` : ''}</span></button>`).join('')}</div>`;
}

function faseSteps(fase) {
  return `<div class="fase-steps">${[1, 2, 3].map(n => `<span class="${n < fase ? 'done' : n === fase ? 'now' : ''}">${n < fase ? '<i class="bi bi-check-lg"></i>' : n}</span>`).join('<i></i>')}</div>`;
}

function bars(serie, labelFn) {
  const max = Math.max(...serie, 1);
  return `<div class="bars">${serie.map((v, i) => `<div class="bar-col"><span class="bar ${v < 1 ? 'zero' : ''}" style="height:${Math.max(v / max * 100, 2)}%"></span><small>${labelFn(i)}</small></div>`).join('')}</div>`;
}

const Screens = {

  /* ── Abertura e onboarding ─────────────────────────────────────────── */
  splash() {
    return `<div class="splash" data-go="#/onboarding/1">
      <img src="assets/logo.svg" alt="">
      <h1>PragFy</h1>
      <p>Seu dinheiro, sem mistério.</p>
      <span class="hint">toque para continuar</span>
    </div>`;
  },

  onboarding(s, p) {
    const n = Math.min(Math.max(parseInt(p[0] || '1', 10), 1), 3);
    const slides = [
      { icon: 'bi-calendar-x', title: 'O salário acaba antes do mês?',
        text: 'Você não está sozinho: boa parte dos brasileiros fecha o mês no vermelho ou com dívidas. O PragFy foi feito para essa realidade.',
        floats: [['top:18px;left:-14px', 'bi-credit-card', '#e05252', 'Rotativo do cartão'], ['bottom:34px;right:-22px', 'bi-bank', '#f59e0b', 'Cheque especial'], ['top:96px;right:-30px', 'bi-receipt', '#8b5cf6', 'Carnê']] },
      { icon: 'bi-bank2', title: 'Conecte seus bancos com o Open Finance',
        text: 'Seus gastos e receitas entram sozinhos e já categorizados. O que a IA não reconhecer, ela pergunta para você.',
        floats: [['top:24px;left:-18px', 'bi-arrow-repeat', '#3355ff', 'Sincronizado'], ['bottom:40px;left:-10px', 'bi-question-circle', '#f59e0b', 'O que é este Pix?'], ['top:110px;right:-26px', 'bi-cart', '#e55353', 'Mercado 21%']] },
      { icon: 'bi-signpost-split', title: 'Um plano para a sua fase',
        text: 'Sair das dívidas, criar um colchão ou investir: a IA entende a sua situação, mostra onde dá para economizar e monta o próximo passo.',
        floats: [['top:20px;right:-18px', 'bi-life-preserver', '#e05252', 'Fase 1 · Sair do vermelho'], ['bottom:36px;left:-24px', 'bi-piggy-bank', '#1d9e63', 'Economia: R$ 325/mês']] },
    ];
    const sl = slides[n - 1];
    const next = n < 3 ? `#/onboarding/${n + 1}` : '#/cadastro';
    return `<div class="onb">
      <button class="skip" data-go="#/login">Pular</button>
      <div class="art"><div class="disc"><i class="bi ${sl.icon}"></i>
        ${sl.floats.map(([pos, ic, col, txt]) => `<div class="float" style="${pos}"><i class="bi ${ic}" style="color:${col}"></i>${txt}</div>`).join('')}
      </div></div>
      <div class="dots">${[1, 2, 3].map(i => `<span class="${i === n ? 'on' : ''}"></span>`).join('')}</div>
      <h2>${sl.title}</h2>
      <p>${sl.text}</p>
      <button class="btn" data-go="${next}">${n < 3 ? 'Próximo' : 'Criar minha conta'} <i class="bi bi-arrow-right"></i></button>
      ${n === 3 ? `<button class="btn ghost" style="margin-top:10px" data-go="#/login">Já tenho conta</button>` : ''}
    </div>`;
  },

  login(s) {
    const P = PS(s);
    return `<div class="auth">
      ${back('#/onboarding/3')}
      <div style="height:22px"></div>
      <img class="logo" src="assets/logo.svg" alt="">
      <h2>Bem-vindo de volta</h2>
      <p class="lead">Entre para ver como está o seu mês.</p>
      <div class="field"><label>E-mail</label><div class="input"><i class="bi bi-envelope"></i><input type="email" value="${P.email}"></div></div>
      <div class="field"><label>Senha</label><div class="input"><i class="bi bi-lock"></i><input type="password" value="prototipo"><i class="bi bi-eye"></i></div></div>
      <div style="text-align:right;margin:-4px 0 20px"><a class="link" href="#/login">Esqueci minha senha</a></div>
      <button class="btn" data-action="login">Entrar</button>
      <div class="divider">ou</div>
      <button class="btn ghost" data-action="login"><i class="bi bi-google"></i> Entrar com Google</button>
      <p class="alt">Não tem conta? <a href="#/cadastro">Cadastre-se</a></p>
    </div>`;
  },

  cadastro(s) {
    const P = PS(s);
    return `<div class="auth">
      ${back('#/onboarding/3')}
      <div style="height:22px"></div>
      <h2>Crie sua conta</h2>
      <p class="lead">Grátis. Sem cartão, sem pegadinha.</p>
      <div class="field"><label>Nome</label><div class="input"><i class="bi bi-person"></i><input value="${P.nome}"></div></div>
      <div class="field"><label>E-mail</label><div class="input"><i class="bi bi-envelope"></i><input type="email" value="${P.email}"></div></div>
      <div class="field"><label>Senha</label><div class="input"><i class="bi bi-lock"></i><input type="password" value="prototipo"><i class="bi bi-eye"></i></div></div>
      <p class="small muted" style="margin:-2px 0 20px;line-height:1.5"><i class="bi bi-shield-lock"></i> O PragFy nunca movimenta seu dinheiro e não indica produtos financeiros.</p>
      <button class="btn" data-action="register">Criar conta</button>
      <p class="alt">Já tem conta? <a href="#/login">Entrar</a></p>
    </div>`;
  },

  /* ── Open Finance ──────────────────────────────────────────────────── */
  conectar() {
    return `<div class="auth">
      ${back('#/cadastro')}
      <div class="empty" style="padding:18px 0 8px">
        <div class="ic"><i class="bi bi-bank2"></i></div>
        <h3>Conecte suas contas com o Open Finance</h3>
        <p>Assim seus gastos entram sozinhos e o diagnóstico usa números reais — não estimativas.</p>
      </div>
      <div class="card" style="margin-bottom:20px">
        ${[['bi-shield-check', 'Sistema oficial do Banco Central', 'Você autoriza direto no app do seu banco.'],
           ['bi-eye', 'Somente leitura', 'O PragFy não faz pagamentos nem transferências.'],
           ['bi-toggles', 'Você escolhe o que compartilhar', 'E pode cancelar quando quiser, aqui ou no banco.']]
          .map(([i, t, d]) => `<div class="feat"><i class="bi ${i}"></i><div><b>${t}</b><span>${d}</span></div></div>`).join('')}
      </div>
      <button class="btn" data-go="#/conectar/bancos">Escolher meu banco</button>
      <button class="btn ghost" style="margin-top:10px" data-go="#/diagnostico">Preencher manualmente</button>
    </div>`;
  },

  conectarBancos(s) {
    return `<div class="topbar">${back('#/conectar')}<h2 style="flex:1;margin-left:12px">Escolha a instituição</h2></div>
    <div class="pad" style="padding-top:4px">
      <div class="input" style="margin-bottom:14px"><i class="bi bi-search"></i><input placeholder="Buscar banco ou instituição"></div>
      <div class="card menu" style="padding:4px 0">
        ${Object.entries(BANKS).map(([id, b]) => `<button data-action="pickBank" data-v="${id}">${bankLogo(id)}<span style="flex:1">${b.nome}</span>
          ${ST(s).banks.includes(id) && s.flowDone ? '<span class="small" style="color:var(--green)"><i class="bi bi-check-circle-fill"></i> Conectado</span>' : '<i class="bi bi-chevron-right muted"></i>'}</button>`).join('')}
      </div>
      <p class="small muted" style="margin-top:14px;text-align:center">Instituições fictícias, usadas só neste protótipo.</p>
    </div>`;
  },

  conectarPermissoes(s) {
    const b = BANKS[s.connecting];
    const perms = [['cadastro', 'Dados cadastrais', 'Nome, CPF e contato'], ['contas', 'Contas', 'Saldos e extratos'],
                   ['cartao', 'Cartão de crédito', 'Faturas, limites e transações'], ['credito', 'Operações de crédito', 'Empréstimos, financiamentos e cheque especial']];
    return `<div class="topbar">${back('#/conectar/bancos')}<h2 style="flex:1;margin-left:12px">Compartilhar dados</h2></div>
    <div class="pad" style="padding-top:4px">
      <div class="card" style="display:flex;align-items:center;gap:12px">
        ${bankLogo(s.connecting, 44)}<i class="bi bi-arrow-left-right muted"></i><img src="assets/logo.svg" alt="" style="width:44px;height:44px;border-radius:12px;background:var(--primary);padding:6px">
        <div style="flex:1;font-size:13px;color:var(--text-2)"><b style="color:var(--text)">${b.nome}</b> vai compartilhar com o <b style="color:var(--text)">PragFy</b></div>
      </div>
      <div class="section-head" style="margin-top:20px"><h3>Quais dados</h3></div>
      <div class="card menu" style="padding:4px 0">
        ${perms.map(([k, t, d]) => `<button data-action="perm" data-v="${k}"><span class="mi"><i class="bi bi-check2-square"></i></span>
          <span style="flex:1">${t}<small class="muted" style="display:block;font-size:12px">${d}</small></span><span class="switch ${s.ofPerms[k] ? 'on' : ''}"></span></button>`).join('')}
      </div>
      <div class="section-head" style="margin-top:20px"><h3>Por quanto tempo</h3></div>
      ${chips('ofPrazo', [['3', '3 meses'], ['6', '6 meses'], ['12', '12 meses']], s.ofPrazo)}
      <div class="callout"><i class="bi bi-info-circle"></i><span><b>Finalidade:</b> organizar seus gastos, identificar dívidas e montar seu diagnóstico financeiro. Você pode cancelar a qualquer momento.</span></div>
      <button class="btn" style="margin-top:18px" data-go="#/conectar/autorizando">Continuar para o ${b.nome}</button>
    </div>`;
  },

  conectarAutorizando(s) {
    const b = BANKS[s.connecting];
    return `<div class="redirect">
      ${bankLogo(s.connecting, 72)}
      <div class="spinner"></div>
      <h3>Abrindo o ${b.nome} com segurança</h3>
      <p>Confirme o compartilhamento no app do seu banco. Depois você volta automaticamente para o PragFy.</p>
      <button class="btn soft sm" data-go="#/conectar/ok">Simular autorização</button>
    </div>`;
  },

  conectarOk(s) {
    const P = PS(s);
    const b = BANKS[s.connecting];
    const renda = P.renda.reduce((a, r) => a + r.valor, 0);
    const linhas = [['bi-arrow-down-circle', 'Renda média', brl(renda) + '/mês'], ['bi-arrow-up-circle', 'Custo de vida médio', brl(custoVida(P)) + '/mês']];
    linhas.push(P.dividas.length ? ['bi-exclamation-triangle', 'Dívidas encontradas', `${P.dividas.length} · ${brl0(totalDividas(P))}`] : ['bi-piggy-bank', 'Guardado', brl(P.reservaAtual)]);
    return `<div class="auth" style="justify-content:center">
      <div class="empty" style="padding:0 0 10px">
        <div class="ic ok"><i class="bi bi-check-lg"></i></div>
        <h3>${b.nome} conectado!</h3>
        <p>A IA organizou 12 meses de transações em categorias. ${ST(s).pendentes.length} ficaram sem categoria — vamos te perguntar depois.</p>
      </div>
      <div class="card" style="margin-bottom:20px">
        ${linhas.map(([i, t, v]) => `<div class="kv"><i class="bi ${i}"></i><span>${t}</span><b>${v}</b></div>`).join('')}
      </div>
      <button class="btn" data-go="#/diagnostico">Continuar para o diagnóstico</button>
      <button class="btn ghost" style="margin-top:10px" data-go="#/conectar/bancos">Conectar outro banco</button>
    </div>`;
  },

  /* ── Diagnóstico financeiro ────────────────────────────────────────── */
  diagnosticoIntro() {
    return `<div class="quiz">
      <div class="top">${back('#/conectar')}</div>
      <div class="empty" style="padding-top:10px">
        <div class="ic"><i class="bi bi-clipboard2-pulse"></i></div>
        <h3>Seu diagnóstico financeiro</h3>
        <p>7 etapas rápidas sobre renda, gastos, dívidas, reserva, objetivos e risco. O que veio do Open Finance já está preenchido — é só conferir.</p>
      </div>
      <div class="card" style="margin-bottom:22px">
        ${[['bi-stopwatch', 'Leva cerca de 3 minutos'], ['bi-stars', 'A IA interpreta suas respostas, não só soma pontos'], ['bi-heart', 'Serve para qualquer situação, inclusive no vermelho']].map(([i, t]) => `<div style="display:flex;gap:12px;align-items:center;padding:6px 0;font-size:14px"><i class="bi ${i}" style="color:var(--accent-lt);font-size:18px"></i>${t}</div>`).join('')}
      </div>
      <button class="btn" data-go="#/diagnostico/1">Começar</button>
    </div>`;
  },

  diagnostico(s, p) {
    const P = PS(s);
    const i = Math.min(Math.max(parseInt(p[0] || '1', 10), 1), DIAG_STEPS.length);
    const step = DIAG_STEPS[i - 1];
    const d = ST(s).diag;
    let body = '';
    if (step.id === 'renda') body = `
      <div class="card list">
        ${P.renda.map(r => `<div class="kv"><i class="bi ${r.icon}"></i><span>${r.nome}<small>${r.detectado ? detected() : r.variavel}</small></span><b>${brl(r.valor)}</b></div>`).join('')}
        <button class="addrow"><i class="bi bi-plus-circle"></i> Adicionar outra renda (benefício, pensão…)</button>
      </div>
      <label class="qlabel">Sua renda principal vem de</label>${chips('vinculo', OPT.vinculo, d.vinculo)}
      <label class="qlabel">Pessoas que dependem de você</label>${chips('dependentes', OPT.dependentes, d.dependentes)}`;
    if (step.id === 'gastos') body = `
      <div class="card list">
        <div class="kv"><i class="bi bi-house"></i><span>Gastos fixos<small>${P.custo.fixosTxt}</small></span><b>${brl(P.custo.fixos)}</b></div>
        <div class="kv"><i class="bi bi-cart"></i><span>Gastos variáveis<small>${P.custo.variaveisTxt}</small></span><b>${brl(P.custo.variaveis)}</b></div>
        ${P.pagaDividas ? `<div class="kv"><i class="bi bi-credit-card"></i><span>Parcelas de dívidas<small>Mínimo do cartão + crediário</small></span><b>${brl(P.pagaDividas)}</b></div>` : ''}
        <div class="kv total"><span>Custo de vida mensal<small>${detected('Média de 12 meses via Open Finance')}</small></span><b>${brl(custoVida(P))}</b></div>
      </div>
      <label class="qlabel">Algum gasto grande previsto nos próximos 12 meses?</label>${chips('gastoGrande', OPT.gastoGrande, d.gastoGrande)}`;
    if (step.id === 'dividas') body = `
      <div class="card list">
        ${P.dividas.length ? P.dividas.map(dv => `<div class="kv"><i class="bi ${dv.icon}" style="color:${dv.tipo === 'cara' ? 'var(--red)' : 'var(--amber)'}"></i>
            <span>${dv.nome}<small>${dv.banco ? detected() : 'Informado por você'} · ${taxaTxt(dv.taxa)}</small></span>
            <span class="dv-r"><b>${brl(dv.saldo)}</b>${dv.tipo === 'cara' ? '<em class="tag-cara">cara</em>' : ''}</span></div>`).join('')
          : `<div class="kv"><i class="bi bi-credit-card" style="color:var(--green)"></i><span>${P.cartaoOk}<small>${detected()}</small></span><b style="color:var(--green);font-size:13px">Sem juros</b></div>`}
      </div>
      <label class="qlabel">Além dessas, você tem outra dívida?</label>${optList('divida', OPT.dividas, d.divida)}`;
    if (step.id === 'reserva') body = `
      <div class="card list">
        <div class="kv"><i class="bi bi-piggy-bank"></i><span>${P.reservaAtual ? 'Guardado' : 'Nada guardado no momento'}<small>${detected()}</small></span><b>${brl(P.reservaAtual)}</b></div>
        <button class="addrow"><i class="bi bi-plus-circle"></i> Tenho dinheiro em outro lugar</button>
      </div>
      <label class="qlabel">Você investe em alguma coisa?</label>${chips('investe', OPT.investe, d.investe)}`;
    if (step.id === 'objetivos') body = `
      <p class="muted small" style="margin:-10px 0 14px">Escolha quantos quiser. O prazo de cada objetivo muda o plano.</p>
      <div class="goals">${OPT.objetivos.map(([v, ic, l, prazo]) => `<button class="goal ${d.objetivos.includes(v) ? 'on' : ''}" data-action="pick" data-f="objetivos" data-v="${v}" data-multi="1">
        <i class="bi ${ic}"></i><b>${l}</b><span>${prazo}</span></button>`).join('')}</div>`;
    if (step.id === 'risco') body = `
      <label class="qlabel" style="margin-top:0">Se um dinheiro guardado caísse 20% em um mês, você:</label>${optList('reacao', OPT.reacao, d.reacao)}
      <label class="qlabel">Já investiu em algo que oscila, como ações ou FIIs?</label>${chips('experiencia', OPT.experiencia, d.experiencia)}`;
    if (step.id === 'palavras') body = `
      <p class="muted small" style="margin:-10px 0 14px;line-height:1.5">Conte seus planos, dificuldades e medos. A IA usa isso para entender o que os números não mostram.</p>
      <div class="textarea"><textarea id="diag-texto" rows="7">${esc(d.texto)}</textarea><div class="ta-foot"><span><i class="bi bi-mic"></i> Falar</span><span>${d.texto.length}/500</span></div></div>
      <div class="callout ai"><i class="bi bi-stars"></i><span>Ex.: "minha renda varia", "pago só o mínimo do cartão", "ajudo meus pais", "tenho medo de investir".</span></div>`;

    const next = i < DIAG_STEPS.length ? `#/diagnostico/${i + 1}` : '#/analisando';
    return `<div class="quiz">
      <div class="top">${back(i === 1 ? '#/diagnostico' : `#/diagnostico/${i - 1}`)}
        <div class="progress"><span style="width:${i / DIAG_STEPS.length * 100}%"></span></div>
        <span class="step">${i}/${DIAG_STEPS.length}</span></div>
      <div class="qic"><i class="bi ${step.icon}"></i></div>
      <h2>${step.titulo}</h2>
      ${body}
      <div style="margin-top:auto;padding-top:22px"><button class="btn" data-go="${next}">${i < DIAG_STEPS.length ? 'Continuar' : '<i class="bi bi-stars"></i> Analisar minha situação'}</button></div>
    </div>`;
  },

  analisando() {
    const steps = ['Lendo 12 meses de transações', 'Separando o essencial do que dá para ajustar', 'Calculando juros e dívidas', 'Interpretando o que você escreveu', 'Definindo a sua fase e o próximo passo'];
    return `<div class="redirect">
      <div class="ai-orb"><i class="bi bi-stars"></i></div>
      <h3>A IA está analisando sua situação</h3>
      <div class="checks">${steps.map((t, k) => `<div class="chk" style="animation-delay:${k * .45}s"><i class="bi bi-check-circle-fill"></i>${t}</div>`).join('')}</div>
      <button class="btn soft sm" data-go="#/situacao">Ver resultado</button>
    </div>`;
  },

  /* ── Leitura da IA: texto, indicadores e ordem de prioridades ──────── */
  situacao(s) {
    const P = PS(s);
    const t = totals(ST(s).tx);
    const r = reservaInfo(s);
    const eco = economiaTotal(s);
    let msg, ind;
    if (P.fase === 1) {
      const j = jurosMes(P);
      msg = `${P.nome}, você não está sozinha: muita gente fecha o mês no vermelho. Em novembro <b>faltaram ${brl0(-t.saldo)}</b> e, pior, <b>${brl0(j)} foram só de juros</b>.
        O cartão no rotativo cobra cerca de 13% ao mês e o pagamento mínimo nem cobre os juros — por isso a dívida não diminui.
        Você contou que às vezes aposta para tentar resolver tudo de uma vez; isso costuma aumentar o buraco.
        <b>Agora não é hora de investir.</b> O plano é parar de aumentar a dívida, trocar a cara por uma mais barata e quitar em ordem — com ${brl0(eco)} por mês que encontramos nos seus gastos.`;
      ind = [['Resultado do mês', brlS(t.saldo), 'red', 'coberto pelo cheque especial'], ['Juros no mês', brl0(j), 'red', 'mais que luz, água e gás'],
             ['Dívidas caras', brl0(dividasCaras(P).reduce((a, d) => a + d.saldo, 0)), 'red', 'rotativo + cheque especial'], ['Renda para dívidas', pct((P.pagaDividas + j) / t.rec), 'amber', 'parcelas + juros']];
    } else if (P.fase === 2) {
      msg = `${P.nome}, você não tem dívidas e paga o cartão em dia — isso já é uma vitória. O problema é que <b>sobram só ${brl0(t.saldo)} por mês</b> e não há reserva: qualquer imprevisto, como o conserto da geladeira, vira dívida.
        Encontramos <b>${brl0(eco)} por mês</b> em ajustes que não mexem no essencial. Com isso, você junta um colchão de R$ 500 em cerca de 2 meses. Investir vem depois, quando a reserva estiver pronta.`;
      ind = [['Resultado do mês', brlS(t.saldo), 'amber', 'pouca sobra'], ['Dívidas caras', 'Nenhuma', 'green', 'cartão em dia'],
             ['Reserva', brl0(P.reservaAtual), 'amber', `de ${brl0(r.meta)} (3 meses)`], ['Economia possível', brl0(eco), 'green', 'por mês']];
    } else {
      const a = alocacao(s);
      const d = ST(s).diag;
      msg = `${P.nome}, você está numa posição boa: <b>sobram ${pct(t.saldo / t.rec)} do que você ganha</b> e não há dívidas caras.
        O ponto de atenção é a <b>reserva</b>: hoje ela cobre ${r.meses.toFixed(1).replace('.', ',')} meses de gastos. Como parte da renda vem de freela e varia, a reserva ideal é de <b>6 meses, não 3</b>.
        ${d.objetivos.includes('imovel') ? 'Você quer dar entrada num apartamento em 5 anos' : 'Seus objetivos são de prazo mais longo'}${d.texto.toLowerCase().includes('medo') ? ' e tem medo de perder o que juntou' : ''} — por isso seu perfil é <b>${a.perfil.nome}${a.ajustes.some(x => x.includes('viés')) ? ', com viés conservador' : ''}</b>.`;
      ind = [['Taxa de poupança', pct(t.saldo / t.rec), 'green', 'ótima'], ['Dívidas caras', 'Nenhuma', 'green', 'cartão em dia'],
             ['Reserva', `${r.meses.toFixed(1).replace('.', ',')} de 6`, 'amber', 'meses de gastos'], ['Diversificação', 'Baixa', 'amber', '100% poupança']];
    }
    const passos = [
      ['Quitar dívidas caras', P.fase === 1 ? `${brl0(dividasCaras(P).reduce((a, d) => a + d.saldo, 0))} em rotativo e cheque especial.` : 'Você não tem dívidas caras. Etapa concluída.'],
      ['Montar a reserva de emergência', P.fase === 2 ? `${brl0(P.reservaAtual)} de ${brl0(r.meta)} · comece pelo colchão de R$ 500.` : P.fase === 1 ? 'Começa quando as dívidas caras acabarem.' : `${brl0(P.reservaAtual)} de ${brl0(r.meta)} · ${pct(r.pct)}`],
      ['Investir para seus objetivos', P.fase === 3 ? 'Começa já, com a parte da sobra que não vai para a reserva.' : 'Pausado até concluir as etapas anteriores.'],
    ];
    return `<div class="topbar">${back('#/diagnostico/7')}<span class="small muted">Seu diagnóstico</span>${aiBadge('Leitura da IA')}</div>
    <div class="pad" style="padding-top:4px">
      <div class="bubble"><div class="bot"><i class="bi bi-stars"></i></div><div class="msg">${msg}</div></div>

      <div class="section"><div class="section-head"><h3>Seus indicadores</h3></div>
        <div class="ind">${ind.map(([k, v, c, sub]) => `<div><span class="k">${k}</span><b style="color:var(--${c})">${v}</b><span class="s">${sub}</span></div>`).join('')}</div>
      </div>

      <div class="section"><div class="section-head"><h3>Sua ordem de prioridades</h3><span class="small muted">planejamento financeiro</span></div>
        <div class="card pyr">${passos.map(([tt, dd], k) => {
          const n = k + 1, st = n < P.fase ? 'done' : n === P.fase ? 'now' : 'next';
          return `<div class="pstep ${st}"><span class="pn">${st === 'done' ? '<i class="bi bi-check-lg"></i>' : n}</span><div><b>${tt}</b><span>${dd}</span></div>${st === 'next' && n === 3 ? '<i class="bi bi-lock muted"></i>' : ''}</div>`;
        }).join('')}</div>
      </div>

      <div class="section card profile-card">
        <div class="ic" style="background:${FASES[P.fase].cor}22;color:${FASES[P.fase].cor}"><i class="bi ${FASES[P.fase].icon}"></i></div>
        <div style="flex:1"><div class="small muted">Sua fase agora</div><div style="font-weight:700">Fase ${P.fase} de 3 · ${FASES[P.fase].nome}</div></div>
      </div>

      <div style="margin-top:20px"><button class="btn" data-go="#/plano">Ver meu plano <i class="bi bi-arrow-right"></i></button></div>
    </div>`;
  },

  /* ── Economias: análise de gastos pela IA ──────────────────────────── */
  economias(s) {
    const P = PS(s);
    const st = ST(s);
    const tx = st.tx;
    const grupos = despesasPorGrupo(tx);
    const totDes = grupos.reduce((a, g) => a + g.v, 0);
    const eco = economiaTotal(s);
    const destino = { 1: 'Vai direto para o plano de dívidas.', 2: 'Vai direto para o seu colchão.', 3: 'Aumenta o quanto você investe.' }[P.fase];
    const card = e => {
      const c = cat(e.cat);
      const on = st.econ[e.id];
      return `<div class="eco ${on ? 'on' : ''}">
        <div class="eco-top"><span class="ic" style="background:${c.cor}22;color:${c.cor}"><i class="bi ${c.icone}"></i></span>
          <div style="flex:1"><b>${e.titulo}</b><small>${c.nome} · <span class="dif ${e.dif.toLowerCase()}">${e.dif}</span></small></div>
          <button class="switch ${on ? 'on' : ''}" data-action="econ" data-v="${e.id}" aria-label="Quero tentar"></button></div>
        <p>${e.detalhe}</p>
        <div class="eco-num"><span>Hoje ${brl0(e.atual)}</span><i class="bi bi-arrow-right"></i><span>${brl0(e.atual - e.economia)}</span><b>+${brl0(e.economia)}/mês</b></div>
        ${e.ajuda ? `<div class="callout warn" style="margin-top:10px"><i class="bi bi-heart"></i><span>Se estiver difícil parar, você não está sozinha. Sites de apostas autorizados são obrigados a oferecer a opção de <b>autoexclusão</b>, e o SUS (CAPS) atende quem quer ajuda.</span></div>` : ''}
      </div>`;
    };
    return `<div class="topbar">${back('#/inicio')}<div style="flex:1;margin-left:12px"><h2>Onde dá para economizar</h2><div class="sub">Análise de novembro</div></div>${aiBadge()}</div>
    <div class="pad" style="padding-top:4px">
      <div class="eco-sum">
        <div class="k">Com as mudanças que você escolheu</div>
        <div class="v">+${brl(eco)}<small>/mês</small></div>
        <div class="s">${brl0(eco * 12)} em um ano · ${destino}</div>
      </div>

      <div class="section"><div class="section-head"><h3>Para onde foi o dinheiro</h3><span class="small muted">${brl0(totDes)}</span></div>
        <div class="card">
          <div class="stack">${grupos.map(g => `<span style="flex:${g.v};background:${g.G.cor}"></span>`).join('')}</div>
          ${grupos.map(g => `<div class="grp"><span class="sw" style="background:${g.G.cor}"></span><span>${g.G.nome}<small>${g.G.desc}</small></span><b>${brl0(g.v)}</b></div>`).join('')}
        </div>
      </div>

      <div class="section"><div class="section-head"><h3>Sugestões da IA</h3><span class="small muted">ative o que quer tentar</span></div>
        <div class="ecos">${P.economias.filter(e => !e.essencial).map(card).join('')}</div></div>

      ${P.economias.some(e => e.essencial) ? `<div class="section"><div class="section-head"><h3>O essencial fica</h3></div>
        <div class="ecos">${P.economias.filter(e => e.essencial).map(card).join('')}</div></div>` : ''}

      <p class="disclaimer"><i class="bi bi-info-circle"></i><span>A IA compara seus gastos dos últimos meses. Nada muda sem você decidir.</span></p>
    </div>`;
  },

  /* ── Plano: muda conforme a fase ───────────────────────────────────── */
  plano(s) {
    const f = PS(s).fase;
    return f === 1 ? Screens.planoDividas(s) : f === 2 ? Screens.planoReserva(s) : Screens.carteira(s);
  },

  planoDividas(s) {
    const P = PS(s);
    const st = ST(s);
    const sim = simular(s);
    const sem13 = simular(s, { usar13: false });
    const fim = sim.meses ? mesLabel(sim.meses) : '—';
    const crescimento = semPlano(P);
    const nomes = Object.fromEntries(P.dividas.map(d => [d.id, d]));
    return `<div class="topbar"><div><h2>Seu plano</h2><div class="sub">Fase 1 de 3 · Sair do vermelho</div></div>${aiBadge()}</div>
    <div class="pad" style="padding-top:6px">
      <div class="hero-red">
        <i class="bi bi-pause-circle"></i>
        <div><b>Agora não é hora de investir — e tudo bem.</b>
        <span>O rotativo cobra cerca de 13% ao mês. Nenhum investimento rende isso: quitar a dívida cara é o melhor uso do seu dinheiro agora.</span></div>
      </div>

      <div class="card plan-res">
        <div class="small muted">Livre das dívidas em</div>
        <div class="big">${sim.meses ? `~${sim.meses} meses` : 'mais de 4 anos'}</div>
        <div class="small muted">em ${fim} · pagando ${brl0(sim.cap)} por mês</div>
        ${bars(sim.serie, i => i === 0 ? 'hoje' : mesLabel(i).split('/')[0])}
        <div class="toggles">
          <button class="tg" data-action="usar13"><span class="switch ${st.usar13 ? 'on' : ''}"></span><span>Usar a 1ª parcela do 13º (${brl0(P.extra13)})<small>${st.usar13 ? `Sem ela: ~${sem13.meses} meses` : `Com ela: ~${simular(s, { usar13: true }).meses} meses`}</small></span></button>
        </div>
        <div class="seg strat">
          <button class="${st.estrategia === 'juros' ? 'on' : ''}" data-action="estrategia" data-v="juros">Maior juros primeiro<small>economiza mais</small></button>
          <button class="${st.estrategia === 'menor' ? 'on' : ''}" data-action="estrategia" data-v="menor">Menor dívida primeiro<small>motiva mais</small></button>
        </div>
      </div>

      <div class="section"><div class="section-head"><h3>Ordem de pagamento</h3><span class="small muted">${brl0(totalDividas(P))} hoje</span></div>
        <div class="card list">${sim.ordem.map((d, k) => { const o = nomes[d.id]; return `<div class="kv debt">
          <span class="ord">${k + 1}</span>
          <span>${o.nome}<small>${o.reneg ? `após renegociar: ~${taxaTxt(o.reneg.taxa)} (era ${taxaTxt(o.taxa)})` : taxaTxt(o.taxa)}</small></span>
          <span class="dv-r"><b>${brl0(o.saldo)}</b><em class="quit">quitada em ${sim.quit[d.id] ? mesLabel(sim.quit[d.id]) : '—'}</em></span></div>`; }).join('')}</div>
      </div>

      <div class="section"><div class="section-head"><h3>Os 3 passos</h3></div>
        <div class="card pyr">
          <div class="pstep now"><span class="pn">1</span><div><b>Parar de aumentar a dívida</b><span>Guarde o cartão, use Pix ou débito e ative os cortes: ${brl0(economiaTotal(s))}/mês.</span>
            <a class="link small" href="#/economias">Ver economias</a></div></div>
          <div class="pstep next"><span class="pn">2</span><div><b>Trocar o rotativo por uma dívida mais barata</b><span>Renegociar o cartão em parcelas fixas derruba os juros de ~13% para ~4% ao mês.</span>
            <a class="link small" href="#/negociar">Como renegociar</a></div></div>
          <div class="pstep next"><span class="pn">3</span><div><b>Quitar na ordem</b><span>Cada dívida quitada libera dinheiro para a próxima.</span></div></div>
        </div>
      </div>

      ${crescimento ? `<div class="callout warn"><i class="bi bi-exclamation-triangle"></i><span><b>Sem o plano:</b> pagando só o mínimo, em 6 meses a dívida do cartão passa de ${brl0(nomes.cartao.saldo)} para cerca de <b>${brl0(crescimento)}</b>. Os juros são maiores que o pagamento.</span></div>` : ''}

      <div class="section"><div class="section-head"><h3>Depois</h3></div>
        <div class="card locked"><i class="bi bi-lock"></i><div><b>Fase 2 · Criar um colchão</b><span>Começa com R$ 500 e vai até 3 meses de gastos.</span></div></div>
        <div class="card locked" style="margin-top:8px"><i class="bi bi-lock"></i><div><b>Fase 3 · Fazer o dinheiro crescer</b><span>Investir só depois da reserva pronta.</span></div></div>
      </div>
    </div>`;
  },

  planoReserva(s) {
    const P = PS(s);
    const t = totals(ST(s).tx);
    const guardar = Math.max(t.saldo, 0) + economiaTotal(s);
    const custo = custoVida(P);
    const metas = [
      ['Colchão inicial', 500, 'Para um imprevisto pequeno: remédio, conserto, botijão.'],
      ['1 mês de gastos', custo, 'Já dá para respirar se a renda atrasar.'],
      ['Reserva completa', custo * P.mesesReserva, `${P.mesesReserva} meses de gastos. Depois disso, a fase 3 é liberada.`],
    ];
    return `<div class="topbar"><div><h2>Seu plano</h2><div class="sub">Fase 2 de 3 · Criar um colchão</div></div>${aiBadge()}</div>
    <div class="pad" style="padding-top:6px">
      <div class="hero-amber">
        <i class="bi bi-shield-check"></i>
        <div><b>Antes de investir, um colchão para os imprevistos.</b>
        <span>Sem reserva, qualquer emergência vira dívida no cartão. A reserva é o que te protege de voltar para o vermelho.</span></div>
      </div>

      <div class="card plan-res">
        <div class="small muted">Guardar por mês</div>
        <div class="big">${brl0(guardar)}</div>
        <div class="small muted">${brl0(Math.max(t.saldo, 0))} que já sobram + ${brl0(economiaTotal(s))} das economias <a class="link" href="#/economias">ajustar</a></div>
      </div>

      <div class="section"><div class="section-head"><h3>Suas metas</h3><span class="small muted">${brl0(P.reservaAtual)} guardados</span></div>
        <div class="metas">${metas.map(([nome, v, d]) => {
          const prog = Math.min(P.reservaAtual / v, 1);
          const meses = guardar > 0 ? Math.ceil(Math.max(v - P.reservaAtual, 0) / guardar) : null;
          return `<div class="card meta"><div class="meta-h"><b>${nome}</b><span>${brl0(v)}</span></div>
            <div class="meter"><span style="width:${prog * 100}%;background:var(--green)"></span></div>
            <div class="meta-f"><span>${d}</span><em>${meses ? `~${meses} ${meses === 1 ? 'mês' : 'meses'} · ${mesLabel(meses)}` : '—'}</em></div></div>`;
        }).join('')}</div>
      </div>

      <div class="section card">
        <div class="where" style="margin:0;padding:0;border:0"><i class="bi bi-info-circle"></i><span>A reserva costuma ficar em <b>renda fixa com resgate no mesmo dia e risco muito baixo</b>. O PragFy explica as opções; você escolhe onde.</span><a class="link" href="#/classe/renda-fixa">Ver opções</a></div>
      </div>
      <div class="card" style="margin-top:10px;display:flex;gap:12px;align-items:center">
        <i class="bi bi-calendar-check" style="font-size:22px;color:var(--accent-lt)"></i>
        <div style="flex:1"><div style="font-weight:600;font-size:14px">Guardar no dia em que o salário cai</div><div class="small muted">Antes de gastar. Lembrete todo dia 5.</div></div>
        <span class="switch on"></span>
      </div>

      <div class="section"><div class="section-head"><h3>Depois</h3></div>
        <div class="card locked"><i class="bi bi-lock"></i><div><b>Fase 3 · Fazer o dinheiro crescer</b><span>Liberada quando a reserva cobrir ${P.mesesReserva} meses de gastos.</span></div></div>
      </div>
    </div>`;
  },

  /* ── Negociar a dívida do cartão ───────────────────────────────────── */
  negociar(s) {
    const P = PS(s);
    const c = P.dividas.find(d => d.id === 'cartao') || { saldo: 3200, taxa: 0.13, reneg: { taxa: 0.04, parcelas: 18 } };
    const parc = pmt(c.saldo, c.reneg.taxa, c.reneg.parcelas);
    const msg = `Olá! Tenho uma dívida de ${brl0(c.saldo)} no cartão e estou no rotativo. Quero trocar por um parcelamento com juros menores. Consigo pagar até ${brl0(Math.ceil(parc / 10) * 10)} por mês. Qual é o Custo Efetivo Total (CET) e o valor final do acordo?`;
    const passos = [
      ['bi-geo-alt', 'Onde negociar', 'No app ou na agência do seu banco, em mutirões de renegociação (Procons e Banco Central costumam organizar) ou no consumidor.gov.br.'],
      ['bi-chat-left-text', 'O que pedir', 'Trocar o rotativo por parcelas fixas com juros menores. Se tiver algum dinheiro, peça desconto para pagar à vista.'],
      ['bi-question-circle', 'O que perguntar', 'O CET (custo efetivo total), o valor total que você vai pagar e se pode quitar antes com desconto.'],
      ['bi-shield-check', 'Seus direitos', 'O rotativo só pode durar até a fatura seguinte. Juros do rotativo e do parcelamento não passam de 100% da dívida original. Cheque especial: no máximo 8% ao mês.'],
    ];
    return `<div class="topbar">${back('#/plano')}<h2 style="flex:1;margin-left:12px">Renegociar o cartão</h2></div>
    <div class="pad" style="padding-top:4px">
      <div class="card plan-res">
        <div class="small muted">Acordo que cabe no seu plano</div>
        <div class="big">${c.reneg.parcelas}× ${brl0(parc)}</div>
        <div class="small muted">juros de ~${taxaTxt(c.reneg.taxa)} em vez de ~${taxaTxt(c.taxa)}</div>
      </div>
      <div class="section"><div class="card list">${passos.map(([i, t, d]) => `<div class="feat"><i class="bi ${i}"></i><div><b>${t}</b><span>${d}</span></div></div>`).join('')}</div></div>
      <div class="section"><div class="section-head"><h3>Mensagem pronta</h3>${aiBadge()}</div>
        <div class="card"><p class="desc" style="font-size:13.5px">${msg}</p>
          <button class="btn soft sm" style="margin-top:12px" data-action="copiar" data-v="${esc(msg)}"><i class="bi bi-clipboard"></i> Copiar mensagem</button></div>
      </div>
      <div class="callout warn"><i class="bi bi-exclamation-triangle"></i><span><b>Cuidado com golpes:</b> ninguém "limpa seu nome" cobrando taxa antes. Só pague boletos de acordo gerados no canal oficial do banco.</span></div>
    </div>`;
  },

  /* ── A classificar: transações sem categoria ───────────────────────── */
  classificar(s) {
    const st = ST(s);
    if (!st.pendentes.length) {
      return `<div class="topbar">${back('#/transacoes')}<h2 style="flex:1;margin-left:12px">A classificar</h2></div>
      <div class="pad"><div class="empty"><div class="ic ok"><i class="bi bi-check2-all"></i></div><h3>Tudo classificado!</h3>
      <p>Todos os seus gastos e receitas têm categoria. A análise da IA ficou mais precisa.</p><button class="btn" data-go="#/inicio">Voltar ao início</button></div></div>`;
    }
    return `<div class="topbar">${back('#/transacoes')}<div style="flex:1;margin-left:12px"><h2>A classificar</h2><div class="sub">${st.pendentes.length} transações sem categoria</div></div></div>
    <div class="pad" style="padding-top:4px">
      <p class="small muted" style="line-height:1.5;margin-bottom:12px">Todo gasto e toda receita precisam de categoria para a análise funcionar. A IA sugere; você confirma.</p>
      ${st.pendentes.map(p => {
        const sug = cat(p.sug);
        const inn = p.tipo === 'RECEITA';
        const aberto = st.classOpen === p.id;
        return `<div class="card pend">
          <div class="pend-h"><span class="bruto">${esc(p.bruto)}</span><b class="${inn ? 'in' : ''}">${inn ? '+' : '−'} ${brl(p.valor)}</b></div>
          <div class="small muted">${diaLabel(p.data)} · ${BANKS[p.origem].nome} · ${inn ? 'entrada' : 'saída'}</div>
          <div class="sug"><i class="bi bi-stars"></i><span>Parece <b>${sug.nome}</b>. ${p.porque}</span></div>
          <div class="pend-a">
            <button class="btn sm" data-action="classify" data-id="${p.id}" data-cat="${p.sug}"><i class="bi bi-check-lg"></i> Sim, é ${sug.nome}</button>
            <button class="btn ghost sm" data-action="classOpen" data-id="${p.id}">${aberto ? 'Fechar' : 'Escolher outra'}</button>
          </div>
          ${aberto ? `<div class="catgrid" style="margin:12px 0 0">${CATEGORIES.filter(c => c.tipo === p.tipo).map(c => `<button data-action="classify" data-id="${p.id}" data-cat="${c.id}"><i class="bi ${c.icone}" style="background:${c.cor}22;color:${c.cor}"></i>${c.nome}</button>`).join('')}</div>` : ''}
          <button class="remember" data-action="lembrar" data-id="${p.id}"><span class="switch ${st.lembrar[p.id] !== false ? 'on' : ''}"></span>Lembrar para as próximas de "${esc(p.chave)}"</button>
        </div>`;
      }).join('')}
    </div>`;
  },

  /* ── Carteira (fase 3): proporção por classe, sem indicar produtos ─── */
  carteira(s) {
    const P = PS(s);
    const a = alocacao(s);
    const t = totals(ST(s).tx);
    const sobra = t.saldo;
    const reserva = Math.min(P.aporteReserva || 0, sobra);
    const carteira = sobra - reserva;
    const r = reservaInfo(s);
    const parts = CLASSES_CARTEIRA.filter(k => a.aloc[k] > 0).map(k => ({ k, c: CLASSES[k], pct: a.aloc[k] }));
    return `<div class="topbar"><div><h2>Sua carteira</h2><div class="sub">Fase 3 de 3 · perfil ${a.perfil.nome}</div></div>${aiBadge()}</div>
    <div class="pad" style="padding-top:6px">
      <div class="split">
        <div class="k">Sobra do mês</div><div class="v">${brl(sobra)}</div>
        <div class="splitbar"><span style="flex:${reserva};background:#7dd3a8"></span><span style="flex:${carteira};background:#b9a6ff"></span></div>
        <div class="legend2"><span><i style="background:#7dd3a8"></i>Reserva ${brl(reserva)}</span><span><i style="background:#b9a6ff"></i>Carteira ${brl(carteira)}</span></div>
      </div>

      <div class="section"><div class="section-head"><h3>1. Reserva de emergência</h3><span class="small muted">${pct(r.pct)} completa</span></div>
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:baseline"><span class="muted small">Este mês</span><b style="font-size:18px">${brl(reserva)}</b></div>
          <div class="meter big"><span style="width:${r.pct * 100}%"></span><span class="add" style="width:${reserva / r.meta * 100}%"></span></div>
          <div class="small muted">${brl0(P.reservaAtual)} → ${brl0(P.reservaAtual + reserva)} de ${brl0(r.meta)} · completa em ~${Math.ceil(r.falta / reserva)} meses</div>
          <div class="where"><i class="bi bi-info-circle"></i><span>A reserva fica em <b>renda fixa com liquidez diária e risco muito baixo</b>.</span><a class="link" href="#/classe/renda-fixa">Ver opções</a></div>
        </div>
      </div>

      <div class="section"><div class="section-head"><h3>2. Carteira de longo prazo</h3><span class="small muted">${brl(carteira)} este mês</span></div>
        <div class="card"><div class="donut-wrap">
          <div class="donut" style="background:${conic(parts.map(x => ({ color: x.c.cor, pct: x.pct })))}"><div class="center"><div>Perfil<b>${a.perfil.nome}</b></div></div></div>
          <div class="legend">${parts.map(x => `<div><span class="sw" style="background:${x.c.cor}"></span>${x.c.curto || x.c.nome}<span class="pct">${x.pct}%</span></div>`).join('')}</div>
        </div></div>
        <div class="card" style="padding:4px 16px;margin-top:10px">${parts.map(x => `<a class="alloc" href="#/classe/${x.k}"><span class="sw" style="background:${x.c.cor}"></span>
          <div class="info"><div class="n">${x.c.curto || x.c.nome} · ${x.pct}%</div><div class="p">${x.c.opcoes.length} opções · risco ${RISCO_TXT[x.c.risco].toLowerCase()}</div></div>
          <div class="v">${brl(carteira * x.pct / 100)}</div><i class="bi bi-chevron-right muted"></i></a>`).join('')}</div>
      </div>

      ${a.ajustes.length ? `<div class="section"><div class="section-head"><h3>O que a IA ajustou para você</h3></div>
        ${a.ajustes.map(x => `<div class="callout ai"><i class="bi bi-stars"></i><span>${x}</span></div>`).join('')}</div>` : ''}

      <div class="callout" style="margin-top:16px"><i class="bi bi-shield-check"></i><span><b>O PragFy não indica produtos nem movimenta seu dinheiro.</b> Definimos a proporção com base em princípios usados por planejadores financeiros e explicamos cada opção para você escolher com consciência.</span></div>
    </div>`;
  },

  /* ── Aprender ──────────────────────────────────────────────────────── */
  aprender(s) {
    const P = PS(s);
    const a = alocacao(s);
    const card = k => { const c = CLASSES[k]; return `<a class="clscard" href="#/classe/${k}">
      <div class="ic" style="background:${c.cor}22;color:${c.cor}"><i class="bi ${c.icon}"></i></div>
      <div class="info"><div class="n">${c.nome}</div><div class="p">${c.opcoes.length} ${k === 'credito' ? 'tipos explicados' : 'opções explicadas'}</div>${risk(c.risco)}</div>
      ${P.fase === 3 && a.aloc[k] !== undefined ? `<span class="pctpill">${a.aloc[k]}%</span>` : ''}<i class="bi bi-chevron-right muted"></i></a>`; };
    return `<div class="topbar"><div><h2>Aprender</h2><div class="sub">Entenda antes de decidir</div></div></div>
    <div class="pad" style="padding-top:6px">
      <div class="input" style="margin-bottom:6px"><i class="bi bi-search"></i><input placeholder="Buscar: rotativo, CDB, FII, CET…"></div>
      <div class="section"><div class="section-head"><h3>Antes de investir</h3></div><div class="cls">${card('credito')}</div></div>
      <div class="section"><div class="section-head"><h3>${P.fase === 3 ? 'Classes da sua carteira' : 'Tipos de investimento'}</h3>${P.fase === 3 ? '<span class="small muted">% sugerido</span>' : ''}</div>
        <div class="cls">${CLASSES_CARTEIRA.map(card).join('')}</div></div>
      <div class="section"><div class="section-head"><h3>Outras formas de investir</h3></div>
        <p class="small muted" style="margin:-4px 0 10px;line-height:1.5">Não são classes novas: são "embalagens" que dão acesso às classes acima.</p>
        <div class="cls">${['fundos', 'previdencia'].map(card).join('')}</div></div>
    </div>`;
  },

  classe(s, p) {
    const id = CLASSES[p[0]] ? p[0] : 'fiis';
    const c = CLASSES[id];
    const P = PS(s);
    const a = alocacao(s);
    const L = { rende: 'Como rende', paga: 'Paga rendimentos?', risco: 'Risco', liquidez: 'Liquidez', imposto: 'Imposto', protecao: 'Proteção', ...(c.labels || {}) };
    const open = s.open[id] === undefined ? 0 : s.open[id];
    const ask = s.ask[id];
    const naCarteira = P.fase === 3 && a.aloc[id] !== undefined;
    return `<div class="topbar">${back('#/aprender')}<span class="small muted">${{ carteira: 'Classe de investimento', outros: 'Forma de investir', credito: 'Antes de investir' }[c.grupo]}</span><span style="width:40px"></span></div>
    <div class="pad" style="padding-top:2px">
      <div class="clshero" style="background:linear-gradient(160deg, ${c.cor}40, var(--bg-card) 75%)">
        <div class="ic" style="background:${c.cor}33;color:${c.cor}"><i class="bi ${c.icon}"></i></div>
        <h2>${c.nome}</h2>
        <p>${c.resumo}</p>
        <div class="facts">
          <div><span>${c.riscoTitulo || 'Risco'}</span>${risk(c.risco)}<b>${RISCO_TXT[c.risco]}</b></div>
          <div><span>${id === 'credito' ? 'Na prática' : 'Liquidez'}</span><b>${c.liquidez}</b></div>
          ${naCarteira ? `<div><span>Na sua carteira</span><b>${a.aloc[id]}%</b></div>` : ''}
        </div>
      </div>

      <div class="card" style="margin-top:14px"><div class="small muted" style="margin-bottom:6px;font-weight:600"><i class="bi bi-coin"></i> ${c.ganhoTitulo || 'Como você ganha dinheiro'}</div><p class="desc">${c.ganho}</p></div>

      <div class="section"><div class="section-head"><h3>${c.opcoesTitulo || `As opções dentro de ${c.curto || c.nome}`}</h3></div>
        <div class="acc">${c.opcoes.map((o, k) => {
          const on = open === k;
          return `<div class="acc-item ${on ? 'on' : ''}">
            <button class="acc-head" data-action="toggle" data-c="${id}" data-i="${k}">
              <span class="oic" style="background:${c.cor}22;color:${c.cor}"><i class="bi ${o.icon}"></i></span>
              <span class="t"><b>${o.nome}</b><small>${o.paga}</small></span>${risk(o.risco)}<i class="bi bi-chevron-down chev"></i></button>
            ${on ? `<div class="acc-body">
              <p class="lead2">${o.oque}</p>
              ${[['bi-graph-up', L.rende, o.rende], ['bi-cash-coin', L.paga, o.paga], ['bi-speedometer2', L.risco, RISCO_TXT[o.risco]], ['bi-droplet', L.liquidez, o.liquidez], ['bi-receipt', L.imposto, o.imposto], ['bi-shield', L.protecao, o.protecao]]
                .map(([ic, k2, v]) => `<div class="row"><i class="bi ${ic}"></i><span>${k2}</span><p>${v}</p></div>`).join('')}
              <div class="callout warn"><i class="bi bi-exclamation-triangle"></i><span>${o.atencao}</span></div>
            </div>` : ''}
          </div>`;
        }).join('')}</div>
      </div>

      <div class="section"><div class="section-head"><h3>Pergunte à IA</h3>${aiBadge()}</div>
        <div class="chip-row wrap">${c.perguntas.map((q, k) => `<button class="chip ${ask === k ? 'on' : ''}" data-action="ask" data-c="${id}" data-i="${k}">${q.q}</button>`).join('')}</div>
        ${ask !== undefined ? `<div class="qa"><div class="me">${c.perguntas[ask].q}</div><div class="bubble"><div class="bot"><i class="bi bi-stars"></i></div><div class="msg">${c.perguntas[ask].a}</div></div></div>` : ''}
        <div class="input" style="margin-top:12px"><i class="bi bi-chat-dots"></i><input placeholder="Digite sua dúvida sobre ${c.curto || c.nome}…"><i class="bi bi-send" style="color:var(--accent-lt)"></i></div>
      </div>
      <p class="disclaimer"><i class="bi bi-info-circle"></i><span>Conteúdo educativo. O PragFy não recomenda produtos específicos: explica as opções para você decidir.</span></p>
    </div>`;
  },

  /* ── Análises mensais da IA ────────────────────────────────────────── */
  analise(s) {
    const P = PS(s);
    return `<div class="topbar">${back('#/inicio')}<h2 style="flex:1;margin-left:12px">Análises mensais</h2>${aiBadge()}</div>
    <div class="pad" style="padding-top:4px">
      <div class="callout ai"><i class="bi bi-calendar-check"></i><span>Todo mês a IA relê seus gastos, sua renda e seus objetivos e refina o plano. <b>Próxima análise: 1º de dezembro.</b> ${P.proxima}</span></div>
      <div class="timeline">${P.analises.map(x => `<div class="tl ${x.atual ? 'now' : ''}">
        <span class="tdot"></span>
        <div class="card">
          <div class="small muted">${x.mes}${x.atual ? ' · <b style="color:var(--violet)">Atual</b>' : ''}</div>
          <div style="font-weight:700;margin:3px 0 6px">${x.titulo}</div>
          <p class="desc" style="font-size:13px">${x.texto}</p>
          ${x.mudancas.length ? `<div class="diffs">${x.mudancas.map(([k, de, para]) => `<div><span>${k}</span><s>${de}</s><i class="bi bi-arrow-right"></i><b>${para}</b></div>`).join('')}</div>` : ''}
        </div></div>`).join('')}</div>
    </div>`;
  },

  /* ── Início ────────────────────────────────────────────────────────── */
  inicio(s) {
    const P = PS(s);
    const st = ST(s);
    const t = totals(st.tx);
    const cats = despesasPorCategoria(st.tx);
    const parts = cats.map(x => ({ color: x.c.cor, pct: x.v / t.des * 100 }));
    const pend = st.pendentes[0];
    const eco = economiaTotal(s);
    const F = FASES[P.fase];
    let faseTxt, faseProg;
    if (P.fase === 1) { const sim = simular(s); faseTxt = `Próximo passo: renegociar o cartão e quitar o cheque especial. Livre das dívidas em ~${sim.meses} meses.`; faseProg = 0.05; }
    else if (P.fase === 2) { faseTxt = `Próximo passo: juntar o colchão de R$ 500. Você já tem ${brl0(P.reservaAtual)}.`; faseProg = P.reservaAtual / 500; }
    else { const r = reservaInfo(s); faseTxt = `Próximo passo: completar a reserva (${pct(r.pct)}) e investir o restante da sobra.`; faseProg = r.pct; }
    const neg = t.saldo < 0;
    return `
    <div class="hello">
      <div class="who">${avatar(P)}<div><div class="hi">Olá,</div><div class="name">${P.nome} 👋</div></div></div>
      <button class="iconbtn bell" data-go="#/classificar" aria-label="Notificações"><i class="bi bi-bell"></i>${st.pendentes.length ? `<span class="nbadge">${st.pendentes.length}</span>` : ''}</button>
    </div>
    <div class="pad" style="padding-top:0">
      ${pend ? `<div class="notif" data-go="#/classificar"><i class="bi bi-question-circle"></i><div><b>${pend.tipo === 'RECEITA' ? `Chegou ${brl(pend.valor)} de "${esc(pend.bruto.replace('PIX RECEBIDO ', '').replace('TED RECEBIDA ', ''))}"` : `Gasto de ${brl(pend.valor)} sem categoria`}</b>
        <span>${pend.tipo === 'RECEITA' ? 'O que é essa entrada?' : 'O que foi esse gasto?'} Toque para classificar${st.pendentes.length > 1 ? ` (+${st.pendentes.length - 1})` : ''}.</span></div><i class="bi bi-chevron-right"></i></div>` : ''}

      <div class="balance ${neg ? 'neg' : ''}">
        <div class="lbl"><span>Resultado de ${MES_REF.split(' ')[0].toLowerCase()}</span><span class="banks">${st.banks.map(b => bankLogo(b, 20)).join('')}</span></div>
        <div class="val">${brlS(t.saldo)}</div>
        ${neg ? '<div class="negtxt"><i class="bi bi-exclamation-circle"></i> Faltou dinheiro: o cheque especial cobriu a diferença.</div>' : ''}
        <div class="row">
          <div class="mini"><div class="k"><i class="bi bi-arrow-down-circle"></i> Entrou</div><div class="v">${brl(t.rec)}</div></div>
          <div class="mini"><div class="k"><i class="bi bi-arrow-up-circle"></i> Saiu</div><div class="v">${brl(t.des)}</div></div>
        </div>
      </div>

      <div class="card fase-card" data-go="#/plano">
        <div class="fase-h"><span class="ic" style="background:${F.cor}22;color:${F.cor}"><i class="bi ${F.icon}"></i></span>
          <div style="flex:1"><div class="small muted">Fase ${P.fase} de 3</div><b>${F.nome}</b></div>${faseSteps(P.fase)}</div>
        <div class="meter"><span style="width:${Math.max(faseProg, .04) * 100}%;background:${F.cor}"></span></div>
        <div class="small muted">${faseTxt}</div>
      </div>

      ${P.fase === 1 ? `<div class="card juros" data-go="#/plano"><i class="bi bi-percent"></i><div><b>${brl0(jurosMes(P))} de juros em novembro</b><span>Mais do que luz, água e gás juntos (R$ 265). O plano corta isso.</span></div><i class="bi bi-chevron-right muted"></i></div>` : ''}

      <div class="sobra" data-go="#/economias">
        <div class="ic"><i class="bi bi-scissors"></i></div>
        <div><div class="t">A IA encontrou ${brl0(eco)}/mês de economia</div><div class="d">Sem mexer no essencial · veja onde</div></div>
        <i class="bi bi-chevron-right"></i>
      </div>

      <div class="section">
        <div class="section-head"><h3>Gastos por categoria</h3><a class="link" href="#/categorias">Ver todas</a></div>
        <div class="card"><div class="donut-wrap">
          <div class="donut" style="background:${conic(parts)}"><div class="center"><div>Total<b>${brl(t.des)}</b></div></div></div>
          <div class="legend">${cats.slice(0, 5).map(x => `<div><span class="sw" style="background:${x.c.cor}"></span>${x.c.nome}<span class="pct">${Math.round(x.v / t.des * 100)}%</span></div>`).join('')}</div>
        </div></div>
      </div>

      <div class="card ana" data-go="#/analise"><i class="bi bi-stars"></i><div><b>Análise de novembro: ${P.analises[0].titulo.toLowerCase()}</b><span>Veja o que a IA mudou no seu plano</span></div><i class="bi bi-chevron-right muted"></i></div>

      <div class="section">
        <div class="section-head"><h3>Últimas transações</h3><a class="link" href="#/transacoes">Ver todas</a></div>
        <div class="card" style="padding:4px 16px">${st.tx.slice(0, 4).map(txRow).join('')}</div>
      </div>
    </div>`;
  },

  /* ── Gastos ────────────────────────────────────────────────────────── */
  transacoes(s) {
    const st = ST(s);
    const f = s.txFilter;
    const list = st.tx.filter(t => f === 'todas' || (f === 'receitas' ? t.tipo === 'RECEITA' : t.tipo === 'DESPESA'));
    const t = totals(st.tx);
    const groups = {};
    list.forEach(x => { (groups[x.data] = groups[x.data] || []).push(x); });
    return `
    <div class="topbar"><div><h2>Gastos</h2></div>
      <button class="chip" style="height:38px"><i class="bi bi-calendar3"></i> ${MES_REF} <i class="bi bi-chevron-down"></i></button>
    </div>
    <div class="pad" style="padding-top:0;padding-bottom:90px">
      ${st.pendentes.length ? `<div class="notif" data-go="#/classificar"><i class="bi bi-tags"></i><div><b>${st.pendentes.length} ${st.pendentes.length === 1 ? 'transação' : 'transações'} para classificar</b><span>A IA não reconheceu. Toque para dizer o que é.</span></div><i class="bi bi-chevron-right"></i></div>` : ''}
      <div class="of-strip"><i class="bi bi-arrow-repeat"></i>Sincronizado via Open Finance · categorizado pela IA</div>
      <div class="summary3">
        <div><div class="k">Entrou</div><div class="v" style="color:var(--green)">${brl(t.rec)}</div></div>
        <div><div class="k">Saiu</div><div class="v" style="color:var(--red)">${brl(t.des)}</div></div>
        <div><div class="k">Resultado</div><div class="v" style="color:${t.saldo < 0 ? 'var(--red)' : 'var(--text)'}">${brlS(t.saldo)}</div></div>
      </div>
      <div class="chip-row" style="margin-top:12px">
        ${[['todas', 'Todas'], ['receitas', 'Entradas'], ['despesas', 'Saídas']].map(([k, l]) => `<button class="chip ${f === k ? 'on' : ''}" data-action="filter" data-v="${k}">${l}</button>`).join('')}
        <button class="chip"><i class="bi bi-bank"></i> Contas</button>
      </div>
      ${Object.entries(groups).map(([d, items]) => `<div class="day">${diaLabel(d)}</div><div class="card" style="padding:4px 16px">${items.map(txRow).join('')}</div>`).join('')}
    </div>`;
  },

  _overlay(s, name) {
    if (name !== 'transacoes') return '';
    return `<button class="fab" data-go="#/transacoes/nova" aria-label="Novo lançamento"><i class="bi bi-plus-lg"></i></button>
      ${s.sheet ? Screens._sheet(s) : ''}`;
  },

  _sheet(s) {
    const n = s.newTx;
    const cats = CATEGORIES.filter(c => c.tipo === n.tipo);
    return `<div class="scrim" data-go="#/transacoes"></div>
    <div class="sheet">
      <div class="grab"></div>
      <h3>Lançamento manual</h3>
      <p class="small muted" style="margin:-8px 0 14px">Para o que não passa pelo banco, como dinheiro em espécie.</p>
      <div class="seg">
        <button class="out ${n.tipo === 'DESPESA' ? 'on' : ''}" data-action="tipo" data-v="DESPESA"><i class="bi bi-arrow-up-circle"></i> Saída</button>
        <button class="in ${n.tipo === 'RECEITA' ? 'on' : ''}" data-action="tipo" data-v="RECEITA"><i class="bi bi-arrow-down-circle"></i> Entrada</button>
      </div>
      <div class="amount"><div class="k">Valor</div><input id="nt-valor" inputmode="decimal" placeholder="R$ 0,00" value="${esc(n.valor)}"></div>
      <div class="field"><label>Descrição</label><div class="input"><i class="bi bi-pencil"></i><input id="nt-desc" placeholder="Ex.: Feira de domingo" value="${esc(n.desc)}"></div></div>
      <div class="field"><label>Categoria (obrigatória)</label></div>
      <div class="catgrid">${cats.map(c => `<button class="${n.cat === c.id ? 'on' : ''}" data-action="cat" data-v="${c.id}"><i class="bi ${c.icone}" style="background:${c.cor}22;color:${c.cor}"></i>${c.nome}</button>`).join('')}</div>
      <button class="btn" data-action="saveTx"><i class="bi bi-check-lg"></i> Salvar</button>
    </div>`;
  },

  categorias(s) {
    const tx = ST(s).tx;
    const totalPorCat = {};
    tx.forEach(t => { totalPorCat[t.cat] = (totalPorCat[t.cat] || 0) + t.valor; });
    const block = (list, titulo, sub) => {
      const max = Math.max(...list.map(c => totalPorCat[c.id] || 0), 1);
      return `<div class="section"><div class="section-head"><h3>${titulo}</h3><span class="small muted">${sub || list.length + ' categorias'}</span></div>
        <div class="cats">${list.map(c => {
          const v = totalPorCat[c.id] || 0;
          return `<div class="cat"><div class="ic" style="background:${c.cor}22;color:${c.cor}"><i class="bi ${c.icone}"></i></div>
            <div class="n">${c.nome}</div><div class="v">${v ? brl(v) : 'Sem lançamentos'}</div>
            <div class="meter"><span style="width:${v / max * 100}%;background:${c.cor}"></span></div></div>`;
        }).join('')}</div></div>`;
    };
    const desp = CATEGORIES.filter(c => c.tipo === 'DESPESA');
    return `<div class="topbar">${back('#/transacoes')}<h2 style="flex:1;margin-left:12px">Categorias</h2></div>
      <div class="pad" style="padding-top:0">
        ${Object.entries(GRUPOS).map(([g, G]) => block(desp.filter(c => c.grupo === g), G.nome, G.desc)).join('')}
        ${block(CATEGORIES.filter(c => c.tipo === 'RECEITA'), 'Entradas')}
      </div>`;
  },

  /* ── Conta ─────────────────────────────────────────────────────────── */
  conta(s) {
    const P = PS(s);
    const st = ST(s);
    return `<div class="topbar"><h2>Conta</h2></div>
    <div class="pad" style="padding-top:0">
      <div class="me">${avatar(P)}<div class="n">${P.nome}</div><div class="small muted">${P.email}</div></div>
      <div class="section-head"><h3>Perfil de exemplo</h3><span class="small muted">só no protótipo</span></div>
      <div class="card menu" style="padding:4px 0">
        ${Object.values(PERSONAS).map(x => `<button data-action="persona" data-v="${x.id}">${avatar(x, 'avatar sm')}
          <span style="flex:1">${x.nome}<small class="muted" style="display:block;font-size:12px">Fase ${x.fase} · ${FASES[x.fase].nome}</small></span>
          ${x.id === P.id ? '<i class="bi bi-check-circle-fill" style="color:var(--green)"></i>' : '<i class="bi bi-chevron-right muted"></i>'}</button>`).join('')}
      </div>
      <div class="section-head" style="margin-top:18px"><h3>Contas conectadas</h3><span class="small muted">Open Finance</span></div>
      <div class="card menu" style="padding:4px 0">
        ${st.banks.map(b => `<button>${bankLogo(b)}<span style="flex:1">${BANKS[b].nome}<small class="muted" style="display:block;font-size:12px">Ativo · renova em 11 meses</small></span><i class="bi bi-chevron-right muted"></i></button>`).join('')}
        <button data-go="#/conectar/bancos"><span class="mi"><i class="bi bi-plus-lg"></i></span>Conectar outra instituição</button>
      </div>
      <div class="card menu" style="padding:4px 0;margin-top:14px">
        <button data-go="#/situacao"><span class="mi"><i class="bi bi-clipboard2-pulse"></i></span>Meu diagnóstico<span class="right">Fase ${P.fase} <i class="bi bi-chevron-right"></i></span></button>
        <button data-go="#/diagnostico/1"><span class="mi"><i class="bi bi-arrow-repeat"></i></span>Atualizar respostas<span class="right"><i class="bi bi-chevron-right"></i></span></button>
        <button data-go="#/analise"><span class="mi"><i class="bi bi-stars"></i></span>Análises mensais<span class="right"><i class="bi bi-chevron-right"></i></span></button>
        <button data-go="#/categorias"><span class="mi"><i class="bi bi-tags"></i></span>Categorias<span class="right"><i class="bi bi-chevron-right"></i></span></button>
      </div>
      <div class="card menu" style="padding:4px 0;margin-top:14px">
        <button data-action="theme"><span class="mi"><i class="bi bi-moon-stars"></i></span>Tema escuro<span class="right"><span class="switch ${s.theme === 'dark' ? 'on' : ''}"></span></span></button>
        <button><span class="mi"><i class="bi bi-shield-lock"></i></span>Privacidade e consentimentos<span class="right"><i class="bi bi-chevron-right"></i></span></button>
        <button data-action="logout" class="danger"><span class="mi"><i class="bi bi-box-arrow-right danger"></i></span>Sair</button>
      </div>
      <p class="small muted" style="text-align:center;margin-top:18px">PragFy · protótipo v3.0</p>
    </div>`;
  },
};
