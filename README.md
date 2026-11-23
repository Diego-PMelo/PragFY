# PragFy — Seu dinheiro, sem mistério

Protótipo navegável da startup **PragFy** (Startup One · FIAP 2TDS · Fase 4).

**Acesse:** https://tiny-squirrel-c134ec.netlify.app

## O problema

A maioria dos brasileiros não tem sobra no fim do mês, e muitos estão endividados no cartão, no cheque especial ou no carnê. Apps de finanças costumam partir de quem já tem dinheiro para investir.

## A solução

O PragFy conecta as contas via **Open Finance**, usa **IA para entender a situação real** de cada pessoa, mostra **onde dá para economizar** e monta o plano da fase em que ela está:

| Fase | Para quem | O que o app faz |
|---|---|---|
| 1 · Sair do vermelho | Quem tem dívidas caras | Diz que não é hora de investir e monta um plano de quitação: simulação mês a mês, estratégia (maior juros ou menor dívida), uso do 13º e guia para renegociar |
| 2 · Criar um colchão | Quem não tem dívidas, mas também não tem reserva | Reserva em metas (R$ 500 → 1 mês → 3 meses de gastos), com prazo a partir das economias |
| 3 · Fazer o dinheiro crescer | Quem já tem sobra e reserva | Proporção da carteira por classe de investimento, ajustada pela IA |

Em todas as fases:
- **Todo gasto e toda receita têm categoria.** O que chega pelo Open Finance sem categoria vira uma notificação pedindo para o usuário classificar, com a sugestão da IA.
- **A IA analisa os gastos** e sugere economias, separando o essencial (que não é cortado) do que dá para ajustar, do custo do dinheiro (juros e tarifas) e dos riscos, como as apostas.
- **Aprender:** cada classe de investimento e cada tipo de dívida explicados em linguagem simples, com um "Pergunte à IA".
- **Análises mensais:** a IA relê os dados todo mês e refina o plano.

> O PragFy não indica produtos financeiros: mostra proporções, caminhos e explicações para o usuário decidir.

## Perfis de exemplo

O protótipo traz 3 perfis fictícios, um em cada fase. Dá para trocar no painel ao lado do celular (no computador) ou em **Conta**:

- **Maria:** renda de R$ 2.350, rotativo do cartão e cheque especial (fase 1)
- **Ana:** renda de R$ 3.100, sem dívidas, mas sobra só R$ 60 (fase 2)
- **Diego:** renda de R$ 8.700, com sobra para investir (fase 3)

Todos os dados e bancos são fictícios.

## Como rodar localmente

Não há build nem dependências: é HTML, CSS e JavaScript puro.

```bash
python -m http.server 5510
```

Depois abra http://localhost:5510. Abrir o `index.html` direto no navegador também funciona.

## Estrutura

```
index.html            casca do app, moldura de celular e painel de apresentação
css/                  app.css (base) · v2.css · v3.css (componentes por versão)
js/data.js            categorias, bancos, classes de investimento e regras da carteira
js/credito.js         conteúdo de "Dívidas e crédito"
js/personas.js        os 3 perfis de exemplo (transações, dívidas, economias, análises)
js/screens.js         todas as telas e as regras (simulação de dívidas, metas, carteira)
js/app.js             roteador por hash, estado e eventos
assets/               logo
prints/               prints das telas usados na entrega
entrega/              PDF da atividade de prototipação
ferramentas/          scripts para refazer os prints (shots.ps1) e o PDF (fill_template.py)
```

**Modo de captura:** `?shot=1&p=maria#/plano` abre a tela sem moldura e sem animações. Parâmetros extras: `scroll`, `c`, `open` e `ask`.

---

Diego Pinheiro de Melo · Grupo 65 · 2TDS
