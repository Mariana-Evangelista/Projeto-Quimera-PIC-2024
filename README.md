# Quimera Backend

> Backend de uma plataforma de aprendizagem ativa para aulas de Fisiologia Animal, com participação anônima por PIN, correção server-side e indicadores atualizados em tempo real.

[![CI](https://github.com/Mariana-Evangelista/Projeto-Quimera-PIC-2024/actions/workflows/ci.yml/badge.svg)](https://github.com/Mariana-Evangelista/Projeto-Quimera-PIC-2024/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/tests-54%20passing-4CAF50)

> **Projeto desenvolvido para o PIC 2024 do Centro Universitário Barão de Mauá, em parceria com o curso de Medicina Veterinária.**

## Conteúdo

- [Visão geral](#vis%C3%A3o-geral)

- [Demonstração](#demonstra%C3%A7%C3%A3o)

- [Fluxo do produto](#fluxo-do-produto)

- [Principais decisões técnicas](#principais-decis%C3%B5es-t%C3%A9cnicas)

- [Arquitetura](#arquitetura)

- [Stack](#stack)

- [API e tempo real](#api-e-tempo-real)

- [Segurança e privacidade](#seguran%C3%A7a-e-privacidade)

- [Execução local](#execu%C3%A7%C3%A3o-local)

- [Testes e qualidade](#testes-e-qualidade)

- [Deploy e operação](#deploy-e-opera%C3%A7%C3%A3o)

- [Roadmap](#roadmap)

- [Licença](#licen%C3%A7a)

## Visão geral

O Quimera foi criado para tornar o aprendizado de **Fisiologia Animal** mais dinâmico e participativo. O professor conduz um experimento em sala, enquanto os alunos respondem anonimamente usando um PIN público, sem criação de conta ou exposição de RA.

O backend é responsável por:

- autenticar professores;

- criar e controlar experimentos;

- validar o estado do experimento;

- receber e corrigir respostas no servidor;

- calcular pontuações, médias e distribuições;

- atualizar clientes conectados via Socket.IO;

- proteger endpoints públicos e operações administrativas.

### Experimentos disponíveis

- **Perda de água corporal** — `body-water-loss`

- **Controle glicêmico** — `glycemic-control`

## Demonstração

- **Documentação Postman:** [acessar documentação](https://documenter.getpostman.com/view/34198309/2sBYAysUSD)

- **Frontend:** [acessar frontend](https://quimera.mevangelista.com)

## Fluxo do produto

```mermaid
sequenceDiagram
    actor Professor
    actor Aluno
    participant API as API Quimera
    participant DB as MongoDB
    participant RT as Socket.IO

    Professor->>API: Login
    API-->>Professor: JWT
    Professor->>API: Cria experimento
    API->>DB: Persiste experimento e PIN
    API-->>Professor: PIN público
    Aluno->>API: Consulta experimento usando PIN
    Aluno->>API: Envia resposta anônima
    API->>DB: Valida, corrige e persiste resposta
    API->>RT: Publica atualização de analytics
    RT-->>Professor: Atualiza gráfico em tempo real
```

### Estados do experimento

| Estado | Comportamento |
| --- | --- |
| `Não iniciado` | Respostas ainda não são aceitas |
| `Em Progresso` | Alunos podem enviar respostas |
| `Finalizado` | Novas respostas são bloqueadas e os resultados podem ser apresentados |

## Principais decisões técnicas

### Correção no backend

O cliente envia apenas as respostas. O servidor aplica o gabarito e calcula os pesos, evitando confiar em pontuação enviada pelo navegador.

### Participação anônima por PIN

Os alunos não precisam criar conta. O professor continua protegido por JWT, enquanto a API valida PIN, tipo de experimento e estado antes de aceitar uma resposta.

### Atualização em tempo real

O Socket.IO organiza os clientes em salas por experimento. Uma nova resposta ou alteração de estado pode atualizar os dados exibidos sem recarregar a página.

### Separação por domínio

Controllers, services, repositories, schemas e tipos ficam organizados por módulo de negócio. O TSyringe fornece injeção de dependências e reduz o acoplamento entre as camadas.

## Arquitetura

```
src/
├── modules/
│   ├── auth/
│   ├── teacher/
│   ├── experiment/
│   ├── body-water-loss-response/
│   └── glycemic-control-response/
├── middlewares/
├── database/
├── sockets/
├── containers/
└── shared/
```

### Responsabilidades

| Camada | Responsabilidade |
| --- | --- |
| Routes | Define endpoints e middlewares |
| Controllers | Traduz HTTP para chamadas de aplicação |
| Services | Implementa regras de negócio |
| Repositories | Encapsula persistência no MongoDB |
| Schemas | Define modelos e validações do Mongoose |
| Sockets | Gerencia namespaces, salas e eventos em tempo real |
| Middlewares | Autenticação, segurança, rate limiting e erros |

## Stack

| Categoria | Tecnologias |
| --- | --- |
| Linguagem | TypeScript |
| Runtime | Node.js 20 |
| API | Express |
| Banco | MongoDB 7 + Mongoose |
| Tempo real | Socket.IO |
| Autenticação | JWT + bcryptjs |
| Segurança | Helmet, CORS e express-rate-limit |
| DI | TSyringe |
| Testes | Vitest |
| Infraestrutura | Docker + Docker Compose |
| CI/CD | GitHub Actions + GitHub Container Registry |
| Deploy | AWS EC2 + AWS Systems Manager + Caddy |

## API e tempo real

### Principais grupos de endpoints

| Grupo | Acesso | Responsabilidade |
| --- | --- | --- |
| `/auth` | Professor | Login e emissão de JWT |
| `/teacher` | Público/autenticado | Cadastro e gerenciamento do professor |
| `/experiment` | Misto | Criação, consulta, atualização e remoção de experimentos |
| `/body-water-loss-response` | Misto | Respostas e analytics de perda de água corporal |
| `/glycemic-control-response` | Misto | Respostas e analytics de controle glicêmico |
| `/health` | Público | Saúde da API e conexão com MongoDB |


### Namespaces Socket.IO

- `/experiments`

- `/body-water-loss-chart`

- `/glycemic-control-chart`

O cliente entra em uma sala a partir do PIN. O servidor valida o PIN e o tipo do experimento, limita tentativas consecutivas e emite atualizações para os participantes da sala.

## Segurança e privacidade

- Senhas armazenadas com hash bcrypt.

- JWT verificado com algoritmo configurado.

- Helmet para headers de segurança.

- CORS configurável por ambiente.

- Rate limiting para login, cadastro, consultas públicas, envio de respostas e entrada em salas.

- Validação de tipos, tamanhos, duplicidades e campos permitidos.

- Peso da pontuação definido exclusivamente no servidor.

- MongoDB isolado em rede interna no Compose de produção.

- Container da API executado com usuário não-root.

- Alunos participam sem conta, reduzindo coleta de dados pessoais.



## Execução local

### Pré-requisitos

- Node.js 20+

- npm

- Docker e Docker Compose

### Instalação

```bash
git clone https://github.com/Mariana-Evangelista/Projeto-Quimera-PIC-2024.git
cd Projeto-Quimera-PIC-2024
npm ci
cp .env.example .env
```

Configure o `.env`:

```
PORT=8000
MONGO_URL=mongodb://user:pass@host:27017/db?authSource=admin
JWT_SECRET=gere_uma_chave_com_no_minimo_32_caracteres
CORS_ORIGIN=http://localhost:3000
```

Suba o MongoDB:

```bash
docker compose up -d mongodb
```

Inicie a API em desenvolvimento:

```bash
npm run dev
```

A API ficará disponível em `http://localhost:8000`.

### Build de produção local

```bash
npm run build
npm start
```

## Testes e qualidade

```bash
npm test
npm run build
```

Estado atual validado localmente:

- **54 testes aprovados**;

- **5 arquivos de teste**;

- **build TypeScript concluído**;

- pipeline executa testes e build em pull requests e pushes para `main`.


## Deploy e operação

O pipeline de produção:

1. executa testes e build;

1. constrói imagem Docker multi-stage;

1. publica a imagem no GHCR;

1. autentica na AWS via OIDC;

1. executa o deploy na EC2 via Systems Manager;

1. aguarda o healthcheck da API;

1. considera o deploy concluído somente após a aplicação ficar saudável.

Em produção, os serviços são separados em API, MongoDB e Caddy. O Caddy fornece HTTPS e o MongoDB não fica exposto diretamente à rede pública.

Também existe um script de backup do MongoDB com retenção de arquivos antigos.



## Autora

**Mariana Evangelista**
[GitHub](https://github.com/Mariana-Evangelista)
