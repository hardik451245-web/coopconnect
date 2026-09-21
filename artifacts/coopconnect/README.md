# CoopConnect

**Cooperative Gig Services Platform**  
**SIH 2026 · Problem Statement 26089**

CoopConnect is a responsive prototype for a cooperative-owned household and community services marketplace. It connects customers with verified cooperative workers while making fair pricing, worker welfare, safety support, and cooperative ownership visible.

## Problem

Skilled workers in Labour Cooperative Federations and Labour Cooperative Societies often have local capability but no structured digital channel to reach households, communities, and institutions. Existing private marketplaces can hide pricing and reduce worker earnings.

## Solution

CoopConnect provides:

- Customer service discovery and AI-assisted local matching
- Verified worker profiles and a portable Cooperative Worker Digital Passport
- Transparent booking and demo payment flows
- Community group booking and pooled job routes
- Women-safe service assignment preference
- AI Coordinated Multi-Service Project Booking
- Welfare and contribution transparency
- Worker earnings, availability, safety, and SOS surfaces
- Cooperative admin monitoring and worker verification
- English, Hindi, and Marathi navigation labels
- Offline-friendly local demo persistence

## Key Features

### Cooperative Worker Digital Passport

Each worker has a portable professional record with verified skills, certifications, cooperative membership, work history, ratings, safety training, and welfare status.

### Community Group Booking & Job Pooling

Nearby compatible requests can be grouped into a service batch to reduce travel and improve worker utilisation.

### Transparent Cooperative Contribution

The prototype shows a 20% cooperative contribution separately from worker earnings:

| Allocation | Percentage | Purpose |
| --- | ---: | --- |
| App & Technology Running Cost | 5% | Hosting, maintenance, security, notifications, and support |
| Worker Insurance & Social Security | 6% | Insurance support and long-term welfare benefits |
| Emergency Assistance Fund | 4% | Emergency financial and accident assistance |
| Year-End Cooperative Surplus | 5% | Retained or distributed according to cooperative rules |

### Women-Safe Service Assignment

Customers can prefer a verified female service professional. The prototype prioritises eligible workers while keeping the wider network available. Safety-support features are designed to improve transparency and emergency response; they do not guarantee safety.

### AI Coordinated Multi-Service Project Booking

Customers can create one renovation project. Deterministic prototype logic decomposes it into trades, assigns approximate sequence and time slots, and presents one project timeline.

## Technology Stack

- React + Vite + TypeScript
- Tailwind CSS
- Wouter routing
- Lucide React icons
- Browser localStorage for demo persistence
- Browser Speech Recognition when available
- CSS and lightweight inline visualisations

## Architecture

This prototype intentionally runs as one lightweight frontend application:

```text
Customer / Worker / Cooperative Admin
                ↓
         CoopConnect UI
                ↓
     Local prototype logic
                ↓
      localStorage demo state
```

The in-app Architecture page explains how the prototype can evolve into worker management, booking, matching, pricing, welfare, notifications, safety, and cooperative dashboard services.

## AI Prototype Logic

No external AI APIs are used. The app demonstrates the intended product behaviour with deterministic local logic:

- Worker matching considers service skill, availability, distance, rating, and verification.
- Group booking shows compatible nearby requests and a simulated route.
- Fair pricing applies service estimates and the transparent contribution model.
- Project coordination maps a renovation request to predefined trade tasks.
- Welfare explanations calculate the exact 5% / 6% / 4% / 5% allocation.

All AI and analytics values are labelled as prototype or demo data.

## Run Locally

From the workspace root:

```bash
pnpm --filter @workspace/coopconnect run dev
```

The app is designed to start with the existing Replit workflow and does not require a database, API key, paid service, or third-party account.

## Demo Instructions

1. Open the home page and choose **Start SIH Demo**.
2. Follow the Home Renovation flow through service decomposition, worker recommendations, scheduling, price review, contribution allocation, confirmation, and the project timeline.
3. Switch roles from the top-right selector:
   - **Customer** — discovery, booking, payments, projects, and SOS
   - **Worker** — jobs, earnings, welfare, passport, availability, and safety
   - **Cooperative Admin** — worker verification, bookings, welfare, emergencies, and analytics
4. Explore **Why CoopConnect**, **Architecture**, **Projects**, and **About the cooperative** from the left navigation.
5. Use the language selector to preview English, Hindi, and Marathi navigation labels.

## Limitations

This is a judge-facing prototype, not a production marketplace:

- Demo data is fictional and stored locally in the browser.
- Authentication, payments, SMS, voice notifications, maps, identity checks, and emergency dispatch are simulated.
- The QR-style passport visual is a prototype verification placeholder.
- Speech recognition depends on browser support.
- No claim of government verification or guaranteed safety is made.

## Future Scope

- Cooperative-managed backend and role-based authentication
- Real worker onboarding, KYC, skill verification, and certification integrations
- Production payment settlement and cooperative accounting
- Regional language voice workflows
- Geo-aware routing and offline sync
- Insurance, grievance, and emergency response integrations
- Federation-level reporting and NCCT training programme connectivity