# Badminton Squad - AI Coding Agent Instructions

## Project Overview

**Badminton Squad** is a mobile-first web application for coordinating badminton sessions among close friends. Built with Next.js 14+ App Router, Supabase PostgreSQL, and TypeScript.

## Project Constitution & Development Standards

This project follows strict constitutional principles defined in `.specify/memory/constitution.md`:

### Core Principles

- **Simplicity & Maintainability**: TypeScript/React monolith with relational database - avoid microservices and complex patterns
- **Mobile-First Design**: All interfaces designed for mobile first, progressively enhanced
- **Data Integrity**: Business rules enforced at database and application layer with comprehensive tests
- **Security by Default**: Proper password hashing, input validation, no sensitive data in logs
- **Testing Business Logic**: Session management logic must have automated test coverage

### Technology Constraints

- **Stack**: TypeScript + Next.js + PostgreSQL, minimal external dependencies
- **Architecture**: REST-style APIs, relational database design with proper constraints
- **Code Standards**: TypeScript strict mode, ESLint/Prettier, meaningful naming, accessibility

## Architecture Patterns

### Authentication & Authorization

- **Dual client pattern**: Use `lib/supabase/client.ts` for client components, `lib/supabase/server.ts` for server components/actions
- **User approval flow**: All users must be approved by admin (`profiles.approved = true`) before accessing dashboard
- **Middleware protection**: `middleware.ts` handles route protection and redirects unapproved users to `/pending-approval`
- **Role-based access**: Three roles: `normal_user`, `super_admin`, `cred_manager` (see database enums)

### Database Design

- **Supabase RLS enabled**: Row-level security enforced through policies in `migrations/002_rls_policies.sql`
- **Typed database client**: Generated types in `types/database.types.ts` provide full type safety
- **IST timezone constraints**: All session times use `TIMEZONE('Asia/Kolkata')` for consistency
- **Response tracking**: Sessions have users with status: `COMING`, `NOT_COMING`, `TENTATIVE`

### Form & Validation Patterns

- **React Hook Form + Zod**: All forms use `useForm` with `zodResolver` for validation
- **Validation schemas**: Located in `lib/validations/` with exported TypeScript types
- **Error handling**: Server errors displayed via `generalError` state, field errors via form validation

### Component Architecture

- **Shadcn/ui base**: All UI components extend Radix primitives with CVA variants
- **Route groups**: Auth pages in `(auth)` group, protected pages in `dashboard` group
- **Server/Client boundary**: Server Components for data fetching, Client Components for interactivity

### File Organization Conventions

- **Database schema**: Migrations in `supabase/migrations/` with sequential numbering
- **Specs documentation**: Feature specifications in `specs/[###-feature-name]/`
- **UI components**: Base components in `components/ui/`, feature-specific in named directories
- **Type definitions**: Generated database types, plus custom types per feature

## Development Workflows

### Database Changes

1. Create new migration in `supabase/migrations/###_description.sql`
2. Run `supabase db reset` to apply all migrations locally
3. Regenerate types with `supabase gen types typescript > client/types/database.types.ts`

### Running the Application

- **Development**: `npm run dev` from `/client` directory (Next.js dev server)
- **Database**: Ensure Supabase project is running and environment variables set in `.env.local`
- **Dependencies**: All client dependencies managed via `/client/package.json`

### Authentication Testing

- Use `/signup` to create accounts, admin must approve via database before dashboard access
- Test both approved and unapproved user flows through middleware redirects

## Key Integration Points

### Supabase Client Usage

```typescript
// Server Components (RSCs)
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();

// Client Components
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
```

### Middleware Auth Flow

Middleware checks authentication, then profile approval status. Redirects:

- Unauthenticated: → `/login`
- Authenticated but unapproved: → `/pending-approval`
- Authenticated and approved: → Continue to protected route

### Database Entity Relationships

- `profiles` extends `auth.users` with approval workflow
- `sessions` created by users, have multiple `responses` from participants
- `comments` form threaded discussions on sessions with `parent_comment_id`
- `user_analytics` tracks prediction accuracy for future ML features

## Project-Specific Patterns

### Session Management

- Sessions must be in future (`sessions_future_check` constraint)
- Start/end times must be same day in IST (`sessions_same_day_check`)
- Location is required field, title/description optional

### Comment Threading

- Comments support nested replies via `parent_comment_id`
- Self-referencing prevented by `comments_no_self_parent` constraint
- Display ordered by `created_at` for chronological threading

### Mobile-First Design

- Tailwind CSS with mobile-first approach
- Touch-friendly UI components from Radix primitives
- Responsive breakpoints for tablet/desktop enhancements

This codebase follows a conventional Next.js + Supabase pattern with emphasis on type safety, mobile optimization, and social coordination features. The approval workflow and role-based access are unique aspects that affect all user interactions.
