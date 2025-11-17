# SherCoin - Telegram Mini App

## Overview

SherCoin is a Telegram Mini App implementing a "tap-to-earn" gaming experience. Users tap a coin featuring a lion (sher) design to earn SherCoin currency, complete tasks, learn through educational content, invite friends for referral bonuses, and participate in an airdrop program. The application features a gamified interface with boosts, daily bonuses, and progression systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool. The application is structured as a single-page application (SPA) with client-side routing via Wouter.

**UI Component Library**: Shadcn UI (New York style) built on Radix UI primitives, providing accessible and customizable components. The design system uses Tailwind CSS with custom CSS variables for theming.

**State Management**: TanStack Query (React Query) handles server state management, data fetching, caching, and synchronization. Session-based authentication state is managed through API queries.

**Styling Approach**: Utility-first CSS with Tailwind, featuring a comprehensive theming system supporting light/dark modes with automatic detection. Custom CSS variables enable dynamic color schemes aligned with the SherCoin brand (blue gradients for light mode, dark blue/black for dark mode, gold accents throughout).

**Telegram Integration**: Direct integration with Telegram WebApp SDK for authentication via initData validation, haptic feedback, and native UI expansion.

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js, serving both API endpoints and the built frontend in production.

**Authentication Strategy**: Telegram WebApp initData verification using HMAC-SHA256 cryptographic validation against the bot token. Development mode includes a bypass for local testing. Sessions are maintained using express-session with configurable storage.

**API Design**: RESTful endpoints organized by feature domain (auth, user, tasks, boosts, articles, referrals). Rate limiting implemented for tap actions to prevent abuse (max 20 taps per second with cooldown).

**Energy Regeneration System**: Server-side calculation of energy regeneration at 5 energy per 3 seconds, computed on-demand based on last update timestamp rather than background jobs.

### Data Layer

**ORM**: Drizzle ORM providing type-safe database queries with schema-first design. Schema definitions in TypeScript generate both runtime validators (via drizzle-zod) and database migrations.

**Database Schema Design**:
- **Users**: Core user identity linked to Telegram ID with referral tracking
- **Balances**: Separate table for financial data (balance, energy, level, XP, hourly income)
- **Boosts**: Catalog of temporary power-ups with duration and pricing
- **UserBoosts**: Active boost instances with expiration tracking
- **Tasks**: Reusable task definitions (daily, one-time, special)
- **UserTasks**: Task completion tracking with status transitions
- **Articles**: Educational content with rewards
- **Referrals**: Friend invitation tracking with earnings attribution
- **DailyLogins**: Streak tracking for daily bonus system
- **PromoCodes**: Redeemable codes with usage limits

**Rationale**: Normalized schema separates reference data (boosts, tasks, articles) from user-specific state, enabling efficient queries and flexible task/boost management without schema migrations.

### Key Design Patterns

**Repository Pattern**: Storage abstraction layer (`server/storage.ts`) encapsulates all database operations, providing a clean interface for route handlers and enabling easier testing or database backend changes.

**Server-Side Validation**: Energy and tap mechanics calculated on the server to prevent client-side manipulation. All balance modifications are atomic database operations.

**Optimistic UI Updates**: Client uses React Query mutations with optimistic updates for immediate feedback, with automatic rollback on server errors.

**Feature-Based Routing**: Application divided into five main sections (Arena, Tasks, Learning, Friends, Wallet) each with dedicated page components and corresponding API endpoints.

### Performance Considerations

**Energy Calculation**: Lazy evaluation approach calculates regenerated energy only when requested, avoiding timer-based background processes.

**Query Caching**: React Query configured with infinite stale time for reference data (boosts, tasks, articles) that rarely changes, reducing unnecessary API calls.

**Session Management**: Server-side sessions reduce repeated authentication overhead after initial Telegram validation.

## External Dependencies

### Telegram Platform
- **Telegram Bot API**: Authentication and user identity via WebApp initData
- **Telegram WebApp SDK**: Client-side integration for haptic feedback, theme detection, and viewport management
- **Bot Token**: Required environment variable (`TELEGRAM_BOT_TOKEN`) for HMAC verification

### Database
- **Neon Serverless PostgreSQL**: Configured via `@neondatabase/serverless` package with WebSocket support for serverless environments
- **Connection**: Requires `DATABASE_URL` environment variable
- **Migration**: Drizzle Kit handles schema migrations with `db:push` command

### UI Component Libraries
- **Radix UI**: Headless component primitives (dialogs, dropdowns, tabs, etc.)
- **Shadcn UI**: Pre-styled component layer built on Radix
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Replit Integration**: Vite plugins for runtime error overlay, cartographer, and dev banner in Replit environment
- **TypeScript**: Strict type checking with path aliases for clean imports

### Session Storage
- **express-session**: Session middleware with configurable secret (`SESSION_SECRET` environment variable)
- **connect-pg-simple**: PostgreSQL session store (available but not actively configured in current implementation)

### Asset Management
- Static assets served from `attached_assets` directory via Vite alias configuration