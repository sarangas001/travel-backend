# 3. Folder Structuring & File Organization

This document defines a modular repository layout for both the mobile frontend and backend server so implementation stays decoupled and maintainable.

## 3.1 Frontend Workspace Structure

### App Shell and Routes
- app/
  - _layout.tsx
  - (tabs)/
  - destination/
  - modal.tsx

### Screen Layer
- app/(tabs)/index.tsx for the Main Screen
- app/(tabs)/saved.tsx for Saved Places
- app/destination/[id].tsx for Destination Detail
- app/(tabs)/account.tsx for Account

### Component Layer
- components/
  - feed cards, category chips, empty state blocks, skeletons, image carousel pieces, reusable form controls
- components/ui/
  - low-level primitives such as buttons, text fields, loaders, and alert surfaces

### Data and State Layer
- constants/
  - static theme, seed data, category definitions
- hooks/
  - reusable screen state hooks, auth state hooks, loading hooks, cache-aware helpers
- store/
  - session and profile state, saved places state if centralized state is required

### Backend Communication Layer
- services/
  - API client, auth service, destination service, saved places service, account service
- types/
  - DTO and response shape definitions

### Recommended Frontend Principles
- Keep screen components thin and delegate logic to hooks or services
- Centralize API clients to avoid scattered fetch logic
- Separate UI primitives from domain-specific components
- Keep auth state, data cache state, and UI state explicit and independent

## 3.2 Backend Server Structure

### Core Application Layer
- server.js as process entry point
- app.js as express setup and middleware composition
- config/
  - database connection, environment, storage, cache, logging

### Data Layer
- models/
  - user, destination, review, saved place, token or session models
- validation/
  - request schemas and payload guards

### Security Layer
- middleware/
  - authentication, authorization, rate limiting, error handling, request logging
- utils/
  - token helpers, password helpers, response formatting, query helpers

### Route Layer
- routes/
  - auth routes, account routes, destinations routes, saved places routes, health routes

### Operational Layer
- controllers/
  - request handlers for each route group
- services/
  - business logic, lookup orchestration, token lifecycle, media signing if required

### Infra and Ops Layer
- docs/
  - architecture and roadmap documentation
- scripts/
  - seed data, migration helpers, maintenance scripts
- tests/
  - route tests, service tests, validation tests, integration tests

## 3.3 Decoupling Rules

- Routes should only map URLs to controllers
- Controllers should not contain database logic directly when a service layer is warranted
- Validation should happen before controller execution wherever possible
- Models should remain focused on schema and index definitions
- Security logic must be reusable and not duplicated across route handlers
