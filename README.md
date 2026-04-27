# ShopSmart — AI-Powered Full-Stack E-Commerce Platform

> Microservices-driven, real-time commerce with advanced AI integration.

## 🚀 Live Deployment

| Service | URL |
|---|---|
| **Frontend** | http://34.229.147.34:3000 |
| **Backend GraphQL** | http://34.229.147.34:4000/graphql |
| **Health Check** | http://34.229.147.34:4000/health |

## 🐳 AWS Infrastructure

| Resource | Details |
|---|---|
| **ECR Registry** | `604662468900.dkr.ecr.us-east-1.amazonaws.com` |
| **ECR Repos** | `shopsmart-frontend`, `shopsmart-backend` |
| **ECS Cluster** | `shopsmart-cluster` |
| **ECS Services** | `shopsmart-frontend-service`, `shopsmart-backend-service` |
| **Task Definitions** | `shopsmart-frontend:1`, `shopsmart-backend:2` |
| **Region** | `us-east-1` |

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, CSS Modules |
| Backend | Node.js, Express, Apollo GraphQL |
| Database | MySQL via Prisma ORM |
| Auth | NextAuth.js (GitHub OAuth + Credentials) |
| Container Registry | Amazon ECR |
| Orchestration | Amazon ECS (Fargate) |
| CI/CD | GitHub Actions → ECR → ECS |
| Deploy | Docker + AWS EC2 + ECS |

## 📁 Project Structure

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
└── .github/workflows/ # CI, PR lint, deploy, E2E, ECR/ECS
```

## 🔧 Getting Started (Local)

```bash
# Start infrastructure
docker-compose up -d

# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo credentials:**
- Email: `demo@shopsmart.dev` | Password: `demo1234`

## ⚙️ CI/CD Pipelines

| Workflow | Trigger | Steps |
|---|---|---|
| `ci.yml` | push / PR | install → lint → test |
| `pr-lint.yml` | PR | ESLint check |
| `deploy.yml` | push to main | SSH → EC2 → deploy script |
| `e2e.yml` | push / PR | Playwright browser tests |
| `ecr-ecs-deploy.yml` | push to main | build → push ECR → deploy ECS |

## 🧪 Testing

```bash
# Backend unit + integration tests
cd backend && npm test

# Frontend unit tests
cd frontend && npm test

# E2E tests
npx playwright test
```

## 🏗 Architecture

```
Next.js → NextAuth → GraphQL Gateway → Resolvers → Prisma → MySQL
                                                  → Redis (cache/sessions)

GitHub Actions → Docker Build → Amazon ECR → Amazon ECS (Fargate)
```

## 📦 Deployment (ECR + ECS)

```bash
# Build and push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin 604662468900.dkr.ecr.us-east-1.amazonaws.com
docker build -t shopsmart-backend ./backend
docker tag shopsmart-backend:latest 604662468900.dkr.ecr.us-east-1.amazonaws.com/shopsmart-backend:latest
docker push 604662468900.dkr.ecr.us-east-1.amazonaws.com/shopsmart-backend:latest

# Deploy to ECS
aws ecs update-service --cluster shopsmart-cluster --service shopsmart-backend-service --force-new-deployment
```

---

Built with ♥ by Ishita Singh
# Deployed via GitHub Actions → ECR → ECS
