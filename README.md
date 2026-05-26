# PragFY

PragFY é uma aplicação web de gestão financeira pessoal. Com ela é possível registrar receitas e despesas, organizar tudo por categorias e descobrir seu perfil de investidor através de um questionário.

---

## Tecnologias utilizadas

**Backend**
- Java 17
- Spring Boot
- Spring Data JPA
- Oracle Database (instância FIAP)

**Frontend**
- React (carregado via CDN)
- Bootstrap 5
- HTML, CSS e JavaScript

---

## Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado na sua máquina:

- **Java 17** — para executar o backend
- Um navegador moderno como Chrome, Edge ou Firefox — para abrir o frontend

---

## Passo a passo para testar

### 1. Configure o banco de dados

O arquivo `backend/src/main/resources/application.properties` contem os dados da instância Oracle da FIAP

Ocorreu de durante os testes eu bloquear o usuario oracle, foi pedido o desbloqueio pelo email.

Caso o arquvivo se perca ou fique com os placeholders devido ao git ignore esses são os dados:
```
spring.datasource.url=ORACLE.FIAP.COM.BR
spring.datasource.username=RM568386
spring.datasource.password=121101
```

### Na pasta root do projeto há um Iniciar.bat que executa os passos 2 e 3 em sequencia pra iniciar o back e depois o front.

### 2. Suba o backend

Abra um terminal na pasta `backend` e execute:

```
.\mvnw.cmd spring-boot:run
```

Aguarde até aparecer a mensagem `Started PragfyApplication` no terminal. Isso indica que o servidor está rodando na porta 8080.

> Quando o backend inicia, ele cria as tabelas no banco e já popula com dados de exemplo automaticamente.
> Ainda há um bug que estou resolvendo pra ele fazer o dispose ao final da execução, isso no intuito de deixar o banco livre pra futuros projetos que possamos vir a ter que desenvolver. 

### 3. Abra o frontend

Com o backend rodando, abra o arquivo `frontend/index.html` diretamente no navegador.


### 4. O Projeto iniciara Logado no usuario de teste:

Credenciais do usuário de teste:

- **E-mail:** diego@pragfy.com
- **Senha:** 123456

Pode ser realizado logout e login como quiser
---

## O que você pode testar

Após fazer login, você terá acesso a quatro áreas da aplicação:

- **Dashboard** — visão geral do mês com resumo de receitas, despesas e saldo
- **Transações** — cadastro, edição e exclusão de lançamentos financeiros
- **Categorias** — criação e gerenciamento de categorias personalizadas
- **Perfil de Investidor** — questionário que identifica seu perfil de risco e sugere investimentos
