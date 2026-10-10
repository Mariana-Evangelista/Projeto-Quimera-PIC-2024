# Quimera Backend

> REST + real-time API for an active-learning platform in Animal Physiology classes: PIN-based participation with no student accounts, server-side grading, and live analytics over WebSockets.

[![CI](https://github.com/Mariana-Evangelista/Projeto-Quimera-PIC-2024/actions/workflows/ci.yml/badge.svg)](https://github.com/Mariana-Evangelista/Projeto-Quimera-PIC-2024/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/tests-54%20passing-4CAF50)

**Live:** [Frontend](https://quimera.mevangelista.com) · [API docs (Postman)](https://documenter.getpostman.com/view/34198309/2sBYAysUSD) · [Frontend repository](https://github.com/Mariana-Evangelista/Projeto-Quimera-PIC-Frontend)

Built for PIC 2024 at Centro Universitário Barão de Mauá, with the Veterinary Medicine program. This repository is my rework of the project: it adds the glycemic control experiment and a new stack and UI.

## What it does

A professor opens an experiment in class and shares a 6-character PIN. Students submit answers with no account and no student ID. The API grades each submission and pushes updated charts to the professor in real time.

Experiments: `body-water-loss`, `glycemic-control`.

## Highlights

- **Server-side grading.** The client sends only answers. Answer keys and weights live on the server, so scores can't be tampered with. Payloads are strictly validated: exact question count, no duplicate questions, bounded string length.
- **Layered PIN validation.** Each submission is checked for PIN, experiment type, and state (`Não iniciado` → `Em Progresso` → `Finalizado`) before it's accepted. PINs have a unique index, and generation retries on duplicate-key errors (Mongo `11000`).
- **Rate limits keyed by domain identity, not just IP.** A whole classroom often shares one NAT address, so limits are keyed by PIN (submissions) and email (login), with IP as fallback. Public routes, login, signup, and submissions each have their own policy.
- **Scoped real-time layer.** Socket.IO uses one namespace per experiment type and one room per experiment. Joins re-validate the PIN and type, and a per-connection throttle caps join attempts.
- **Modular architecture with DI.** Business modules split into routes → controllers → services → repositories, wired with TSyringe so services depend on interfaces and can be tested in isolation.
- **Consistent error contract.** A typed `ServiceError` with stable error codes is translated by a single error-handling middleware.
- **Fail-fast configuration.** Env vars are validated at boot (e.g. `JWT_SECRET` ≥ 32 chars, valid `CORS_ORIGIN`), and the process refuses to start on bad config.
- **Graceful shutdown.** On `SIGTERM`/`SIGINT`, it closes Socket.IO, disconnects MongoDB, and force-exits after a 10 s timeout.

## Architecture

```
src/
├── modules/      # auth, teacher, experiment, *-response (routes/controllers/services/repositories/schemas)
├── middlewares/  # auth, rate limiters, error handler
├── sockets/      # namespaces, rooms, join throttle
├── database/  containers/  shared/
```

## Stack

| Area | Technologies |
| --- | --- |
| Runtime / language | Node.js 20, TypeScript |
| API | Express, Socket.IO |
| Data | MongoDB 7, Mongoose |
| Auth / security | JWT, bcryptjs, Helmet, CORS, express-rate-limit |
| DI | TSyringe |
| Tests | Vitest |
| Infra | Docker, Docker Compose, Caddy, AWS EC2 + Systems Manager |
| CI/CD | GitHub Actions, GHCR, AWS OIDC |

## API

| Group | Access | Purpose |
| --- | --- | --- |
| `/auth` | Teacher | Login, JWT issuance |
| `/teacher` | Public / authenticated | Registration and management |
| `/experiment` | Mixed | Experiment CRUD and PIN lookup |
| `/body-water-loss-response` | Mixed | Submissions and analytics |
| `/glycemic-control-response` | Mixed | Submissions and analytics |
| `/health` | Public | API and MongoDB status |

Socket.IO namespaces: `/experiments`, `/body-water-loss-chart`, `/glycemic-control-chart`.

## Security and privacy

- bcrypt password hashing; JWT verified with a pinned algorithm.
- Helmet, per-environment CORS, and tiered rate limiting.
- Score weights defined only on the server.
- Students use no account and no student ID, which minimizes personal data.
- Production: MongoDB on an internal-only network, API container running as non-root.

## Deployment

Every push to `main` runs tests and build, then:

1. builds a multi-stage Docker image and publishes it to GHCR;
2. authenticates to AWS via **OIDC** (no stored long-lived keys);
3. deploys to EC2 through **Systems Manager**;
4. gates the release on the container **healthcheck**; the pipeline fails if the API doesn't become healthy.

Production runs API, MongoDB, and Caddy (automatic HTTPS) with Docker Compose. A `mongodump` backup script keeps 14 days of archives.

## Testing

```bash
npm test        # Vitest: 54 tests, 5 files
npm run build
```

Covered: PIN validation, rate-limit keys and policies, join throttling, and env validation. CI runs tests and build on every PR.

## Run locally

Requires Node.js 20+ and Docker.

```bash
git clone https://github.com/Mariana-Evangelista/Projeto-Quimera-PIC-2024.git
cd Projeto-Quimera-PIC-2024
npm ci
cp .env.example .env     # PORT, MONGO_URL, JWT_SECRET (≥32 chars), CORS_ORIGIN
docker compose up -d mongodb
npm run dev              # http://localhost:8000
```

## Author

**Mariana Evangelista** · [GitHub](https://github.com/Mariana-Evangelista)
