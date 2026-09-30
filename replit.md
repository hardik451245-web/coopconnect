# CoopConnect (Sahakaar-Seva-Hub)

Cooperative Gig Services Platform connecting households and communities with skilled, verified cooperative workers under transparent pricing, social security, and collective ownership.

## Run & Operate

- `corepack.cmd pnpm --filter @workspace/coopconnect run dev` — run the CoopConnect web application (default port: 5173)
- `corepack.cmd pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `corepack.cmd pnpm --filter @workspace/coopconnect run build` — bundle the frontend for production
- `corepack.cmd pnpm --filter @workspace/coopconnect run typecheck` — verify TypeScript types

## Technology Stack

- **Frontend**: React 19, Vite 7, TypeScript 5.9, Tailwind CSS v4, Radix UI, Lucide Icons, Wouter router
- **Backend**: Express 5, Node.js 24, Pino
- **Package Manager**: pnpm workspaces (v9.15.9)
- **Database Architecture**: PostgreSQL + Drizzle ORM
