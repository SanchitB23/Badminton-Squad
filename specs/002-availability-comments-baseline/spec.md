# Feature Specification: Badminton Squad - Availability & Comments Baseline

**Feature Branch**: `002-availability-comments-baseline`  
**Created**: 2025-12-12  
**Status**: Draft  
**Input**: User description: "Create an updated baseline specification for a small, mobile-first web app called 'Badminton Squad' with availability responses and comments functionality"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - User Authentication & Access (Priority: P1)

A friend wants to join the badminton group and access session information. They sign up using email/password or phone/email with OTP, then log in to view sessions and participate in coordination.

**Why this priority**: Authentication is the foundation - users cannot view sessions, respond, or comment without being logged in.

**Independent Test**: Can be fully tested by completing sign-up flow, email/OTP verification, and successfully logging in to access the sessions list.

**Acceptance Scenarios**:

1. **Given** a new user visits the app, **When** they complete sign-up with valid email and password, **Then** they can log in and access the sessions list
2. **Given** a new user chooses phone/email + OTP sign-up, **When** they verify their OTP, **Then** they can access all app features
3. **Given** an existing user, **When** they enter correct credentials, **Then** they land on the sessions list
4. **Given** invalid credentials, **When** login is attempted, **Then** clear error message is shown

---

### User Story 2 - View Sessions & Respond (Priority: P1)

A logged-in user wants to see upcoming badminton sessions and indicate their availability (COMING, NOT_COMING, or TENTATIVE) so the group can estimate how many courts to book.

**Why this priority**: This is the core value proposition - coordinating availability to plan court bookings. Without this, the app provides no practical benefit.

**Independent Test**: Can be fully tested by creating test sessions, viewing them in the list, and setting/changing availability responses with proper count updates.

**Acceptance Scenarios**:

1. **Given** upcoming sessions exist, **When** user views sessions list, **Then** they see sessions with date, time, location, and response counts
2. **Given** a session without user response, **When** user selects COMING, **Then** their response is saved and COMING count increases
3. **Given** a user has already responded, **When** they change from COMING to TENTATIVE, **Then** response is updated and counts adjust accordingly
4. **Given** multiple users respond, **When** viewing session, **Then** accurate counts are shown for COMING/TENTATIVE/NOT_COMING

---

### User Story 3 - Create Sessions (Priority: P1)

A user wants to propose a badminton session by creating it in the app. They specify date, time, optional location, title, and notes to coordinate with friends.

**Why this priority**: Someone needs to create sessions before others can respond. This enables the core coordination activity.

**Independent Test**: Can be fully tested by completing session creation flow and verifying the session appears in the list with correct details and zero initial responses.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they create a session with required fields, **Then** the session appears in the list with creator marked
2. **Given** session creation with optional fields, **When** location and notes are provided, **Then** these details are displayed
3. **Given** invalid date (past), **When** creation is attempted, **Then** clear error message prevents creation
4. **Given** session creation, **When** saved, **Then** recommended courts calculation shows 0 (no responses yet)

---

### User Story 4 - Session Comments & Discussion (Priority: P2)

Users want to discuss session details, ask questions, or share updates using a simple comments section for each session.

**Why this priority**: While availability responses handle the main coordination, comments enable the social discussion that makes planning work smoothly.

**Independent Test**: Can be fully tested by posting comments on a session, viewing all comments with timestamps, and editing/deleting own comments.

**Acceptance Scenarios**:

1. **Given** a session exists, **When** user posts a comment, **Then** it appears in the session's comment thread with author and timestamp
2. **Given** multiple users comment, **When** viewing session details, **Then** all comments are displayed chronologically
3. **Given** user posted a comment, **When** they edit it, **Then** the updated text is saved and displayed
4. **Given** user posted a comment, **When** they delete it, **Then** the comment is removed from the thread

---

### User Story 5 - Manage Own Sessions (Priority: P2)

A session creator needs to edit session details or delete sessions when plans change. Only the creator can modify their sessions.

**Why this priority**: Plans change frequently in social coordination. Creators need flexibility to update details or cancel when necessary.

**Independent Test**: Can be fully tested by creating a session, editing its details, verifying changes appear, and testing deletion with proper cleanup.

**Acceptance Scenarios**:

1. **Given** user created a session, **When** they access session details, **Then** they see edit and delete options
2. **Given** creator edits session details, **When** changes are saved, **Then** updated information is visible to all users
3. **Given** creator deletes session, **When** deletion is confirmed, **Then** session and all responses/comments are removed
4. **Given** non-creator user, **When** they view session details, **Then** they do not see edit/delete options

---

### User Story 6 - Track Personal Activity (Priority: P3)

A user wants to see a filtered view of sessions they created or responded to, providing quick access to their relevant sessions.

**Why this priority**: While helpful for personal organization, users can access this information through the main sessions list. This provides convenience but not essential functionality.

**Independent Test**: Can be fully tested by creating/responding to various sessions and verifying they appear in the personal activity view with correct response status.

**Acceptance Scenarios**:

1. **Given** user has created sessions, **When** they access My Activity, **Then** they see their created sessions
2. **Given** user has responded to sessions, **When** they access My Activity, **Then** they see sessions with their responses
3. **Given** user activity view, **When** session is selected, **Then** they navigate to full session detail view

---

### Edge Cases

- What happens when a user tries to respond to a session that starts in the past?
- How does system handle concurrent responses from multiple users to the same session?
- What occurs when a session creator deletes a session with existing responses and comments?
- How does recommended courts calculation handle edge cases (0 responses, very large numbers)?
- What happens if a user tries to comment on a deleted session?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST require user authentication for all core features (viewing sessions, responding, commenting)
- **FR-001a**: System MUST require Super Admin approval for new user accounts after signup
- **FR-001b**: System MUST support three user roles: Normal User, Super Admin, and Cred Manager (future scope)
- **FR-002**: System MUST support email/password and phone/email with OTP authentication methods
- **FR-003**: System MUST allow users to create sessions with date, time slot, and required location field, plus optional title and notes
- **FR-003a**: System MUST prevent session edits on the same day as the session
- **FR-003b**: System MUST use IST timezone for all session times
- **FR-004**: System MUST enforce that only session creators can edit or delete their sessions
- **FR-005**: System MUST track user availability responses (COMING, NOT_COMING, TENTATIVE) for each session
- **FR-006**: System MUST allow users to change their availability response until T-1 day midnight before session
- **FR-006a**: System MUST default new sessions to blank response state for all users
- **FR-006b**: System MUST display user names for each response category plus total counts
- **FR-007**: System MUST prevent users from having multiple active responses per session
- **FR-008**: System MUST display upcoming sessions for next 2 weeks by default, sorted chronologically
- **FR-008a**: System MUST highlight sessions where current user has not responded
- **FR-008b**: System MUST provide sorting options (chronological, most responses, recently created, location)
- **FR-009**: System MUST calculate and display response counts for each session (COMING/TENTATIVE/NOT_COMING)
- **FR-010**: System MUST derive recommended courts using formula: ceil(COMING_count / 4)
- **FR-011**: System MUST validate session date/time is in the future during creation
- **FR-012**: System MUST store user profile with name and at least one contact method (email or phone)
- **FR-013**: System MUST enable threaded commenting on sessions with text content and timestamps
- **FR-014**: System MUST allow users to edit/delete their own comments and session creators to moderate any comment
- **FR-015**: System MUST display comments in threaded structure within each session
- **FR-016**: System MUST show session details including all fields, response counts, and user lists by response type
- **FR-017**: System MUST provide clear error messaging for invalid authentication attempts
- **FR-018**: System MUST enable immediate response updates visible to all users
- **FR-019**: System MUST retain completed sessions for 2 years and comments for 6 months
- **FR-020**: System MUST track analytics data for games attended and response accuracy
- **FR-021**: System MUST hard delete sessions with all associated responses and comments when creator deletes session

### Key Entities

- **User**: Represents authenticated app users with unique ID, name, contact info (email or phone), role (Normal User/Super Admin/Cred Manager), and approval status. Related to sessions as creator, to responses as responder, and to comments as author.
- **Session**: Represents badminton play opportunities with date/time (IST timezone), required location, optional title/notes, creator, timestamps, and edit restrictions (no same-day changes). Has relationships to multiple user responses and threaded comments.
- **Response**: Links users to sessions with availability status (COMING, NOT_COMING, TENTATIVE). Each user can have at most one active response per session.
- **Comment**: Represents threaded discussion messages within sessions, containing text content, author, session reference, optional parent comment (for threading), timestamp, and moderation capabilities. Users can edit/delete own comments; session creators can moderate any comment.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can complete account creation and login in under 2 minutes
- **SC-002**: Users can create a new session in under 30 seconds
- **SC-003**: Users can set their availability response in under 10 seconds
- **SC-004**: Session details, response counts, and comments update within 5 seconds for all users
- **SC-005**: 95% of response changes complete successfully without error
- **SC-006**: Mobile interface is fully functional on screens 375px wide and larger
- **SC-007**: Sessions list loads and displays in under 3 seconds on mobile networks
- **SC-008**: Users can post a comment and see it appear in under 10 seconds
- **SC-009**: Recommended courts calculation accurately reflects COMING responses (ceil(count/4))
