# Clarifying Questions: Badminton Squad Baseline

**Purpose**: De-risk ambiguous areas identified in the baseline specification before proceeding to planning
**Feature**: [spec.md](../spec.md)
**Created**: 2025-12-12
**Status**: ✅ **COMPLETED** - Responses Received and Processed

## Auth Model & Authentication

1. **Email vs Phone Priority**: Is email mandatory for all users, or can users sign up with phone number only? Should both email and phone be captured during registration? If phone registration is possible for free, then not mandatory, but at least one is required with First Name

2. **OTP Implementation Scope**: For launch, is implementing both email/password AND phone/OTP required, or can we start with email/password + email OTP and add SMS OTP later? yes, email pass / email magic link can be implemented first, SMS Later

3. **Third-Party Auth Constraints**: Are there any restrictions on using third-party authentication providers like Supabase Auth, Firebase Auth, or Auth0 given the constitution's "minimal dependencies" principle? Project should be built within the free tier, no additional cost to be incurred.

4. **Password Requirements**: What are the minimum password complexity requirements (length, character types, etc.)? Standard

5. **Session Management**: How long should user sessions remain active? Should there be "remember me" functionality? Yes, add remember me ; session activeness should be max hours

## User Model & Access Control

6. **Access Model**: Is this app invite-only for a closed group of friends, or should it support open signup with some form of group discovery/joining? Once signed-up with email verification, user will have to wait for admin acceptance, similar to invite only.

7. **Admin Roles**: Beyond "session creator" permissions, do we need any administrative roles (e.g., group admin who can manage users, delete any session)? Yes, for future scope, we would need permission to view / add / delete / update court registration credentials, where users can update their creds within the website.

8. **Required Profile Fields**: Besides name, what profile information is required vs optional (photo, preferred position, skill level, contact preferences)? Keep it simple, nothing else, name, mobile number, email, password

9. **User Onboarding**: How should new users discover or be added to the friend group? Manual invitation codes, email invites, or something else? I will manually share website wherein they can register and wait for me to accept their registration

## Sessions & Attendance Logic

10. **Timezone Handling**: Should the app assume all users are in the same timezone, or must it handle multiple timezones? What timezone should be used for session display? Yes, Same timezone, India

11. **Edit/Cancel Time Limits**: Are there restrictions on editing or cancelling sessions close to start time (e.g., no changes within 2 hours of start)? No need

12. **Waitlist Auto-Promotion**: When someone leaves a full session, should the first waitlisted user be automatically promoted to JOINED, or should they be notified to confirm? No need

13. **Session Capacity Rules**: When max players is not specified, should the session have unlimited capacity, or should there be a default maximum? yes

14. **Past Session Behavior**: Should users be able to view/access past sessions, and if so, can they see historical attendance? yes

## UX Behavior & Interface

15. **Session Display Range**: How far into the future should upcoming sessions be shown by default (e.g., next 30 days, next 3 months)? Next 2 weeks

16. **Session Sorting**: What should be the default sort order for sessions (chronological, most recently created, most spots available)? chronological

17. **My Sessions Implementation**: Should "My Sessions" be a separate screen/tab, or just a filter option on the main sessions list? Filter

18. **Form Validation Limits**: What are the specific validation rules for session creation (e.g., minimum advance notice, maximum players allowed, character limits for notes)? Standard

19. **Notification Requirements**: Even though notifications are out of scope, should the UI indicate attendance changes that would benefit from notifications later? No need

## Data Management & Privacy

20. **Session Data Retention**: How long should completed sessions and their attendance data be retained before deletion? 10 years

21. **User Data Deletion**: What happens to sessions and attendance when a user deletes their account? It should be soft delete and data should retain.

22. **Logging Restrictions**: Given security requirements, what user actions (if any) should be logged for debugging vs privacy concerns? Standard

23. **Export Capabilities**: Do users need any way to export their session history or personal data? No

## Future-Proofing & Data Model

24. **Multi-Sport Preparation**: While not in scope now, should the data model anticipate supporting other sports later (e.g., should sessions have a "sport type" field)? No

25. **Notification Data Structure**: Should user and session entities include fields that will support push notifications later (device tokens, notification preferences)? No

26. **Statistics Foundation**: Are there any basic tracking fields needed now to support future analytics (e.g., user join/creation counts, session popularity metrics)? No need for it now

27. **Recurring Sessions**: Should the data model anticipate recurring sessions even if the UI doesn't support creating them initially? Yes

---

## ✅ **Summary of Key Decisions**

**Authentication Model**: Email/password + email magic links for launch, SMS OTP later. Free tier third-party auth only.

**Access Control**: Admin approval required after email verification (invite-only model). Admin roles for future court registration management.

**User Profile**: Simplified - name, email, mobile number (at least one contact required).

**Session Behavior**: India timezone, 2-week display range, chronological sorting, unlimited capacity default, auto-promote waitlisted users.

**Data Management**: 10-year retention, soft delete for users, recurring sessions data model preparation.

**Next Step**: Proceed to `/speckit.plan` with these clarified requirements.

---

**Instructions for Response**: Please provide numbered answers corresponding to each question. Answers will be integrated into the planning phase to ensure implementation aligns with intended behavior and future requirements.
