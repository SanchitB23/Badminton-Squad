# Feature Specification: Badminton Squad Baseline

**Feature Branch**: `001-badminton-squad-baseline`  
**Created**: 2025-12-12  
**Status**: Draft  
**Input**: User description: "Create a baseline specification for a small, mobile-first web app called 'Badminton Squad' that helps a close group of friends coordinate badminton sessions."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - User Registration and Login (Priority: P1)

A friend wants to join the badminton group and needs to create an account to participate in sessions. They can sign up using email/password or phone/email with OTP, then log in to access all features.

**Why this priority**: Without authentication, users cannot access any features. This is the foundational capability that enables all other functionality.

**Independent Test**: Can be fully tested by completing sign-up flow, receiving confirmation (password or OTP), and successfully logging in to reach the main dashboard.

**Acceptance Scenarios**:

1. **Given** a new user visits the app, **When** they complete sign-up with valid email and password, **Then** they receive confirmation and can log in
2. **Given** a new user chooses phone/OTP sign-up, **When** they enter valid phone/email and receive OTP, **Then** they can verify and access the app
3. **Given** an existing user, **When** they enter correct login credentials, **Then** they access the main dashboard
4. **Given** invalid credentials are entered, **When** login is attempted, **Then** clear error message is shown without revealing account existence

---

### User Story 2 - View and Join Sessions (Priority: P1)

A logged-in user wants to see upcoming badminton sessions and join ones that interest them. They can view session details like date, time, location, and current participants, then join if space is available or join the waitlist.

**Why this priority**: This is the core value proposition - seeing and joining games. Without this, the app provides no practical benefit.

**Independent Test**: Can be fully tested by creating test sessions, viewing them in the upcoming sessions list, and successfully joining/leaving sessions with proper status updates.

**Acceptance Scenarios**:

1. **Given** upcoming sessions exist, **When** user views home screen, **Then** they see list of future sessions with key details (date, time, location, player count)
2. **Given** a session with available spots, **When** user joins, **Then** their status becomes JOINED and player count increases
3. **Given** a full session, **When** user joins, **Then** their status becomes WAITLISTED
4. **Given** user has joined a session, **When** they leave, **Then** their attendance is removed and next waitlisted user is promoted

---

### User Story 3 - Create Sessions (Priority: P2)

A user wants to organize a badminton session and needs to create it in the app. They specify date, time, optional location, optional max players, and optional notes to coordinate with friends.

**Why this priority**: While joining sessions is critical, someone needs to create them first. This enables the core social coordination aspect.

**Independent Test**: Can be fully tested by completing session creation flow and verifying the session appears in upcoming sessions list with correct details.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they create a session with required fields, **Then** the session appears in upcoming sessions and they are marked as the creator
2. **Given** session creation, **When** optional fields (location, max players, notes) are provided, **Then** these details are saved and displayed
3. **Given** invalid date (past) is entered, **When** creation is attempted, **Then** clear error message is shown

---

### User Story 4 - Manage Own Sessions (Priority: P2)

A session creator needs to edit or cancel their sessions as plans change. Only the creator can modify their session details or cancel the session entirely.

**Why this priority**: Plans change frequently in social coordination. Creators need flexibility to update details or cancel when necessary.

**Independent Test**: Can be fully tested by creating a session, editing its details, verifying changes appear, and testing cancellation with proper notification to attendees.

**Acceptance Scenarios**:

1. **Given** user created a session, **When** they access session details, **Then** they see edit and cancel options
2. **Given** session creator edits details, **When** changes are saved, **Then** updated information is visible to all users
3. **Given** session creator cancels session, **When** cancellation is confirmed, **Then** session is removed and attendees are notified of status change

---

### User Story 5 - Track Personal Sessions (Priority: P3)

A user wants to quickly see their personal involvement - both sessions they created and sessions they've joined - in one organized view.

**Why this priority**: While helpful for organization, users can access this information through other screens. This provides convenience but not essential functionality.

**Independent Test**: Can be fully tested by joining/creating various sessions and verifying they appear correctly categorized in the personal sessions view.

**Acceptance Scenarios**:

1. **Given** user has created sessions, **When** they access My Sessions, **Then** they see their created sessions listed
2. **Given** user has joined sessions, **When** they access My Sessions, **Then** they see their joined sessions listed
3. **Given** user taps session in My Sessions, **When** session is selected, **Then** they navigate to detailed session view

---

### Edge Cases

- What happens when a session creator cancels a session with waitlisted users?
- How does system handle joining a session at exactly the same time by multiple users when only one spot remains?
- What occurs when a user tries to join a session that starts in the past?
- How does the system behave when a session has no max player limit set?
- What happens if a user tries to join the same session multiple times?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST require user authentication for all core features (viewing, creating, joining sessions)
- **FR-001a**: System MUST require admin approval for new user accounts after email verification
- **FR-002**: System MUST support email/password authentication and email magic links for launch, with SMS OTP as future enhancement
- **FR-003**: System MUST allow users to create sessions with date, time, and optional location, max players, and notes
- **FR-004**: System MUST enforce that only session creators can edit or cancel their sessions
- **FR-005**: System MUST track user attendance status (JOINED, WAITLISTED, CANCELLED) for each session
- **FR-006**: System MUST enforce max player limits when specified, automatically waitlisting excess joins (unlimited capacity when not specified)
- **FR-007**: System MUST automatically promote first waitlisted user when joined users leave sessions
- **FR-008**: System MUST display upcoming sessions for next 2 weeks by default, sorted chronologically
- **FR-008a**: System MUST use India timezone for all session times
- **FR-008b**: System MUST allow users to view past sessions and historical attendance
- **FR-009**: System MUST prevent users from having multiple attendance records for the same session
- **FR-010**: System MUST validate session date/time is in the future during creation
- **FR-011**: System MUST provide clear error messaging for invalid authentication attempts
- **FR-012**: System MUST store user profile with name, email, mobile number (at least email OR mobile required)
- **FR-013**: System MUST allow users to view session details including attendee list
- **FR-014**: System MUST enable users to join/leave sessions with immediate status updates
- **FR-015**: System MUST retain session and attendance data for 10 years
- **FR-016**: System MUST implement soft delete for user accounts, preserving historical session data

### Key Entities

- **User**: Represents authenticated app users with name, email, mobile number (at least one contact method required), approval status, and authentication credentials. Related to sessions as creator or attendee.
- **Session**: Represents badminton games with date/time (India timezone), optional location, optional max players (unlimited if not specified), optional notes, creator, and soft delete status. Data model supports future recurring sessions. Has relationships to multiple attendance records.
- **Attendance**: Links users to sessions with status (JOINED, WAITLISTED, CANCELLED). Each user can have at most one attendance record per session.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can complete account creation and login in under 2 minutes
- **SC-002**: Users can create a new session in under 30 seconds
- **SC-003**: Users can join an available session in under 15 seconds
- **SC-004**: Session details and attendance updates are visible to all users within 5 seconds
- **SC-005**: 95% of join/leave actions complete successfully without error
- **SC-006**: Mobile interface is fully functional on screens 375px wide and larger
- **SC-007**: App loads and displays upcoming sessions in under 3 seconds on mobile networks
