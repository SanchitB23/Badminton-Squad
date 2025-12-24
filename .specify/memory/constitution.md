<!--
Sync Impact Report:
- Version change: [initial template] → 1.0.0
- Modified principles: Complete initial setup
- Added sections: All core principles, Architecture Constraints, Development Standards
- Removed sections: None
- Templates requiring updates: ✅ Updated plan-template.md references to align with new principles
- Follow-up TODOs: None
-->

# Badminton Schedule Tracker Constitution

## Core Principles

### I. Simplicity & Maintainability (NON-NEGOTIABLE)
Keep the architecture boring and predictable. Use a TypeScript/React (Next.js) monolith with a relational database. Avoid microservices, message queues, and complex infrastructure patterns. Every technical decision must be justified by actual business need, not theoretical scalability.

**Rationale**: Small team, simple domain. Premature optimization and over-engineering create maintenance burden without delivering user value.

### II. Mobile-First Design
All user interfaces MUST be designed for mobile devices first, then progressively enhanced for larger screens. Touch targets, responsive layouts, and accessible navigation are mandatory.

**Rationale**: Badminton sessions are coordinated on-the-go. The primary user experience happens on mobile devices.

### III. Data Integrity & Business Rules
Core business logic (session capacity, waitlists, attendance tracking) MUST be enforced at the database and application layer with comprehensive test coverage. User actions that violate business rules must fail gracefully with clear messaging.

**Rationale**: Session coordination requires reliable data. Overbooking or lost registrations break trust and utility.

### IV. Security by Default
- Passwords MUST be properly hashed (bcrypt/scrypt/argon2)
- Authentication tokens/OTP systems MUST be implemented securely
- Sensitive data MUST NOT appear in logs or error messages
- API endpoints MUST validate and sanitize all inputs

**Rationale**: User trust is paramount. Security breaches in social coordination apps have outsized impact on adoption.

### V. Testing Business Logic
All session management logic (joining, leaving, waitlists, capacity enforcement) MUST be covered by automated tests. UI components handling these workflows MUST have interaction tests.

**Rationale**: Business rule violations cause real-world coordination failures. Tests prevent regression in core functionality.

## Architecture Constraints

**Technology Stack**: TypeScript, React, Next.js, relational database (PostgreSQL/SQLite), minimal external dependencies
**Data Models**: Clear separation between Users, Sessions, and Attendance with well-defined relationships
**API Design**: REST-style endpoints with predictable URLs, standard HTTP methods, and consistent error responses
**Database**: Relational design with proper constraints, foreign keys, and indexes for query patterns
**Dependencies**: Prefer standard library and well-established packages; justify any new dependency additions

## Development Standards

**Code Style**: TypeScript strict mode, ESLint/Prettier for consistency, meaningful variable names
**Component Design**: Reusable UI components, proper prop typing, accessibility attributes (ARIA labels, semantic HTML)
**Error Handling**: User-friendly error messages, proper HTTP status codes, graceful degradation
**Performance**: Optimize for mobile networks, implement loading states, avoid unnecessary re-renders
**Documentation**: README setup instructions, API endpoint documentation, component prop documentation

## Governance

This constitution supersedes all other development practices. All feature specifications and implementation plans must verify compliance with these principles. Technical complexity must be explicitly justified against business value.

Amendment process: Proposed changes require documentation of rationale, impact assessment, and migration plan if existing code is affected. Breaking changes to core principles require full team consensus.

For day-to-day development guidance beyond these constitutional requirements, refer to project documentation and existing code patterns.

**Version**: 1.0.0 | **Ratified**: 2025-12-12 | **Last Amended**: 2025-12-12
