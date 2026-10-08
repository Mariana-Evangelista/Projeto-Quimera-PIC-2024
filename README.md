# Quimera Backend

> Backend for an active learning platform for Animal Physiology classes, featuring anonymous PIN-based participation, server-side grading, and real-time updated indicators.

[![CI](https://github.com/Mariana-Evangelista/Projeto-Quimera-PIC-2024/actions/workflows/ci.yml/badge.svg)](https://github.com/Mariana-Evangelista/Projeto-Quimera-PIC-2024/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/tests-54%20passing-4CAF50)

> **Project developed for PIC 2024 at Centro Universitário Barão de Mauá, in partnership with the Veterinary Medicine program.**

## Contents

- [Overview](#overview)

- [Demo](#demo)

- [Product flow](#product-flow)

- [Key technical decisions](#key-technical-decisions)

- [Architecture](#architecture)

- [Stack](#stack)

- [API and real time](#api-and-real-time)

- [Security and privacy](#security-and-privacy)

- [Local setup](#local-setup)

- [Testing and quality](#testing-and-quality)

- [Deployment and operations](#deployment-and-operations)

## Overview

Quimera was created to make learning **Animal Physiology** more dynamic and participatory. The professor runs an experiment in the classroom while students answer anonymously using a public PIN, with no account creation and no exposure of their student ID (RA).

The backend is responsible for:

- authenticating professors;

- creating and managing experiments;

- validating experiment state;

- receiving and grading answers on the server;

- calculating scores, averages, and distributions;

- updating connected clients via Socket.IO;

- protecting public endpoints and administrative operations.

### Available experiments

- **Body water loss** — `body-water-loss`

- **Glycemic control** — `glycemic-control`

## Demo

- **Postman documentation:** [view documentation](https://documenter.getpostman.com/view/34198309/2sBYAysUSD)

- **Frontend:** [open frontend](https://quimera.mevangelista.com)

## Product flow

```mermaid
sequenceDiagram
    actor Professor
    actor Student
    participant API as Quimera API
    participant DB as MongoDB
    participant RT as Socket.IO

    Professor->>API: Login
    API-->>Professor: JWT
    Professor->>API: Creates experiment
    API->>DB: Persists experiment and PIN
    API-->>Professor: Public PIN
    Student->>API: Looks up experiment using PIN
    Student->>API: Submits anonymous answer
    API->>DB: Validates, grades, and persists answer
    API->>RT: Publishes analytics update
    RT-->>Professor: Updates chart in real time
```

### Experiment states

| State | Behavior |
| --- | --- |
| `Não iniciado` (Not started) | Answers are not yet accepted |
| `Em Progresso` (In progress) | Students can submit answers |
| `Finalizado` (Finished) | New answers are blocked and results can be presented |

## Key technical decisions

### Server-side grading

The client sends only the answers. The server applies the answer key and calculates the weights, avoiding any reliance on a score sent by the browser.

### Anonymous participation via PIN

Students don't need to create an account. The professor remains protected by JWT, while the API validates the PIN, experiment type, and state before accepting an answer.

### Real-time updates

Socket.IO organizes clients into per-experiment rooms. A new answer or a state change can update the displayed data without reloading the page.

### Domain separation

Controllers, services, repositories, schemas, and types are organized by business module. TSyringe provides dependency injection and reduces coupling between layers.

## Architecture

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

### Responsibilities

| Layer | Responsibility |
| --- | --- |
| Routes | Defines endpoints and middlewares |
| Controllers | Translates HTTP into application calls |
| Services | Implements business rules |
| Repositories | Encapsulates MongoDB persistence |
| Schemas | Defines Mongoose models and validations |
| Sockets | Manages namespaces, rooms, and real-time events |
| Middlewares | Authentication, security, rate limiting, and error handling |

## Stack

| Category | Technologies |
| --- | --- |
| Language | TypeScript |
| Runtime | Node.js 20 |
| API | Express |
| Database | MongoDB 7 + Mongoose |
| Real time | Socket.IO |
| Authentication | JWT + bcryptjs |
| Security | Helmet, CORS, and express-rate-limit |
| DI | TSyringe |
| Testing | Vitest |
| Infrastructure | Docker + Docker Compose |
| CI/CD | GitHub Actions + GitHub Container Registry |
| Deployment | AWS EC2 + AWS Systems Manager + Caddy |

## API and real time

### Main endpoint groups

| Group | Access | Responsibility |
| --- | --- | --- |
| `/auth` | Professor | Login and JWT issuance |
| `/teacher` | Public/authenticated | Professor registration and management |
| `/experiment` | Mixed | Creating, querying, updating, and deleting experiments |
| `/body-water-loss-response` | Mixed | Answers and analytics for body water loss |
| `/glycemic-control-response` | Mixed | Answers and analytics for glycemic control |
| `/health` | Public | API health and MongoDB connection status |


### Socket.IO namespaces

- `/experiments`

- `/body-water-loss-chart`

- `/glycemic-control-chart`

The client joins a room based on the PIN. The server validates the PIN and experiment type, limits consecutive attempts, and emits updates to the room's participants.

## Security and privacy

- Passwords stored with bcrypt hashing.

- JWT verified with a configured algorithm.

- Helmet for security headers.

- CORS configurable per environment.

- Rate limiting for login, registration, public queries, answer submission, and room joining.

- Validation of types, sizes, duplicates, and allowed fields.

- Score weights defined exclusively on the server.

- MongoDB isolated on an internal network in the production Compose setup.

- API container runs as a non-root user.

- Students participate without an account, reducing personal data collection.



## Local setup

### Prerequisites

- Node.js 20+

- npm

- Docker and Docker Compose

### Installation

```bash
git clone https://github.com/Mariana-Evangelista/Projeto-Quimera-PIC-2024.git
cd Projeto-Quimera-PIC-2024
npm ci
cp .env.example .env
```

Configure the `.env` file:

```
PORT=8000
MONGO_URL=mongodb://user:pass@host:27017/db?authSource=admin
JWT_SECRET=generate_a_key_with_at_least_32_characters
CORS_ORIGIN=http://localhost:3000
```

Start MongoDB:

```bash
docker compose up -d mongodb
```

Start the API in development mode:

```bash
npm run dev
```

The API will be available at `http://localhost:8000`.

### Local production build

```bash
npm run build
npm start
```

## Testing and quality

```bash
npm test
npm run build
```

Current state, validated locally:

- **54 tests passing**;

- **5 test files**;

- **TypeScript build completed**;

- the pipeline runs tests and build on pull requests and pushes to `main`.


## Deployment and operations

The production pipeline:

1. runs tests and build;

1. builds a multi-stage Docker image;

1. publishes the image to GHCR;

1. authenticates with AWS via OIDC;

1. deploys to EC2 via Systems Manager;

1. waits for the API healthcheck;

1. considers the deployment complete only after the application is healthy.

In production, services are split into API, MongoDB, and Caddy. Caddy provides HTTPS, and MongoDB is not directly exposed to the public network.

There is also a MongoDB backup script that retains older backup files.



## Author

**Mariana Evangelista**
[GitHub](https://github.com/Mariana-Evangelista)
