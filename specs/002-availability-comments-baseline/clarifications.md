# Clarifying Questions: Badminton Squad - Availability & Comments Baseline

**Purpose**: De-risk ambiguous areas identified in the baseline specification before proceeding to planning
**Feature**: [spec.md](../spec.md)
**Created**: 2025-12-12
**Status**: ✅ **COMPLETED** - Responses Received and Processed

## 1. Auth & Users

1. **Signup Access**: Is signup open to anyone with the app link, or restricted through invite-only/manual approval process? Anyone can signup with app link, then admin views and verifies information and accept registration

2. **Contact Requirements**: Is email mandatory and phone optional, or can users choose either email OR phone as their single contact method? either works

3. **User Roles**: Do we need any roles beyond normal user (e.g., "organizer" role for users who primarily create sessions, admin for managing users)? A normal user can create sessions and give RSVP ; other role would be Super Admin, which Only I will have which will have all the access including accepting user registration ; cred_manager is another role, wherein (FutureScope) We can do CRUD for credentials where we actually go and register for Courts and book them

4. **Profile Completeness**: Beyond name and contact, are any other profile fields required (display name, bio, skill level)? No

## 2. Sessions

5. **Session Creation Access**: Can anyone logged in create sessions, or should it be restricted to specific users/roles? Anyone

6. **Required Session Fields**: Which fields are mandatory for session creation - is location required, or only date/time? Location, Slot - from to within 1 date only ;
7. **Timezone Handling**: Should the app assume all users are in the same timezone (e.g., fixed to IST), or must it handle multiple user timezones? Yes

8. **Session Edit Restrictions**: Should there be time limits for editing/cancelling sessions (e.g., no changes within 2 hours of start time)? Yes, no changes within same day of session

9. **Session Visibility Duration**: How far into the future should sessions be visible by default (7 days, 30 days, unlimited)? 2 weeks

## 3. Availability Model (COMING / NOT_COMING / TENTATIVE)

10. **Courts Calculation**: Should courts needed be automatically derived (ceil(COMING/4)) and displayed, or just show counts and let users manually decide? yes

11. **Response Flexibility**: Can users change their availability response anytime before session start, or should there be cut-off times? cut off time should be T-1 day midnight

12. **Historical Availability**: Should we store historical availability data for completed sessions (for future stats/analytics), or only for upcoming sessions? both

13. **Default Response State**: When a new session is created, should users have no response (blank), or default to NOT_COMING status? blank

14. **Response Visibility**: Should user names be visible for each response category (who is COMING/TENTATIVE), or only show counts? response for each + count of coming

## 4. Comments / Chat

15. **Comment Structure**: Should comments be a simple linear thread (no replies), or do we need threaded replies to specific comments? threaded is good to have

16. **Comment Moderation**: Do we need moderation capabilities beyond users editing/deleting their own comments (e.g., session creator can delete any comment)? yes

17. **Comment Limits**: Are there content length limits for comments (character count, word count)? not really

18. **Comment Notifications**: While notifications are future scope, should comment activity be tracked for future notification features? no

## 5. UX & Listing Behavior

19. **Session List Views**: Do we need separate views for "All upcoming sessions" vs "Sessions I responded to", or just filtering on one view? 1 view with filter

20. **Response Prompting**: Should sessions where the user hasn't responded yet be visually highlighted or promoted to encourage responses? yes

21. **Session Sorting Options**: Besides chronological (default), should users be able to sort by other criteria (most responses, recently created, location)? yes

22. **Mobile Navigation**: Should "My Activity" be a separate tab/screen, or a filter/toggle on the main sessions list? separate tab

## 6. Data, Privacy, and History

23. **Data Retention**: How long should completed sessions and their availability/comments be retained before deletion or archival? sessions - 2y ; comments - 6 months

24. **Data Export**: Do users need any ability to export their session history or availability data (CSV, etc.)? no

25. **Analytics Foundation**: Should we capture basic analytics data now (games attended, response accuracy) that impacts the data model design? yes

26. **Session Deletion Impact**: When a session creator deletes a session, should responses and comments be hard deleted or preserved for data integrity? hard delete

---

## ✅ **Summary of Key Decisions**

**Access Control**: Open signup with admin approval. Three roles: Normal User (create/respond), Super Admin (all access), Cred Manager (future court booking CRUD).

**Sessions**: Anyone can create. Required fields: location, date/time slot. IST timezone. No edits same-day as session. 2-week visibility.

**Availability**: Auto-calculate courts (ceil(COMING/4)). Response cutoff T-1 day midnight. Store historical data. Blank default state. Show names + counts.

**Comments**: Threaded replies preferred. Session creator can moderate. No length limits.

**UX**: Single view with filters. Highlight unresponded sessions. Multiple sorting options. Separate "My Activity" tab.

**Data**: Sessions retained 2 years, comments 6 months. Analytics tracking enabled. Hard delete on session deletion.

**Next Step**: Proceed to `/speckit.plan` with these clarified requirements.

---

**Instructions for Response**: Please provide numbered answers corresponding to each question. Answers will be integrated into the specification and planning phase to ensure implementation aligns with intended behavior.
