# PragFY — Gerenciador Financeiro e Planner de Investimentos

Aplicação web para controle de gastos, gerenciamento de transações e definição de perfil de investidor.

---

## Tecnologias utilizadas

| Camada    | Tecnologia                              |
|-----------|-----------------------------------------|
| Backend   | Java 17 + Spring Boot 3.3 + Spring Data JPA |
| Banco     | Oracle Database (instância FIAP)        |
| Frontend  | React 18 (CDN) + Bootstrap 5 + HTML/CSS/JS |

---

## Entidades do sistema

O projeto implementa **4 entidades** mapeadas no banco Oracle:

| Entidade              | Tabela                 | Descrição                                   |
|-----------------------|------------------------|---------------------------------------------|
| `UsuarioEntity`       | `TB_USUARIOS`          | Cadastro e autenticação de usuários         |
| `CategoriaEntity`     | `TB_CATEGORIAS`        | Categorias de receita e despesa por usuário |
| `TransacaoEntity`     | `TB_TRANSACOES`        | Lançamentos financeiros (entradas/saídas)   |
| `PerfilInvestidorEntity` | `TB_PERFIS_INVESTIDOR` | Perfil de risco calculado por questionário |

---

## Pré-requisitos

- Java 17 ou superior
- Acesso à instância Oracle da FIAP (credenciais fornecidas pelo curso)
- Navegador moderno (Chrome, Edge, Firefox)

---

## 1. Configuração do Backend

### 1.1 Configurar o banco de dados

Abra o arquivo:

```
backend/src/main/resources/application.properties
```

Preencha os dados da instância Oracle da FIAP:

```properties
spring.datasource.url=jdbc:oracle:thin:@<HOST>:<PORTA>:<SID>
spring.datasource.username=<SEU_USUARIO>
spring.datasource.password=<SUA_SENHA>
```

> O schema (tabelas) e os dados iniciais são criados automaticamente ao iniciar o backend via os scripts `sql/ddl.sql` e `sql/seed.sql`.

### 1.2 Executar o Backend

Na pasta `backend/`, execute:

**Com Maven Wrapper (sem precisar instalar o Maven):**

```bash
# Linux / macOS
./mvnw spring-boot:run

# Windows (PowerShell ou CMD)
.\mvnw.cmd spring-boot:run
```

**Com Maven instalado:**

```bash
mvn spring-boot:run
```

O servidor inicia na porta **8080**: `http://localhost:8080`

---

## 2. Execução do Frontend

O frontend é uma SPA em React (via CDN) — não requer Node.js nem npm.

### Opção A — VS Code Live Server (recomendado)

1. Instale a extensão **Live Server** no VS Code
2. Clique com o botão direito em `frontend/index.html`
3. Selecione **"Open with Live Server"**
4. O navegador abrirá em `http://127.0.0.1:5500/frontend/index.html`

### Opção B — Python (servidor local)

```bash
# Na raiz do projeto
python -m http.server 5500
```

Acesse: `http://localhost:5500/frontend/index.html`

### Opção C — Abrir diretamente no navegador

Basta abrir o arquivo `frontend/index.html` diretamente no navegador.

---

## 3. Dados de autenticação do usuário de teste

| Campo  | Valor              |
|--------|--------------------|
| E-mail | `diego@pragfy.com` |
| Senha  | `123456`           |

> Este usuário é criado automaticamente pelo script `seed.sql` ao iniciar o backend.
> Ele já vem com categorias e transações de exemplo para o mês de maio/2026.

---

## 4. Endpoints da API

### Usuários — `/api/auth`

| Método | Rota             | Descrição           |
|--------|------------------|---------------------|
| POST   | `/register`      | Cadastrar usuário   |
| POST   | `/login`         | Autenticar usuário  |
| GET    | `/users/{id}`    | Buscar usuário      |
| PUT    | `/users/{id}`    | Atualizar usuário   |
| DELETE | `/users/{id}`    | Remover usuário     |

### Categorias — `/api/categories`

| Método | Rota       | Descrição                         |
|--------|------------|-----------------------------------|
| GET    | `/`        | Listar categorias (`?idUsuario=`) |
| POST   | `/`        | Criar categoria                   |
| PUT    | `/{id}`    | Atualizar categoria               |
| DELETE | `/{id}`    | Remover categoria                 |

### Transações — `/api/transactions`

| Método | Rota         | Descrição                                      |
|--------|--------------|------------------------------------------------|
| GET    | `/`          | Listar por usuário/mês/ano                     |
| GET    | `/summary`   | Resumo mensal (receitas, despesas, saldo)      |
| POST   | `/`          | Criar transação                                |
| PUT    | `/{id}`      | Atualizar transação                            |
| DELETE | `/{id}`      | Remover transação                              |

### Perfil do Investidor — `/api/profile`

| Método | Rota            | Descrição              |
|--------|-----------------|------------------------|
| GET    | `/`             | Buscar perfil          |
| POST   | `/`             | Criar perfil           |
| PUT    | `/{idUsuario}`  | Atualizar perfil       |
| DELETE | `/{idUsuario}`  | Remover perfil         |

---

## 5. Estrutura do projeto

```
PragFY/
├── backend/                          # Spring Boot REST API
│   ├── src/main/java/com/pragfy/
│   │   ├── Categoria/               # CRUD de categorias
│   │   ├── Transacao/               # CRUD de transações
│   │   ├── Usuario/                 # Autenticação e usuários
│   │   ├── PerfilInvestidor/        # Questionário e perfil de risco
│   │   └── Compartilhado/           # CORS, inicialização do BD, exceções
│   └── src/main/resources/
│       ├── application.properties   # Configuração do banco
│       └── sql/
│           ├── ddl.sql              # Criação das tabelas
│           ├── seed.sql             # Dados iniciais
│           └── dispose.sql          # Remoção das tabelas
│
└── frontend/                        # SPA React (sem Node.js)
    ├── index.html                   # Tela de login
    ├── register.html                # Tela de cadastro
    ├── app.html                     # Aplicação principal (SPA)
    ├── styles.css                   # Estilos globais
    ├── components/                  # Componentes React
    └── services/                    # Serviços (API, storage, utils)
```
