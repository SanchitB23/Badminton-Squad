# Tasks: Badminton Squad - Availability & Comments Baseline

**Input**: Design documents from `/specs/002-availability-comments-baseline/`
**Prerequisites**: plan.md (✓), spec.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Project Setup & Foundation

### Setup & Configuration

- [x] T001 Initialize Next.js 14+ project with TypeScript and App Router in repository root
- [x] T002 [P] Configure Tailwind CSS with mobile-first breakpoints in tailwind.config.js
- [x] T003 [P] Set up ESLint, Prettier, and TypeScript strict mode in project configs
- [X] T004 [P] Create Supabase project and configure environment variables in .env.local
- [X] T005 [P] Set up Husky pre-commit hooks for linting and type checking

### Database & Supabase Setup

- [x] T006 Create database schema migration for profiles table in supabase/migrations/
- [x] T007 Create database schema migration for sessions table in supabase/migrations/
- [x] T008 Create database schema migration for responses table with ENUM type in supabase/migrations/
- [x] T009 Create database schema migration for comments table with threading in supabase/migrations/
- [x] T010 [P] Configure Row Level Security policies for all tables in supabase/migrations/
- [x] T011 [P] Set up database indexes for performance optimization in supabase/migrations/
- [x] T012 [P] Generate TypeScript types from Supabase schema in types/database.types.ts

### Core Infrastructure

- [x] T013 [P] Set up Supabase client configuration in lib/supabase/client.ts and server.ts
- [x] T014 [P] Create auth utilities and middleware for protected routes in lib/auth/
- [x] T015 [P] Set up form validation schemas using Zod in lib/validations/
- [x] T016 [P] Create base UI components (Button, Input, Card) in components/ui/
- [ ] T017 [P] Set up testing infrastructure with Jest and React Testing Library

## Phase 2: User Story 1 - Authentication & Access (P1)

**Goal**: Users can sign up, get admin approval, and log in to access the app

**Independent Test**: Complete signup → admin approval → login → access dashboard

### Authentication Implementation

- [x] T018 [US1] Create signup page with email/password form in app/(auth)/signup/page.tsx
- [x] T019 [US1] Create login page with email/password form in app/(auth)/login/page.tsx
- [x] T020 [US1] Implement Supabase Auth signup flow in components/auth/SignupForm.tsx
- [x] T021 [US1] Implement Supabase Auth login flow in components/auth/LoginForm.tsx
- [x] T022 [US1] Create profile creation trigger function in supabase/migrations/
- [x] T023 [US1] Build admin approval interface for super admin in app/admin/users/page.tsx
- [x] T024 [US1] Create middleware to redirect unapproved users in middleware.ts
- [X] T025 [US1] Add error handling for auth failures in auth components

**Checkpoint**: Users can register, await approval, and access protected routes after login

## Phase 3: User Story 2 - View Sessions & Respond (P1)

**Goal**: Users can view upcoming sessions and set availability responses

**Independent Test**: View sessions list → set response → see count updates → change response

### Sessions Display & Response System

- [x] T026 [US2] Create sessions list page in app/dashboard/sessions/page.tsx
- [x] T027 [US2] Build SessionCard component with response counts in components/session/SessionCard.tsx
- [x] T028 [US2] Implement availability response controls in components/response/ResponseControls.tsx
- [x] T029 [US2] Create API endpoint for fetching sessions with counts in app/api/sessions/route.ts
- [x] T030 [US2] Create API endpoint for setting/updating responses in app/api/responses/route.ts
- [x] T031 [US2] Implement courts calculation logic (ceil(COMING/4)) in lib/utils/courts.ts
- [X] T032 [US2] Add real-time response updates using Supabase Realtime
- [X] T033 [US2] Create session filtering and sorting functionality in sessions list
- [x] T034 [US2] Add response cutoff logic (T-1 day midnight IST) in response validation

**Checkpoint**: Users can view sessions, respond with COMING/TENTATIVE/NOT_COMING, see live updates

## Phase 4: User Story 3 - Create Sessions (P1)

**Goal**: Users can create new badminton sessions with required details

**Independent Test**: Fill session form → save → session appears in list → other users can respond

### Session Creation

- [x] T035 [US3] Create session creation page in app/dashboard/create-session/page.tsx
- [x] T036 [US3] Build SessionForm component with validation in components/session/SessionForm.tsx
- [x] T037 [US3] Implement session creation API endpoint in app/api/sessions/route.ts
- [x] T038 [US3] Add IST timezone handling and date/time validation
- [x] T039 [US3] Create session validation rules (future date, same-day only) in lib/validations/session.ts
- [x] T040 [US3] Add location field requirement and validation
- [x] T041 [US3] Implement session creation success/error handling

**Checkpoint**: Users can create sessions that appear in the sessions list for all users

## Phase 5: User Story 4 - Session Comments & Discussion (P2)

**Goal**: Users can comment on sessions with threaded replies and moderation

**Independent Test**: Post comment → reply to comment → edit own comment → moderate as creator

### Comments System

- [x] T042 [US4] Create session detail page in app/dashboard/session/[id]/page.tsx
- [x] T043 [US4] Build CommentThread component with nesting in components/comments/CommentThread.tsx
- [x] T044 [US4] Create CommentForm component for posting/editing in components/comments/CommentForm.tsx
- [x] T045 [US4] Implement comments API endpoints (GET/POST/PUT/DELETE) in app/api/sessions/[id]/comments/
- [x] T046 [US4] Add comment threading logic with parent-child relationships
- [x] T047 [US4] Implement comment moderation (own comments + session creator) in comment components
- [x] T048 [US4] Create comment validation and sanitization in lib/validations/comment.ts

**Checkpoint**: Users can discuss sessions through threaded comments with proper moderation

## Phase 6: User Story 5 - Manage Own Sessions (P2)

**Goal**: Session creators can edit and delete their sessions

**Independent Test**: Create session → edit details → verify changes → delete session → confirm removal

### Session Management

- [x] T049 [US5] Add edit/delete buttons to SessionCard for creators in components/session/SessionCard.tsx
- [x] T050 [US5] Create session edit page in app/dashboard/session/[id]/edit/page.tsx
- [x] T051 [US5] Implement session update API endpoint in app/api/sessions/[id]/route.ts
- [x] T052 [US5] Add same-day edit restriction logic in session validation
- [x] T053 [US5] Implement session deletion with confirmation dialog
- [x] T054 [US5] Handle cascade deletion of responses and comments on session delete

**Checkpoint**: Session creators can manage their sessions with proper restrictions

## Phase 7: User Story 6 - Personal Activity View (P3)

**Goal**: Users can view filtered list of their created and responded sessions

**Independent Test**: Navigate to My Activity → see created sessions → see responded sessions

### Activity Tracking

- [x] T055 [US6] Create My Activity page in app/dashboard/my-activity/page.tsx
- [x] T056 [US6] Implement activity filtering logic (created/responded) in activity components
- [x] T057 [US6] Create API endpoint for user activity data in app/api/users/activity/route.ts
- [x] T058 [US6] Add activity view navigation to main dashboard

**Checkpoint**: Users can track their session involvement through dedicated activity view

## Phase 8: Mobile UX & Polish

### Analytics & Tracking

- [ ] T059a [P] Create analytics schema for user attendance tracking in supabase/migrations/
- [ ] T059b [P] Implement response accuracy calculation in lib/utils/analytics.ts
- [ ] T059c [P] Add analytics data collection on session completion in app/api/sessions/[id]/complete/route.ts

### Mobile-First Enhancements

- [ ] T059 [P] Optimize SessionCard layout for mobile screens in components/session/
- [ ] T060 [P] Implement touch-friendly response controls (44px targets) in components/response/
- [ ] T061 [P] Add session highlighting for unresponded items in sessions list
- [ ] T062 [P] Create responsive navigation with bottom tabs in app/layout.tsx
- [ ] T063 [P] Optimize comment thread display for mobile in components/comments/
- [ ] T064 [P] Add loading states and skeleton components in components/ui/
- [ ] T065 [P] Implement optimistic updates for response changes

## Phase 9: Testing & Quality Assurance

### Unit Testing

- [ ] T066 [P] Write unit tests for courts calculation logic in tests/utils/courts.test.ts
- [ ] T067 [P] Write unit tests for response validation logic in tests/validations/response.test.ts
- [ ] T068 [P] Write unit tests for session validation logic in tests/validations/session.test.ts
- [ ] T069 [P] Write component tests for SessionCard in tests/components/session/SessionCard.test.tsx
- [ ] T070 [P] Write component tests for ResponseControls in tests/components/response/ResponseControls.test.tsx

### Integration Testing

- [ ] T071 Write integration test for complete signup → approval → login flow in tests/integration/auth.test.ts
- [ ] T072 Write integration test for create session → respond → view counts flow in tests/integration/sessions.test.ts
- [ ] T073 Write integration test for comment posting → threading → moderation flow in tests/integration/comments.test.ts

### End-to-End Testing

- [ ] T074 Write E2E test for full user journey: signup → create session → respond → comment in tests/e2e/user-journey.spec.ts
- [ ] T075 Write E2E test for admin approval workflow in tests/e2e/admin-approval.spec.ts

## Dependencies & Execution

### Parallel Execution Opportunities

**Setup Phase (T001-T017)**: All tasks can run in parallel after T001
**Foundation (T018-T025)**: Auth components can be built in parallel
**Core Features (T026-T041)**: Sessions and responses can be developed in parallel
**Enhancement (T042-T065)**: Comments, management, and mobile optimization can be parallel
**Testing (T066-T075)**: All test tasks can run in parallel after implementation

### Critical Path Dependencies

1. **T001 → T002-T017**: Project setup must complete before other tasks
2. **T006-T012**: Database setup must complete before API implementation
3. **T018-T025**: Auth must work before protected features
4. **T026-T034**: Sessions list needed before creation and comments
5. **T035-T041**: Session creation enables management features

### MVP Delivery Strategy

**MVP Scope (Weeks 1-2)**: Complete Phases 1-4 (T001-T041)

- Basic auth with admin approval
- Sessions listing with response tracking
- Session creation
- Core functionality working

**Enhanced MVP (Week 3)**: Add Phase 5 (T042-T048)

- Comments and discussion features
- Session detail views

**Full Feature Set (Week 4)**: Complete remaining phases

- Session management
- Mobile optimization
- Comprehensive testing

**Estimated Total**: 75 tasks, ~4 weeks for full implementation
