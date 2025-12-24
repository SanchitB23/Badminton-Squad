# Quickstart Guide: Badminton Squad Development

**Purpose**: Get the Badminton Squad app running locally with all features
**Created**: 2025-12-22
**Prerequisites**: Node.js 18+, Git, Supabase account

## 🚀 Quick Setup (5 minutes)

### 1. Clone and Install

```bash
git clone <repository-url>
cd badminton-schedule-tracker
npm install
```

### 2. Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create new project (or use existing)
supabase projects create badminton-squad

# Initialize local development
supabase init
supabase start
```

### 3. Environment Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Database Setup

```bash
# Run migrations
supabase db push

# Seed test data (optional)
supabase db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` - you're ready to go! 🎉

## 📁 Project Structure

```
badminton-schedule-tracker/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── dashboard/         # Protected routes
│   ├── api/              # API endpoints
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/              # Base UI components
│   ├── auth/            # Auth components
│   ├── session/         # Session components
│   ├── response/        # Response components
│   └── comments/        # Comment components
├── lib/                 # Utilities and configs
│   ├── supabase/       # Supabase client
│   ├── auth/           # Auth utilities
│   └── validations/    # Form validation
├── types/              # TypeScript definitions
├── supabase/          # Database migrations & config
└── tests/             # Test files
```

## 🔧 Development Workflow

### Local Development Commands

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run test         # Run test suite
npm run type-check   # TypeScript validation
npm run lint         # ESLint check
npm run format       # Prettier formatting
```

### Database Management

```bash
supabase db reset           # Reset local database
supabase db diff            # Check for schema changes
supabase gen types typescript # Generate TypeScript types
```

## 👤 User Roles & Permissions

### Normal User (default)

- ✅ View all sessions
- ✅ Create sessions
- ✅ Edit own sessions
- ✅ Set availability responses
- ✅ Comment on sessions
- ❌ Approve new users

### Super Admin

- ✅ All normal user permissions
- ✅ Approve/reject new users
- ✅ Moderate any comments
- ✅ Delete any sessions (emergency)

### Cred Manager (future)

- ✅ All normal user permissions
- ✅ Manage court booking credentials

## 🎮 Key Features Demo

### 1. Create Your First Session

1. Navigate to `/dashboard/create-session`
2. Fill in session details:
   - **Location**: "Sports Complex Court 1" (required)
   - **Date/Time**: Pick future date in IST
   - **Title**: "Weekend Doubles" (optional)
3. Save → Session appears in dashboard

### 2. Set Availability Response

1. Go to dashboard sessions list
2. Click response buttons: COMING | TENTATIVE | NOT_COMING
3. Watch real-time count updates
4. See recommended courts: ceil(COMING count ÷ 4)

### 3. Comment on Sessions

1. Click session card to view details
2. Scroll to comments section
3. Post comment or reply to existing ones
4. Edit/delete your own comments

## 🧪 Testing Strategy

### Unit Tests

```bash
npm run test:unit        # Component and utility tests
npm run test:unit:watch  # Watch mode for development
```

### Integration Tests

```bash
npm run test:integration # API and database tests
npm run test:e2e        # End-to-end user flows
```

### Test Database

```bash
supabase db reset --db-url postgresql://localhost:54322/postgres
npm run test:db-seed    # Populate test data
```

## 🌐 Authentication Flow

### Email/Password Flow

1. User visits `/signup`
2. Enters email, password, name
3. Supabase creates auth user + profile
4. Profile marked as `approved: false`
5. Super admin approves via dashboard
6. User can now access all features

### Magic Link Flow (future)

1. User enters email on login
2. Receives magic link via email
3. Clicks link → authenticated
4. Same approval process applies

## 🎨 UI Component Examples

### Session Card Component

```tsx
<SessionCard
  session={session}
  userResponse="COMING"
  onResponseChange={handleResponseChange}
  showCommentCount={true}
/>
```

### Response Controls

```tsx
<ResponseControls
  sessionId="uuid"
  currentResponse="TENTATIVE"
  disabled={isPastCutoff}
  onChange={handleChange}
/>
```

### Comment Thread

```tsx
<CommentThread
  sessionId="uuid"
  comments={comments}
  onAddComment={handleAdd}
  onEditComment={handleEdit}
/>
```

## 📱 Mobile-First Features

### Responsive Breakpoints

```css
/* Mobile first (default) */
@media (min-width: 640px) {
  /* sm: tablets */
}
@media (min-width: 768px) {
  /* md: small laptops */
}
@media (min-width: 1024px) {
  /* lg: large screens */
}
```

### Touch-Friendly Controls

- Response buttons: 44px minimum touch target
- Session cards: Full-width tap area
- Swipe gestures for quick actions
- Optimized keyboard for mobile inputs

## 🚀 Deployment Guide

### Vercel Deployment (Recommended)

```bash
# Connect to Vercel
vercel login
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy
vercel --prod
```

### Environment Variables Checklist

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

## 🔍 Troubleshooting

### Common Issues

**"Authentication required" errors**

- Check if user is approved in profiles table
- Verify Supabase client configuration
- Ensure RLS policies are applied

**Session creation fails**

- Verify start_time is in future
- Check location field is not empty
- Ensure user has approved profile

**Comments not loading**

- Check session exists and user has access
- Verify comment thread queries
- Test RLS policies for comments table

**Response changes not saving**

- Check if past cutoff time (T-1 day midnight IST)
- Verify unique constraint on user_id + session_id
- Test response status enum values

### Debug Tools

```bash
# View Supabase logs
supabase logs

# Check database connections
supabase db inspect

# Validate schema
supabase db lint
```

### Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Reference](https://tailwindcss.com/docs)

## 📈 Performance Optimization

### Database Query Optimization

- Indexes on frequently queried columns
- Efficient JOIN operations for responses/comments
- Row Level Security policies for access control

### Frontend Performance

- Server Components for static content
- Client Components only for interactivity
- Optimistic updates for better UX
- Image optimization for user avatars

### Caching Strategy

- Next.js automatic caching for static routes
- Supabase query caching for repeated requests
- Browser caching for static assets

Ready to build awesome badminton coordination features! 🏸
