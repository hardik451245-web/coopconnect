# CoopConnect (Sahakaar-Seva-Hub)

**Cooperative Gig Services Platform**

CoopConnect is a comprehensive platform for a cooperative-owned household and community services marketplace. It connects customers with verified, skilled cooperative workers while making fair pricing, worker welfare, safety support, and cooperative ownership visible and transparent.

## Overview

Skilled workers in Labour Cooperative Federations and Labour Cooperative Societies often have strong local capabilities but lack a structured digital channel to reach households, communities, and institutions. Existing private gig platforms often obscure pricing, extract high commissions, and minimize worker protections.

CoopConnect provides a sustainable, cooperative-owned alternative that treats gig workers as valued member-owners.

## Core Capabilities

- **Customer Service Discovery & AI-Assisted Matching**: Intelligent local matching based on trade skills, proximity, verified ratings, and availability.
- **Cooperative Worker Digital Passport**: Portable professional credential detailing verified certifications, trade skills, cooperative standing, safety training records, and ratings.
- **Transparent Cooperative Contribution Model**: Clear breakdown showing worker earnings (80%) and the 20% cooperative contribution fund allocation.
- **Community Group Booking & Job Pooling**: Coordinates nearby household requests into pooled service batches to minimize transit time and maximize worker income.
- **Women-Safe Service Assignment**: Allows customers to select verified female professionals with transparent verification and safety escalation pathways.
- **AI-Coordinated Multi-Service Projects**: Decomposes complex home improvements (e.g. renovations, pre-monsoon checks) into scheduled, sequential trade tasks.
- **Worker Welfare & Social Security Ledger**: Tracks contributions allocated to healthcare/insurance, emergency assistance, and annual cooperative surplus.
- **Worker Management Portal**: Real-time job requests, workflow status tracking (Accepted, En Route, In Progress, Completed), availability scheduling, and safety check-ins.
- **Cooperative Admin Console**: Comprehensive oversight of member verification, booking operations, safety desk escalations, and welfare fund distribution.
- **Multilingual Support**: Full navigation and interface labels in English, Hindi (हिंदी), and Marathi (मराठी).
- **Offline Resilience**: Local client caching ensures smooth performance and reliable record keeping even during intermittent connectivity.

## Transparent Contribution Model

CoopConnect makes the 20% cooperative contribution completely transparent on every booking:

| Allocation | Percentage | Purpose |
| :--- | :---: | :--- |
| **App & Technology Infrastructure** | 5% | Hosting, platform maintenance, dispatch automation, security, and member communications |
| **Worker Insurance & Social Security** | 6% | Comprehensive accidental cover, health insurance support, and long-term security funds |
| **Emergency Assistance Fund** | 4% | Immediate financial and medical assistance for on-job incidents and hardship relief |
| **Year-End Cooperative Surplus** | 5% | Retained earnings distributed to member workers or reinvested per cooperative bylaws |

*Worker earnings remain separate and fully protected at 80% of service value.*

## Technology Stack

- **Frontend**: React 19, TypeScript 5.9, Vite 7
- **Styling & UI**: Tailwind CSS v4, Radix UI Primitives, Lucide Icons, Framer Motion
- **Routing & State**: Wouter client routing, TanStack Query, resilient local persistence
- **Backend Infrastructure**: Express 5 API server, Pino logger, Drizzle ORM

## Running Locally

From the workspace root:

```bash
corepack.cmd pnpm --filter @workspace/coopconnect run dev
```

Then open your browser at: `http://localhost:5173/`

### Build for Production

```bash
corepack.cmd pnpm --filter @workspace/coopconnect run build
```

### Typecheck

```bash
corepack.cmd pnpm --filter @workspace/coopconnect run typecheck
```