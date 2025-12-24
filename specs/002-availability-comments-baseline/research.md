# Research: Badminton Squad - Availability & Comments Baseline

**Purpose**: Resolve technical unknowns and implementation approaches for availability tracking and comments system
**Created**: 2025-12-22
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md)

## Research Tasks Completed

### 1. Supabase Auth Integration with Next.js App Router

**Decision**: Use Supabase Auth with @supabase/ssr package for App Router compatibility
**Rationale**: Provides secure server-side and client-side auth with built-in email/password and magic link support
**Implementation**:

- Server Components use `createServerClient` for protected routes
- Client Components use `createBrowserClient` for interactive auth
- Middleware handles auth state synchronization

### 2. Database Schema Design for Availability Responses

**Decision**: Use ENUM type for response status with constraint validation
**Rationale**: Ensures data integrity and enables efficient querying
**Alternatives considered**: String with check constraints (chose ENUM for type safety)

```sql
CREATE TYPE response_status AS ENUM ('COMING', 'NOT_COMING', 'TENTATIVE');
```

### 3. Threaded Comments Implementation

**Decision**: Self-referencing foreign key with parent_comment_id for threading
**Rationale**: Simple tree structure, efficient queries, supports unlimited nesting depth
**Alternatives considered**: Materialized path (rejected - overkill for use case)

### 4. IST Timezone Handling Strategy

**Decision**: Store UTC in database, display as IST in UI using Intl.DateTimeFormat
**Rationale**: Standard practice for timezone handling, supports future expansion
**Implementation**: Use `timestamptz` PostgreSQL type with timezone conversion in queries

### 5. Mobile-First Component Architecture

**Decision**: Compound component pattern with responsive design tokens
**Rationale**: Promotes reusability while maintaining mobile-first approach
**Example**: SessionCard with embedded ResponseControls and CommentThread

### 6. Real-time Updates Strategy

**Decision**: Use Supabase Realtime for live response count updates
**Rationale**: Enhances user experience for coordination without complex WebSocket management
**Scope**: Applied to response counts and new comments only

### 7. Testing Strategy for Business Logic

**Decision**: Separate database utility functions for testability
**Rationale**: Enables unit testing of response logic without database dependencies
**Implementation**: Pure functions for court calculations, response validations

### 8. Role-based Access Control Implementation

**Decision**: Store role in profiles table with RLS policies
**Rationale**: Leverages Supabase RLS for security, simple role checking in UI
**Roles**: normal_user (default), super_admin, cred_manager (future)

## Technical Specifications Clarified

### Performance Targets

- **Page Load**: <3 seconds on 3G mobile networks
- **Response Updates**: <5 seconds end-to-end
- **Comment Posting**: <10 seconds including optimistic updates

### Security Measures

- Row Level Security (RLS) policies for all tables
- Input validation using Zod schemas
- CSRF protection via Supabase auth tokens
- Rate limiting on comment posting (future enhancement)

### Accessibility Standards

- WCAG 2.1 AA compliance for mobile interfaces
- Screen reader support for response status changes
- Keyboard navigation for all interactive elements

## Implementation Dependencies

### Required Packages

```json
{
  "@supabase/ssr": "^0.1.0",
  "@supabase/supabase-js": "^2.38.0",
  "tailwindcss": "^3.4.0",
  "zod": "^3.22.0",
  "date-fns": "^3.0.0"
}
```

### Development Tools

- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Prettier for code formatting
- Husky for pre-commit hooks

### Database Extensions

```sql
-- Enable RLS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable realtime
ALTER publication supabase_realtime ADD TABLE responses, comments;
```

## Decisions Finalized

All technical unknowns resolved. Implementation approach validated against constitutional constraints. Ready to proceed to Phase 1 design artifacts.
