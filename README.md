# ShopSmart — AI-Powered Full-Stack E-Commerce Platform

> Microservices-driven, real-time commerce with advanced AI integration.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, CSS Modules |
| Backend | Node.js, Express, Apollo GraphQL |
| Database | PostgreSQL via Prisma ORM |
| Cache | Redis |
| Auth | NextAuth.js (GitHub OAuth + Credentials) |
| CI/CD | GitHub Actions |
| Deploy | Docker + AWS EC2 |

## Project Structure

```
shopsmart/
├── frontend/          # Next.js 14 app
│   └── src/app/
│       ├── page.tsx           # Landing page
│       ├── auth/signin/       # Sign-in (OAuth + credentials)
│       ├── auth/signup/       # Registration
│       └── dashboard/         # Protected dashboard
│           ├── page.tsx       # Overview + stats
│           ├── products/      # Product catalog
│           ├── orders/        # Order history
│           └── cart/          # Cart + checkout
├── backend/           # Express + Apollo GraphQL API
│   ├── src/graphql/   # Schema + resolvers
│   ├── src/services/  # Auth service
│   └── prisma/        # DB schema
├── e2e/               # Playwright E2E tests
├── scripts/           # Idempotent deploy script
└── .github/workflows/ # CI, PR lint, deploy, E2E
```

## Getting Started

```bash
# Start infrastructure
docker-compose up -d

# Backend
cd backend && npm install && npm run db:migrate && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## CI/CD Pipelines

| Workflow | Trigger | Steps |
|---|---|---|
| `ci.yml` | push / PR | install → lint → test |
| `pr-lint.yml` | PR | ESLint check |
| `deploy.yml` | push to main | SSH → EC2 → deploy script |
| `e2e.yml` | push / PR | Playwright browser tests |

## Testing

```bash
# Backend unit + integration tests
cd backend && npm test

# Frontend unit tests
cd frontend && npm test

# E2E tests (requires running app)
npx playwright test
```

## Architecture

```
Next.js → NextAuth → GraphQL Gateway → Resolvers → Prisma → PostgreSQL
                                                  → Redis (cache/sessions)
```

---

Built with ♥ by Ishita Singh
