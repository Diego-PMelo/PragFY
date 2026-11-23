// Dados compartilhados do protótipo PragFy — todos fictícios.
// O PragFy NÃO indica produtos: define proporções e planos e explica as opções.
// Os dados de cada usuário de exemplo ficam em js/personas.js.

const MES_REF = 'Novembro 2026';
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/* ── Open Finance (bancos fictícios) ─────────────────────────────────── */
const BANKS = {
  aurora:    { nome: 'Banco Aurora',     cor: '#7c3aed', sigla: 'A' },
  horizonte: { nome: 'Banco Horizonte',  cor: '#ea580c', sigla: 'H' },
  raiz:      { nome: 'Cooperativa Raiz', cor: '#16a34a', sigla: 'R' },
  atlantico: { nome: 'Banco Atlântico',  cor: '#0284c7', sigla: 'At' },
  serra:     { nome: 'Banco Serra',      cor: '#b91c1c', sigla: 'S' },
  pixmais:   { nome: 'Digital Pix+',     cor: '#0f766e', sigla: 'P+' },
};

/* ── Categorias: todo gasto e toda receita têm um tipo ───────────────── */
const GRUPOS = {
  essencial:        { nome: 'Essencial',          cor: '#3355ff', desc: 'Não cortamos o essencial.' },
  ajustavel:        { nome: 'Dá para ajustar',    cor: '#f59e0b', desc: 'Onde costuma estar a economia.' },
  'custo-dinheiro': { nome: 'Custo do dinheiro',  cor: '#e05252', desc: 'Juros e tarifas: dinheiro que não volta.' },
  risco:            { nome: 'Risco',              cor: '#db2777', desc: 'Gastos que podem virar um problema.' },
  divida:           { nome: 'Pagamento de dívidas', cor: '#8b5cf6', desc: 'Parcelas e pagamentos de dívidas.' },
};

const CATEGORIES = [
  // Receitas
  { id: 'salario',     nome: 'Salário',              tipo: 'RECEITA', cor: '#1a9e5c', icone: 'bi-briefcase' },
  { id: 'bicos',       nome: 'Bicos e extras',       tipo: 'RECEITA', cor: '#8b5cf6', icone: 'bi-stars' },
  { id: 'vendas',      nome: 'Vendas',               tipo: 'RECEITA', cor: '#0891b2', icone: 'bi-basket' },
  { id: 'beneficios',  nome: 'Benefícios do governo', tipo: 'RECEITA', cor: '#16a34a', icone: 'bi-bank2' },
  { id: 'rendimentos', nome: 'Rendimentos',          tipo: 'RECEITA', cor: '#3355ff', icone: 'bi-graph-up' },
  { id: 'outrasrec',   nome: 'Outras entradas',      tipo: 'RECEITA', cor: '#64748b', icone: 'bi-plus-circle' },
  // Despesas
  { id: 'moradia',     nome: 'Moradia',              tipo: 'DESPESA', grupo: 'essencial',      cor: '#e55353', icone: 'bi-house' },
  { id: 'contas',      nome: 'Contas da casa',       tipo: 'DESPESA', grupo: 'essencial',      cor: '#6366f1', icone: 'bi-lightning' },
  { id: 'mercado',     nome: 'Mercado',              tipo: 'DESPESA', grupo: 'essencial',      cor: '#f59e0b', icone: 'bi-cart' },
  { id: 'transporte',  nome: 'Transporte',           tipo: 'DESPESA', grupo: 'essencial',      cor: '#0891b2', icone: 'bi-bus-front' },
  { id: 'saude',       nome: 'Saúde',                tipo: 'DESPESA', grupo: 'essencial',      cor: '#db2777', icone: 'bi-heart-pulse' },
  { id: 'celular',     nome: 'Celular e internet',   tipo: 'DESPESA', grupo: 'essencial',      cor: '#0ea5e9', icone: 'bi-phone' },
  { id: 'educacao',    nome: 'Educação',             tipo: 'DESPESA', grupo: 'essencial',      cor: '#14b8a6', icone: 'bi-mortarboard' },
  { id: 'delivery',    nome: 'Delivery e lanches',   tipo: 'DESPESA', grupo: 'ajustavel',      cor: '#fb923c', icone: 'bi-bag' },
  { id: 'apps',        nome: 'Apps de transporte',   tipo: 'DESPESA', grupo: 'ajustavel',      cor: '#38bdf8', icone: 'bi-car-front' },
  { id: 'assinaturas', nome: 'Assinaturas',          tipo: 'DESPESA', grupo: 'ajustavel',      cor: '#a78bfa', icone: 'bi-play-btn' },
  { id: 'lazer',       nome: 'Lazer',                tipo: 'DESPESA', grupo: 'ajustavel',      cor: '#65a30d', icone: 'bi-controller' },
  { id: 'vestuario',   nome: 'Vestuário',            tipo: 'DESPESA', grupo: 'ajustavel',      cor: '#c084fc', icone: 'bi-bag-heart' },
  { id: 'juros',       nome: 'Juros e encargos',     tipo: 'DESPESA', grupo: 'custo-dinheiro', cor: '#ef4444', icone: 'bi-percent' },
  { id: 'tarifas',     nome: 'Tarifas bancárias',    tipo: 'DESPESA', grupo: 'custo-dinheiro', cor: '#f87171', icone: 'bi-bank' },
  { id: 'apostas',     nome: 'Apostas',              tipo: 'DESPESA', grupo: 'risco',          cor: '#be185d', icone: 'bi-dice-5' },
  { id: 'parcelas',    nome: 'Parcelas de dívidas',  tipo: 'DESPESA', grupo: 'divida',         cor: '#7c3aed', icone: 'bi-credit-card' },
  { id: 'outros',      nome: 'Outros gastos',        tipo: 'DESPESA', grupo: 'ajustavel',      cor: '#94a3b8', icone: 'bi-three-dots' },
];

/* ── Diagnóstico financeiro ──────────────────────────────────────────── */
const DIAG_STEPS = [
  { id: 'renda',     icon: 'bi-cash-coin',        titulo: 'Quanto entra por mês?' },
  { id: 'gastos',    icon: 'bi-receipt',          titulo: 'Qual é o seu custo de vida?' },
  { id: 'dividas',   icon: 'bi-credit-card',      titulo: 'Você tem dívidas?' },
  { id: 'reserva',   icon: 'bi-piggy-bank',       titulo: 'O que você já tem guardado?' },
  { id: 'objetivos', icon: 'bi-bullseye',         titulo: 'O que você quer conquistar?' },
  { id: 'risco',     icon: 'bi-graph-down-arrow', titulo: 'Como você lida com risco?' },
  { id: 'palavras',  icon: 'bi-chat-quote',       titulo: 'Agora, com as suas palavras' },
];

const OPT = {
  vinculo:   [['clt', 'CLT'], ['servidor', 'Servidor'], ['autonomo', 'Autônomo'], ['informal', 'Sem carteira'], ['empresario', 'Empresário']],
  dependentes: [['0', 'Nenhum'], ['1', '1'], ['2', '2'], ['3', '3 ou mais']],
  gastoGrande: [['nao', 'Não'], ['viagem', 'Viagem'], ['casamento', 'Casamento'], ['carro', 'Carro'], ['outro', 'Outro']],
  dividas: [
    ['nao', 'Não tenho outras dívidas', ''],
    ['informal', 'Com parentes, amigos ou empréstimo informal', 'Não aparecem no banco, mas pesam no mês'],
    ['carne', 'Carnê ou crediário de loja', 'Juros costumam vir embutidos nas parcelas'],
    ['atrasadas', 'Contas atrasadas (luz, água, aluguel)', 'Podem gerar multa e corte do serviço'],
  ],
  investe: [['nao', 'Não invisto'], ['poupanca', 'Só a poupança'], ['rf', 'Renda fixa'], ['varios', 'Vários tipos']],
  objetivos: [
    ['sairdividas', 'bi-scissors', 'Sair das dívidas', '1 ano'],
    ['reserva', 'bi-shield-check', 'Ter uma reserva', '1 ano'],
    ['imovel', 'bi-house-door', 'Comprar imóvel', '5 anos'],
    ['aposentadoria', 'bi-sunrise', 'Aposentadoria', '30+ anos'],
    ['estudos', 'bi-mortarboard', 'Estudos', '2 anos'],
    ['carro', 'bi-car-front', 'Trocar de carro', '3 anos'],
  ],
  reacao: [
    ['venderia', 'Venderia tudo para não perder mais'],
    ['preocupado', 'Esperaria recuperar, mas ficaria preocupado'],
    ['tranquilo', 'Aproveitaria para investir mais'],
  ],
  experiencia: [['nunca', 'Nunca'], ['pouco', 'Um pouco'], ['sim', 'Sim, com frequência']],
};

/* ── Carteira: proporções por perfil (longo prazo) ───────────────────── */
// Base: princípios usados em planejamento financeiro — 1) quitar dívidas caras,
// 2) reserva de emergência, 3) carteira diversificada conforme o perfil.
const CLASSES_CARTEIRA = ['renda-fixa', 'fiis', 'acoes', 'internacional', 'cripto'];
const PERFIS = {
  CONSERVADOR: { nome: 'Conservador', cor: '#1d9e63', icon: 'bi-shield-check', aloc: { 'renda-fixa': 80, fiis: 8,  acoes: 7,  internacional: 5,  cripto: 0 } },
  MODERADO:    { nome: 'Moderado',    cor: '#d97706', icon: 'bi-graph-up',     aloc: { 'renda-fixa': 50, fiis: 15, acoes: 20, internacional: 12, cripto: 3 } },
  ARROJADO:    { nome: 'Arrojado',    cor: '#e05252', icon: 'bi-graph-up-arrow', aloc: { 'renda-fixa': 25, fiis: 15, acoes: 35, internacional: 20, cripto: 5 } },
};

/* ── Classes de investimento e as opções de cada uma ─────────────────── */
// risco: 1 muito baixo … 5 muito alto
const RISCO_TXT = ['', 'Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto'];

const CLASSES = {
  'renda-fixa': {
    nome: 'Renda Fixa', icon: 'bi-bank', cor: '#1d9e63', risco: 2, grupo: 'carteira',
    resumo: 'Você empresta dinheiro para o governo, um banco ou uma empresa e recebe juros combinados na hora da compra.',
    ganho: 'O rendimento vem dos juros, que podem ser pós-fixados (acompanham a Selic/CDI), prefixados (taxa fixa) ou híbridos (inflação + taxa). É a base de qualquer carteira e o lugar da reserva de emergência.',
    liquidez: 'De diária a só no vencimento',
    opcoes: [
      { nome: 'Tesouro Selic', icon: 'bi-building-check', paga: 'Não paga juros periódicos', risco: 1,
        oque: 'Título público: você empresta ao governo federal e recebe a taxa Selic, a taxa básica de juros do país.',
        rende: 'Pós-fixado: o rendimento acompanha a Selic dia a dia e se acumula até você vender.',
        liquidez: 'Diária — o dinheiro cai no dia útil seguinte.', imposto: 'IR de 22,5% a 15% sobre o lucro, menor quanto mais tempo investido.',
        protecao: 'Garantido pelo Tesouro Nacional.', atencao: 'É o título que menos oscila, por isso é muito usado para a reserva de emergência.' },
      { nome: 'Tesouro Prefixado', icon: 'bi-lock', paga: 'Com ou sem juros semestrais', risco: 2,
        oque: 'Título público com a taxa definida no dia da compra: você já sabe quanto terá no vencimento.',
        rende: 'Taxa fixa ao ano, garantida se você levar até o vencimento.',
        liquidez: 'Diária, mas o preço varia antes do vencimento.', imposto: 'IR de 22,5% a 15% (tabela regressiva).',
        protecao: 'Garantido pelo Tesouro Nacional.', atencao: 'Se vender antes do vencimento, pode ganhar mais ou menos que o combinado (marcação a mercado).' },
      { nome: 'Tesouro IPCA+', icon: 'bi-shield', paga: 'Com ou sem juros semestrais', risco: 2,
        oque: 'Título público que paga a inflação (IPCA) mais uma taxa fixa: seu dinheiro cresce acima da inflação se levado até o vencimento.',
        rende: 'Híbrido: inflação do período + taxa combinada na compra.',
        liquidez: 'Diária, mas com oscilação forte antes do vencimento.', imposto: 'IR de 22,5% a 15% (tabela regressiva).',
        protecao: 'Garantido pelo Tesouro Nacional.', atencao: 'Combina com objetivos longos. Vender antes pode dar prejuízo.' },
      { nome: 'CDB', icon: 'bi-building', paga: 'Geralmente tudo no resgate', risco: 2,
        oque: 'Você empresta dinheiro a um banco. Em troca, ele paga juros, normalmente um percentual do CDI (que acompanha a Selic).',
        rende: 'Pós-fixado (% do CDI), prefixado ou atrelado à inflação.',
        liquidez: 'Depende do título: diária ou só no vencimento.', imposto: 'IR de 22,5% a 15% (tabela regressiva).',
        protecao: 'FGC: até R$ 250 mil por CPF por instituição.', atencao: 'Confira a liquidez: muitos CDBs com taxa maior só podem ser resgatados no vencimento.' },
      { nome: 'LCI e LCA', icon: 'bi-tree', paga: 'No vencimento', risco: 2,
        oque: 'Parecidas com o CDB, mas o dinheiro financia o setor imobiliário (LCI) ou o agronegócio (LCA).',
        rende: 'Normalmente um percentual do CDI.',
        liquidez: 'Só depois de uma carência mínima de alguns meses.', imposto: 'Isentas de IR para pessoa física.',
        protecao: 'FGC: até R$ 250 mil por CPF por instituição.', atencao: 'Compare já descontando o imposto: 90% do CDI isento pode render mais que 110% tributado.' },
      { nome: 'Debêntures, CRI e CRA', icon: 'bi-briefcase', paga: 'Muitas pagam juros mensais ou semestrais', risco: 3,
        oque: 'Títulos de dívida de empresas (debêntures) ou ligados a créditos imobiliários (CRI) e do agronegócio (CRA).',
        rende: 'Pós, pré ou inflação + taxa — geralmente mais que os títulos de banco.',
        liquidez: 'Baixa: vender antes depende de achar comprador.', imposto: 'CRI, CRA e debêntures incentivadas são isentos de IR; as demais seguem a tabela regressiva.',
        protecao: 'Sem FGC: o risco é da empresa ou do devedor.', atencao: 'Pagam mais porque o risco de calote é maior.' },
      { nome: 'Poupança', icon: 'bi-piggy-bank', paga: 'Rende todo mês no "aniversário"', risco: 1,
        oque: 'A aplicação mais conhecida do país, disponível em qualquer banco.',
        rende: 'Regra fixa definida em lei, ligada à Selic e à TR.',
        liquidez: 'Diária.', imposto: 'Isenta de IR.',
        protecao: 'FGC: até R$ 250 mil por CPF por instituição.', atencao: 'Costuma render menos que outras opções de renda fixa com segurança parecida.' },
    ],
    perguntas: [
      { q: 'Onde deixo a reserva de emergência?', a: 'A reserva precisa de duas coisas: risco muito baixo e resgate rápido. Por isso ela costuma ficar em renda fixa pós-fixada com liquidez diária. Entre as opções que se encaixam estão o Tesouro Selic e CDBs com liquidez diária. A escolha do produto é sua — o PragFy só mostra o que cada um oferece.' },
      { q: 'CDB ou LCI, qual rende mais?', a: 'Depende da taxa e do prazo. A LCI não tem imposto, o CDB tem (de 22,5% a 15%). Um jeito simples de comparar: multiplique a taxa do CDB por (1 − alíquota). Ex.: 110% do CDI por 2 anos (IR de 15%) ≈ 93,5% do CDI líquido. Se a LCI pagar mais que isso, ela rende mais.' },
    ],
  },

  fiis: {
    nome: 'Fundos Imobiliários (FIIs)', curto: 'FIIs', icon: 'bi-buildings', cor: '#d97706', risco: 3, grupo: 'carteira',
    resumo: 'Fundos que investem no mercado imobiliário. Você compra cotas na bolsa e passa a ter uma fatia de imóveis ou de dívidas imobiliárias.',
    ganho: 'Duas formas: rendimentos (a maioria distribui renda todo mês, vinda de aluguéis ou juros) e valorização da cota na bolsa. Alguns tipos não pagam rendimento — veja abaixo.',
    liquidez: 'Venda na bolsa em dias úteis',
    opcoes: [
      { nome: 'FII de tijolo', icon: 'bi-building', paga: 'Sim, em geral todo mês', risco: 3,
        oque: 'É dono de imóveis físicos: shoppings, galpões logísticos, escritórios, hospitais, agências.',
        rende: 'Aluguéis pagos pelos inquilinos + valorização dos imóveis.',
        liquidez: 'Venda das cotas na bolsa; o preço oscila.', imposto: 'Rendimentos isentos de IR para pessoa física (seguindo regras do fundo); lucro na venda das cotas paga 20%.',
        protecao: 'Sem FGC.', atencao: 'Imóvel vazio (vacância) ou inquilino que sai reduzem a renda.' },
      { nome: 'FII de papel', icon: 'bi-file-earmark-text', paga: 'Sim, em geral todo mês (valor varia)', risco: 3,
        oque: 'Em vez de imóveis, compra dívidas do setor imobiliário, principalmente CRIs.',
        rende: 'Juros dessas dívidas, normalmente atrelados ao CDI ou à inflação.',
        liquidez: 'Venda das cotas na bolsa.', imposto: 'Rendimentos isentos de IR para pessoa física; lucro na venda paga 20%.',
        protecao: 'Sem FGC.', atencao: 'Se os devedores atrasarem, a renda cai. O rendimento sobe e desce com juros e inflação.' },
      { nome: 'Fundo de fundos (FoF)', icon: 'bi-collection', paga: 'Sim, em geral todo mês', risco: 3,
        oque: 'Compra cotas de vários outros FIIs. Com uma cota você fica exposto a dezenas de fundos.',
        rende: 'Rendimentos dos fundos que possui + ganhos ao vender cotas.',
        liquidez: 'Venda das cotas na bolsa.', imposto: 'Rendimentos isentos de IR para pessoa física; lucro na venda paga 20%.',
        protecao: 'Sem FGC.', atencao: 'Você paga duas camadas de taxa: a do FoF e a dos fundos que ele compra.' },
      { nome: 'FII de desenvolvimento', icon: 'bi-cone-striped', paga: 'Muitas vezes não paga durante a obra', risco: 4,
        oque: 'Financia a construção de imóveis para vender ou alugar depois de prontos.',
        rende: 'Lucro na venda ou no aluguel quando a obra termina.',
        liquidez: 'Venda das cotas na bolsa, geralmente com pouco volume.', imposto: 'Mesmas regras dos outros FIIs.',
        protecao: 'Sem FGC.', atencao: 'O ganho só aparece depois e depende da obra sair no prazo e do imóvel ser vendido ou alugado.' },
      { nome: 'FII híbrido', icon: 'bi-intersect', paga: 'Sim, em geral todo mês', risco: 3,
        oque: 'Mistura imóveis físicos e títulos de dívida imobiliária.',
        rende: 'Aluguéis + juros das dívidas.',
        liquidez: 'Venda das cotas na bolsa.', imposto: 'Mesmas regras dos outros FIIs.',
        protecao: 'Sem FGC.', atencao: 'Leia o relatório mensal para saber quanto há de cada parte.' },
    ],
    perguntas: [
      { q: 'Todo FII paga rendimento todo mês?', a: 'Não. FIIs de tijolo, papel e fundos de fundos costumam distribuir renda mensal, porque a lei obriga a repassar a maior parte do lucro em caixa. Já os FIIs de desenvolvimento podem passar meses ou anos sem pagar nada, porque o dinheiro está numa obra. E nenhum rendimento é garantido: ele varia com aluguéis, juros e inadimplência.' },
      { q: 'FII de papel é mais arriscado que tijolo?', a: 'São riscos diferentes. No tijolo, o risco é o imóvel ficar vazio ou perder valor. No papel, é o devedor atrasar o pagamento da dívida. O papel costuma ter uma renda que acompanha juros e inflação; o tijolo tende a valorizar junto com os imóveis no longo prazo.' },
    ],
  },

  acoes: {
    nome: 'Ações', icon: 'bi-graph-up-arrow', cor: '#e05252', risco: 4, grupo: 'carteira',
    resumo: 'Você vira sócio de empresas listadas na bolsa brasileira (B3).',
    ganho: 'Duas formas: valorização da ação ao longo do tempo e parte do lucro distribuída aos sócios (dividendos e juros sobre capital próprio).',
    liquidez: 'Venda na bolsa em dias úteis',
    opcoes: [
      { nome: 'Ações que pagam dividendos', icon: 'bi-cash-coin', paga: 'Sim, em datas definidas pela empresa', risco: 3,
        oque: 'Empresas maduras e estáveis que distribuem boa parte do lucro aos acionistas.',
        rende: 'Dividendos periódicos + alguma valorização.',
        liquidez: 'Venda na bolsa.', imposto: 'Dividendos são isentos para a grande maioria dos investidores; JCP tem IR retido na fonte.',
        protecao: 'Sem garantia.', atencao: 'Dividendo alto num ano não garante o mesmo no próximo: depende do lucro.' },
      { nome: 'Ações de crescimento', icon: 'bi-rocket-takeoff', paga: 'Pouco ou nada', risco: 4,
        oque: 'Empresas que reinvestem o lucro para crescer mais rápido.',
        rende: 'Principalmente valorização da ação.',
        liquidez: 'Venda na bolsa.', imposto: 'Lucro na venda: isento se o total vendido no mês for até R$ 20 mil; acima disso, 15%.',
        protecao: 'Sem garantia.', atencao: 'Oscilam mais, porque o preço depende das expectativas sobre o futuro.' },
      { nome: 'Small caps', icon: 'bi-graph-up', paga: 'Varia', risco: 5,
        oque: 'Empresas de menor valor de mercado.',
        rende: 'Valorização, com mais potencial e mais risco.',
        liquidez: 'Menor: algumas são pouco negociadas.', imposto: 'Mesmas regras das demais ações.',
        protecao: 'Sem garantia.', atencao: 'Podem subir ou cair muito em pouco tempo.' },
      { nome: 'ETFs de índice', icon: 'bi-pie-chart', paga: 'A maioria reinveste automaticamente', risco: 4,
        oque: 'Fundo negociado na bolsa que replica um índice, como o Ibovespa. Uma cota = um pedacinho de dezenas de empresas.',
        rende: 'Acompanha o desempenho do índice.',
        liquidez: 'Venda na bolsa.', imposto: '15% sobre o lucro na venda (sem a isenção de R$ 20 mil das ações).',
        protecao: 'Sem garantia.', atencao: 'Taxa de administração costuma ser baixa; é a forma mais simples de diversificar.' },
    ],
    perguntas: [
      { q: 'Preciso escolher empresas sozinho?', a: 'Não necessariamente. Quem não quer analisar empresa por empresa costuma usar ETFs de índice, que já trazem várias empresas numa cota só. Quem escolhe ações individuais precisa acompanhar resultados e notícias de cada empresa.' },
      { q: 'Dividendo é garantido?', a: 'Não. A empresa distribui parte do lucro quando ele existe. Se o lucro cair, o dividendo cai junto — e a empresa pode decidir reter o dinheiro para investir.' },
    ],
  },

  internacional: {
    nome: 'Internacional', icon: 'bi-globe2', cor: '#8b5cf6', risco: 4, grupo: 'carteira',
    resumo: 'Investir em empresas e ativos de outros países, normalmente cotados em dólar.',
    ganho: 'Valorização dos ativos lá fora + variação do dólar. Também ajuda quando a economia brasileira vai mal, porque o risco fica espalhado.',
    liquidez: 'De dias úteis na B3 a alguns dias (conta no exterior)',
    opcoes: [
      { nome: 'ETFs internacionais na B3', icon: 'bi-pie-chart', paga: 'Em geral reinvestem', risco: 3,
        oque: 'ETFs negociados aqui que replicam índices de outros países, como o das 500 maiores empresas dos EUA.',
        rende: 'Desempenho do índice estrangeiro + variação do dólar.',
        liquidez: 'Venda na bolsa brasileira.', imposto: '15% sobre o lucro na venda.',
        protecao: 'Sem garantia.', atencao: 'É o caminho mais simples: compra em reais, pela corretora que você já usa.' },
      { nome: 'BDRs', icon: 'bi-receipt-cutoff', paga: 'Repassa dividendos da empresa', risco: 4,
        oque: 'Recibos negociados na B3 que representam ações de empresas estrangeiras.',
        rende: 'Valorização da ação lá fora + variação do dólar.',
        liquidez: 'Venda na B3; alguns têm pouca negociação.', imposto: '15% sobre o lucro na venda; dividendos são tributados.',
        protecao: 'Sem garantia.', atencao: 'Confira o volume de negociação antes de comprar.' },
      { nome: 'Conta em corretora no exterior', icon: 'bi-airplane', paga: 'Depende do ativo', risco: 4,
        oque: 'Abrir conta fora do país e comprar ações e ETFs diretamente.',
        rende: 'Valorização em dólar.',
        liquidez: 'Alta lá fora, mas mandar e trazer dinheiro leva dias.', imposto: 'Rendimentos no exterior são tributados anualmente e precisam ser declarados.',
        protecao: 'Proteções do país da corretora.', atencao: 'Mais opções, mas mais burocracia: câmbio, IOF e declaração.' },
      { nome: 'Fundos com ativos no exterior', icon: 'bi-layers', paga: 'Não, a cota valoriza', risco: 3,
        oque: 'Fundos geridos no Brasil que aplicam parte ou todo o dinheiro lá fora.',
        rende: 'Desempenho dos ativos do fundo, com ou sem o efeito do dólar.',
        liquidez: 'Resgate em alguns dias.', imposto: 'Segue as regras do tipo de fundo.',
        protecao: 'Sem garantia.', atencao: 'Alguns fazem "hedge" e anulam o efeito do dólar — verifique.' },
    ],
    perguntas: [
      { q: 'Preciso ter dólar para investir lá fora?', a: 'Não. ETFs internacionais e BDRs são comprados em reais na B3. O valor deles acompanha o dólar, mas a compra e a venda são feitas aqui, pela corretora de sempre.' },
      { q: 'O que significa um fundo com hedge?', a: '"Hedge" é uma proteção contra a variação da moeda. Um fundo com hedge ganha (ou perde) só com os ativos lá fora, sem o efeito do dólar. Sem hedge, se o dólar subir, seu investimento sobe junto.' },
    ],
  },

  cripto: {
    nome: 'Criptoativos', icon: 'bi-currency-bitcoin', cor: '#0ea5e9', risco: 5, grupo: 'carteira',
    resumo: 'Ativos digitais registrados em blockchain, sem controle de um banco central.',
    ganho: 'Basicamente valorização. Não há juros nem dividendos, e a oscilação é muito alta.',
    liquidez: '24 horas por dia, todos os dias',
    opcoes: [
      { nome: 'Bitcoin', icon: 'bi-currency-bitcoin', paga: 'Não', risco: 5,
        oque: 'A primeira e maior criptomoeda, com quantidade máxima limitada a 21 milhões.',
        rende: 'Apenas valorização.',
        liquidez: 'Venda a qualquer hora em corretoras de cripto.', imposto: 'Lucro em vendas acima de R$ 35 mil no mês paga IR (de 15% a 22,5%).',
        protecao: 'Nenhuma: sem FGC e sem garantia.', atencao: 'Pode cair mais de 50% em poucos meses.' },
      { nome: 'Outras criptomoedas', icon: 'bi-coin', paga: 'Não', risco: 5,
        oque: 'Milhares de outros projetos, como redes para contratos inteligentes.',
        rende: 'Apenas valorização.',
        liquidez: 'Varia muito de moeda para moeda.', imposto: 'Mesmas regras do Bitcoin.',
        protecao: 'Nenhuma.', atencao: 'Muitas perdem quase todo o valor; é onde aparecem mais golpes.' },
      { nome: 'Stablecoins', icon: 'bi-currency-dollar', paga: 'Não', risco: 3,
        oque: 'Criptomoedas que buscam manter o valor igual ao de uma moeda, como o dólar.',
        rende: 'Não rendem por si só: servem para guardar ou transferir valor.',
        liquidez: 'Alta.', imposto: 'Mesmas regras das criptos.',
        protecao: 'Nenhuma.', atencao: 'Dependem da confiança na empresa que emite e nas reservas dela.' },
      { nome: 'ETFs de cripto na B3', icon: 'bi-pie-chart', paga: 'Não', risco: 5,
        oque: 'Fundos negociados na bolsa que seguem o preço de uma ou mais criptomoedas.',
        rende: 'Variação das criptos.',
        liquidez: 'Venda na bolsa em dias úteis.', imposto: '15% sobre o lucro na venda.',
        protecao: 'Regulados pela CVM; você não precisa guardar chaves digitais.', atencao: 'Mesmo regulado, oscila tanto quanto a cripto que acompanha.' },
    ],
    perguntas: [
      { q: 'Por que tão pouco cripto na carteira?', a: 'Porque a oscilação é muito alta. Uma fatia pequena limita o estrago se o preço cair muito e ainda permite participar se subir. Por isso a proporção sugerida costuma ficar entre 0% e 5%, dependendo do perfil.' },
      { q: 'Como evitar golpes?', a: 'Desconfie de promessas de retorno garantido, de "consultores" que pedem para você enviar dinheiro e de projetos sem informações públicas. Use apenas corretoras conhecidas ou ETFs regulados na B3.' },
    ],
  },

  fundos: {
    nome: 'Fundos de investimento', icon: 'bi-people', cor: '#0891b2', risco: 3, grupo: 'outros',
    resumo: 'Um "condomínio" de investidores: um gestor profissional decide onde aplicar o dinheiro de todos.',
    ganho: 'Valorização da cota, já descontadas as taxas. É uma forma de acessar as classes acima com gestão profissional.',
    liquidez: 'Resgate em alguns dias, conforme o fundo',
    opcoes: [
      { nome: 'Fundos DI e Renda Fixa', icon: 'bi-bank', paga: 'Não, a cota valoriza', risco: 1,
        oque: 'Investem em títulos de renda fixa, como os do Tesouro e de bancos.', rende: 'Próximo do CDI, menos as taxas.',
        liquidez: 'Geralmente diária.', imposto: 'Tabela regressiva + "come-cotas" em maio e novembro.',
        protecao: 'Sem FGC.', atencao: 'Taxa de administração acima de 0,5% ao ano costuma comer boa parte do rendimento.' },
      { nome: 'Multimercado', icon: 'bi-shuffle', paga: 'Não, a cota valoriza', risco: 3,
        oque: 'O gestor pode investir em juros, ações, moedas e outros mercados ao mesmo tempo.', rende: 'Depende das apostas do gestor.',
        liquidez: 'De alguns dias a um mês.', imposto: 'Tabela regressiva + come-cotas.',
        protecao: 'Sem FGC.', atencao: 'Muitos cobram taxa de performance quando batem uma meta.' },
      { nome: 'Fundos de ações', icon: 'bi-graph-up-arrow', paga: 'Não, a cota valoriza', risco: 4,
        oque: 'Aplicam pelo menos 67% do patrimônio em ações.', rende: 'Valorização das ações escolhidas pelo gestor.',
        liquidez: 'Resgate em alguns dias.', imposto: '15% sobre o lucro no resgate.',
        protecao: 'Sem FGC.', atencao: 'Compare o resultado com o de um ETF de índice, que costuma ser mais barato.' },
      { nome: 'Fundos cambiais', icon: 'bi-currency-exchange', paga: 'Não, a cota valoriza', risco: 3,
        oque: 'Acompanham a variação de uma moeda estrangeira, como o dólar.', rende: 'Variação da moeda.',
        liquidez: 'Resgate em poucos dias.', imposto: 'Tabela regressiva + come-cotas.',
        protecao: 'Sem FGC.', atencao: 'Servem para proteção, não para render juros.' },
    ],
    perguntas: [
      { q: 'O que é come-cotas?', a: 'É uma antecipação do imposto de renda cobrada em maio e novembro em fundos abertos de renda fixa, multimercado e cambiais. O fundo "come" algumas cotas para pagar o IR, mesmo sem você resgatar.' },
    ],
  },

  previdencia: {
    nome: 'Previdência privada', icon: 'bi-umbrella', cor: '#64748b', risco: 2, grupo: 'outros',
    resumo: 'Um plano de longo prazo com regras próprias de imposto, pensado para aposentadoria e sucessão.',
    ganho: 'Por dentro, a previdência investe em fundos (renda fixa, multimercado ou ações). O diferencial é a forma de tributação.',
    liquidez: 'Resgate após carência, em alguns dias',
    opcoes: [
      { nome: 'PGBL', icon: 'bi-receipt', paga: 'Não, acumula até o resgate', risco: 2,
        oque: 'Permite deduzir até 12% da renda bruta tributável no IR, para quem faz a declaração completa.', rende: 'Conforme os fundos do plano.',
        liquidez: 'Após a carência do plano.', imposto: 'No resgate, o IR incide sobre o valor total.',
        protecao: 'Não entra em inventário.', atencao: 'O benefício só existe para quem faz a declaração completa do IR.' },
      { nome: 'VGBL', icon: 'bi-receipt-cutoff', paga: 'Não, acumula até o resgate', risco: 2,
        oque: 'Não deduz no IR, mas no resgate o imposto incide só sobre o rendimento.', rende: 'Conforme os fundos do plano.',
        liquidez: 'Após a carência do plano.', imposto: 'IR apenas sobre o rendimento.',
        protecao: 'Não entra em inventário.', atencao: 'Costuma fazer mais sentido para quem usa a declaração simplificada.' },
      { nome: 'Tabela regressiva ou progressiva', icon: 'bi-sort-down', paga: '—', risco: 1,
        oque: 'Na regressiva, o IR cai com o tempo até 10% após 10 anos. Na progressiva, segue a tabela do IR (até 27,5%).', rende: '—',
        liquidez: '—', imposto: 'A escolha é feita na contratação.',
        protecao: '—', atencao: 'Para prazos longos, a regressiva costuma pagar menos imposto.' },
    ],
    perguntas: [
      { q: 'Previdência vale a pena?', a: 'Depende de três coisas: as taxas do plano, o seu tipo de declaração de IR e o prazo. Planos com taxas altas costumam perder para investir diretamente. A vantagem está no imposto (PGBL) e na sucessão, porque o dinheiro não entra em inventário.' },
    ],
  },
};
