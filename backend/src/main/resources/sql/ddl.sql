-- ============================================================
-- DDL - PragFY
-- Oracle 19c — padrão de nomenclatura:
--   TB_   tabelas
--   ID_   PKs e FKs
--   CD_   códigos / enums
--   VL_   valores monetários
--   NR_   valores numéricos não-monetários
--   DT_   datas e timestamps
--   DS_   demais varchar / texto / clob
--   FL_   booleanos
-- ============================================================


-- ── Usuários ──────────────────────────────────────────────────
CREATE TABLE TB_USUARIOS (
    ID_USUARIO    NUMBER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    DS_NOME       VARCHAR2(100)  NOT NULL,
    DS_EMAIL      VARCHAR2(150)  NOT NULL,
    DS_SENHA      VARCHAR2(255)  NOT NULL,
    DT_CRIADO_EM  TIMESTAMP      NOT NULL
);

ALTER TABLE TB_USUARIOS
    ADD CONSTRAINT UQ_USUARIOS_EMAIL UNIQUE (DS_EMAIL);


-- ── Categorias ────────────────────────────────────────────────
CREATE TABLE TB_CATEGORIAS (
    ID_CATEGORIA  NUMBER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ID_USUARIO    NUMBER        NOT NULL,
    DS_NOME       VARCHAR2(80)  NOT NULL,
    CD_TIPO       VARCHAR2(10)  NOT NULL,   -- RECEITA | DESPESA
    DS_COR        VARCHAR2(7),
    DS_ICONE      VARCHAR2(50),
    CONSTRAINT FK_CAT_USUARIO FOREIGN KEY (ID_USUARIO)
        REFERENCES TB_USUARIOS (ID_USUARIO) ON DELETE CASCADE
);


-- ── Transações ────────────────────────────────────────────────
CREATE TABLE TB_TRANSACOES (
    ID_TRANSACAO  NUMBER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ID_USUARIO    NUMBER         NOT NULL,
    ID_CATEGORIA  NUMBER,
    VL_VALOR      NUMBER(15, 2)  NOT NULL,
    DS_DESCRICAO  VARCHAR2(255),
    DT_DATA       DATE           NOT NULL,
    CD_TIPO       VARCHAR2(10)   NOT NULL,  -- RECEITA | DESPESA
    CONSTRAINT FK_TX_USUARIO   FOREIGN KEY (ID_USUARIO)
        REFERENCES TB_USUARIOS   (ID_USUARIO)   ON DELETE CASCADE,
    CONSTRAINT FK_TX_CATEGORIA FOREIGN KEY (ID_CATEGORIA)
        REFERENCES TB_CATEGORIAS (ID_CATEGORIA) ON DELETE SET NULL
);


-- ── Perfis de Investidor ──────────────────────────────────────
CREATE TABLE TB_PERFIS_INVESTIDOR (
    ID_PERFIL         NUMBER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ID_USUARIO        NUMBER        NOT NULL,
    CD_PERFIL_RISCO   VARCHAR2(20),          -- CONSERVADOR | MODERADO | ARROJADO
    DS_RESPOSTAS      CLOB,
    DT_ATUALIZADO_EM  TIMESTAMP,
    CONSTRAINT FK_PERFIL_USUARIO FOREIGN KEY (ID_USUARIO)
        REFERENCES TB_USUARIOS (ID_USUARIO) ON DELETE CASCADE,
    CONSTRAINT UQ_PERFIL_USUARIO UNIQUE (ID_USUARIO)
);
