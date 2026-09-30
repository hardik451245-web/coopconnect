# CoopConnect (Sahakaar-Seva-Hub)

Cooperative Gig Services Platform connecting households and communities with skilled, verified cooperative workers under transparent pricing, social security, and collective ownership.

---

## Quick Start (How to Run)

### Prerequisites
- **Node.js**: v20 or v24 installed ([Download Node.js](https://nodejs.org/))

### 1. Enable Corepack & Install Dependencies
From the repository root folder, run:
```bash
corepack enable
corepack pnpm install
```
*(If you already have `pnpm` installed globally: simply run `pnpm install`)*

### 2. Start Development Server
```bash
npm run dev
```
*(Or: `corepack pnpm dev`)*

This starts both:
- **Frontend Web App** at: [http://localhost:5173/](http://localhost:5173/)
- **API Server** at: [http://localhost:5000/](http://localhost:5000/)

### Alternative Commands
- Run Frontend only: `npm run dev:frontend`
- Run Backend only: `npm run dev:backend`
- Production Build: `corepack pnpm run build`
- Typecheck: `corepack pnpm run typecheck`

---

## Project Structure

```
Sahakaar-Seva-Hub/
├── artifacts/
│   ├── coopconnect/        # React 19 + Vite 7 Frontend Web Application
│   ├── api-server/          # Express 5 + Node.js Backend API Server
│   └── mockup-sandbox/      # Interactive Component Sandbox
├── lib/
│   ├── api-client-react/    # Generated React Query API Client
│   ├── api-spec/            # OpenAPI Specification
│   ├── api-zod/             # Zod Validation Schemas
│   └── db/                  # PostgreSQL Schema & Drizzle ORM
├── screenshots/             # Application UI Screenshots & Demonstrations
├── attached_assets/         # Specification documents & requirements
├── package.json             # Root Workspace Configuration & Dev Scripts
└── pnpm-workspace.yaml      # Monorepo Workspace Settings
```

---

## Technology Stack

- **Frontend**: React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4, Radix UI Primitives, Lucide Icons, Wouter Router, TanStack Query
- **Backend**: Express 5, Node.js 24, Pino Logger
- **Database & Schemas**: PostgreSQL, Drizzle ORM, Zod
- **Package Manager**: pnpm workspaces (v9.15.9 via Corepack)
