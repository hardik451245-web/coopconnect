---
name: Worker route precedence
description: Routing constraint for CoopConnect's worker experience.
---

Explicit worker routes such as `/worker/login`, `/worker/dashboard`, and `/worker/jobs` must appear before the legacy `/worker/:id` passport route in the Wouter switch.

**Why:** Wouter matches the first compatible route, so the dynamic passport route otherwise captures every one-segment worker route and renders the wrong page.

**How to apply:** Add new static worker routes before `/worker/:id`; keep the dynamic route as the compatibility fallback for public worker passports.