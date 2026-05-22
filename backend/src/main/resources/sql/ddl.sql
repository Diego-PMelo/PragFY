-- ============================================================
-- DDL - PragFY
-- Criação do schema completo para Oracle 19c
-- Ordem: tabelas pai antes de tabelas filhas (dependência de FK)
-- ============================================================


-- ── Usuários ──────────────────────────────────────────────────
CREATE TABLE TB_USERS (
    id         NUMBER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome       VARCHAR2(100)  NOT NULL,
    email      VARCHAR2(150)  NOT NULL,
    senha      VARCHAR2(255)  NOT NULL,
    created_at TIMESTAMP      NOT NULL
);

ALTER TABLE TB_USERS
    ADD CONSTRAINT uq_users_email UNIQUE (email);


-- ── Categorias ────────────────────────────────────────────────
CREATE TABLE TB_CATEGORIES (
    id      NUMBER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER        NOT NULL,
    nome    VARCHAR2(80)  NOT NULL,
    tipo    VARCHAR2(10)  NOT NULL,
    cor     VARCHAR2(7),
    icone   VARCHAR2(50),
    CONSTRAINT fk_cat_user FOREIGN KEY (user_id)
        REFERENCES TB_USERS (id) ON DELETE CASCADE
);


-- ── Transações ────────────────────────────────────────────────
CREATE TABLE TB_TRANSACTIONS (
    id               NUMBER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id          NUMBER         NOT NULL,
    category_id      NUMBER,
    valor            NUMBER(15, 2)  NOT NULL,
    descricao        VARCHAR2(255),
    transaction_date DATE           NOT NULL,
    tipo             VARCHAR2(10)   NOT NULL,
    CONSTRAINT fk_tx_user     FOREIGN KEY (user_id)
        REFERENCES TB_USERS      (id) ON DELETE CASCADE,
    CONSTRAINT fk_tx_category FOREIGN KEY (category_id)
        REFERENCES TB_CATEGORIES (id) ON DELETE SET NULL
);


-- ── Perfis de Investidor ──────────────────────────────────────
CREATE TABLE TB_INVESTOR_PROFILES (
    id           NUMBER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id      NUMBER        NOT NULL,
    risk_profile VARCHAR2(20),
    answers      CLOB,
    updated_at   TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id)
        REFERENCES TB_USERS (id) ON DELETE CASCADE,
    CONSTRAINT uq_profile_user UNIQUE (user_id)
);
