-- ============================================================
-- SEED - PragFY
-- Dados iniciais para desenvolvimento e demonstração
-- Mês de referência: Maio / 2026
-- ============================================================


-- ── Usuário de demonstração ───────────────────────────────────
INSERT INTO TB_USERS (nome, email, senha, created_at)
VALUES ('Diego', 'diego@pragfy.com', '123456', CURRENT_TIMESTAMP);


-- ── Categorias de Receita ─────────────────────────────────────
INSERT INTO TB_CATEGORIES (user_id, nome, tipo, cor, icone)
VALUES ((SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
        'Salário', 'INCOME', '#1a9e5c', 'bi-briefcase');

INSERT INTO TB_CATEGORIES (user_id, nome, tipo, cor, icone)
VALUES ((SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
        'Freelance', 'INCOME', '#8b5cf6', 'bi-gift');

INSERT INTO TB_CATEGORIES (user_id, nome, tipo, cor, icone)
VALUES ((SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
        'Investimentos', 'INCOME', '#0426b0', 'bi-graph-up');


-- ── Categorias de Despesa ─────────────────────────────────────
INSERT INTO TB_CATEGORIES (user_id, nome, tipo, cor, icone)
VALUES ((SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
        'Moradia', 'EXPENSE', '#e55353', 'bi-house');

INSERT INTO TB_CATEGORIES (user_id, nome, tipo, cor, icone)
VALUES ((SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
        'Alimentação', 'EXPENSE', '#f59e0b', 'bi-cart');

INSERT INTO TB_CATEGORIES (user_id, nome, tipo, cor, icone)
VALUES ((SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
        'Transporte', 'EXPENSE', '#0891b2', 'bi-car-front');

INSERT INTO TB_CATEGORIES (user_id, nome, tipo, cor, icone)
VALUES ((SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
        'Saúde', 'EXPENSE', '#db2777', 'bi-heart-pulse');

INSERT INTO TB_CATEGORIES (user_id, nome, tipo, cor, icone)
VALUES ((SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
        'Lazer', 'EXPENSE', '#65a30d', 'bi-controller');

INSERT INTO TB_CATEGORIES (user_id, nome, tipo, cor, icone)
VALUES ((SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
        'Serviços', 'EXPENSE', '#0891b2', 'bi-lightning');


-- ── Transações — Maio 2026 ────────────────────────────────────

-- Receitas
INSERT INTO TB_TRANSACTIONS (user_id, category_id, valor, descricao, transaction_date, tipo)
VALUES (
    (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
    (SELECT id FROM TB_CATEGORIES WHERE nome = 'Salário'
        AND user_id = (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com')),
    7500.00, 'Salário Maio 2026',
    TO_DATE('2026-05-05', 'YYYY-MM-DD'), 'INCOME'
);

INSERT INTO TB_TRANSACTIONS (user_id, category_id, valor, descricao, transaction_date, tipo)
VALUES (
    (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
    (SELECT id FROM TB_CATEGORIES WHERE nome = 'Freelance'
        AND user_id = (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com')),
    1200.00, 'Projeto site institucional',
    TO_DATE('2026-05-12', 'YYYY-MM-DD'), 'INCOME'
);

-- Despesas
INSERT INTO TB_TRANSACTIONS (user_id, category_id, valor, descricao, transaction_date, tipo)
VALUES (
    (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
    (SELECT id FROM TB_CATEGORIES WHERE nome = 'Moradia'
        AND user_id = (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com')),
    1800.00, 'Aluguel',
    TO_DATE('2026-05-01', 'YYYY-MM-DD'), 'EXPENSE'
);

INSERT INTO TB_TRANSACTIONS (user_id, category_id, valor, descricao, transaction_date, tipo)
VALUES (
    (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
    (SELECT id FROM TB_CATEGORIES WHERE nome = 'Alimentação'
        AND user_id = (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com')),
    520.00, 'Supermercado mensal',
    TO_DATE('2026-05-08', 'YYYY-MM-DD'), 'EXPENSE'
);

INSERT INTO TB_TRANSACTIONS (user_id, category_id, valor, descricao, transaction_date, tipo)
VALUES (
    (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
    (SELECT id FROM TB_CATEGORIES WHERE nome = 'Serviços'
        AND user_id = (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com')),
    230.00, 'Energia + Internet',
    TO_DATE('2026-05-10', 'YYYY-MM-DD'), 'EXPENSE'
);

INSERT INTO TB_TRANSACTIONS (user_id, category_id, valor, descricao, transaction_date, tipo)
VALUES (
    (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
    (SELECT id FROM TB_CATEGORIES WHERE nome = 'Transporte'
        AND user_id = (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com')),
    180.00, 'Combustível',
    TO_DATE('2026-05-15', 'YYYY-MM-DD'), 'EXPENSE'
);

INSERT INTO TB_TRANSACTIONS (user_id, category_id, valor, descricao, transaction_date, tipo)
VALUES (
    (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
    (SELECT id FROM TB_CATEGORIES WHERE nome = 'Saúde'
        AND user_id = (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com')),
    100.00, 'Academia',
    TO_DATE('2026-05-01', 'YYYY-MM-DD'), 'EXPENSE'
);

INSERT INTO TB_TRANSACTIONS (user_id, category_id, valor, descricao, transaction_date, tipo)
VALUES (
    (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
    (SELECT id FROM TB_CATEGORIES WHERE nome = 'Saúde'
        AND user_id = (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com')),
    87.50, 'Farmácia',
    TO_DATE('2026-05-18', 'YYYY-MM-DD'), 'EXPENSE'
);

INSERT INTO TB_TRANSACTIONS (user_id, category_id, valor, descricao, transaction_date, tipo)
VALUES (
    (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
    (SELECT id FROM TB_CATEGORIES WHERE nome = 'Lazer'
        AND user_id = (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com')),
    59.90, 'Streaming (Netflix + Spotify)',
    TO_DATE('2026-05-12', 'YYYY-MM-DD'), 'EXPENSE'
);

INSERT INTO TB_TRANSACTIONS (user_id, category_id, valor, descricao, transaction_date, tipo)
VALUES (
    (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com'),
    (SELECT id FROM TB_CATEGORIES WHERE nome = 'Alimentação'
        AND user_id = (SELECT id FROM TB_USERS WHERE email = 'diego@pragfy.com')),
    145.00, 'Jantar aniversário',
    TO_DATE('2026-05-19', 'YYYY-MM-DD'), 'EXPENSE'
);

-- ── Resumo esperado no dashboard ──────────────────────────────
-- Receitas:  R$  8.700,00
-- Despesas:  R$  3.122,40
-- Saldo:     R$  5.577,60
