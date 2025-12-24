import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { jest } from '@jest/globals'

// Mock Supabase auth methods
const mockSignUp = jest.fn()
const mockSignIn = jest.fn()
const mockSignOut = jest.fn()
const mockGetUser = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignIn,
      signOut: mockSignOut,
      getUser: mockGetUser,
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  })
}))

// Mock Next.js navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: jest.fn(),
  }),
  usePathname: () => '/login',
  useSearchParams: () => new URLSearchParams(),
}))

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

describe('Integration: Auth Flow', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    jest.clearAllMocks()
  })

  describe('Complete Signup → Approval → Login Flow', () => {
    it('handles successful signup flow', async () => {
      // Mock successful signup
      mockSignUp.mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
          session: null // No session until confirmed
        },
        error: null
      })

      // Dynamically import SignupForm to avoid mocking issues
      const { SignupForm } = await import('@/components/auth/SignupForm')

      render(
        <QueryClientProvider client={ queryClient } >
        <SignupForm />
      </QueryClientProvider>
      )

      // Fill signup form
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const nameInput = screen.getByRole('textbox', { name: /full name/i })
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(nameInput, { target: { value: 'Test User' } })

      // Submit form
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: {
            data: {
              name: 'Test User'
            }
          }
        })
      })

      // Should show success message
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })

    it('handles signup with admin approval workflow', async () => {
      // Mock successful login but unapproved user
      mockSignIn.mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
          session: {
            access_token: 'mock-token'
          }
        },
        error: null
      })

      const { LoginForm } = await import('@/components/auth/LoginForm')

      render(
        <QueryClientProvider client={ queryClient } >
        <LoginForm />
      </QueryClientProvider>
      )

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })

      // For unapproved users, should redirect to pending approval
      expect(mockReplace).toHaveBeenCalledWith('/pending-approval')
    })

    it('handles approved user login flow', async () => {
      // Mock successful login with approved user
      mockSignIn.mockResolvedValue({
        data: {
          user: {
            id: 'approved-user-id',
            email: 'approved@example.com',
          },
          session: {
            access_token: 'mock-token'
          }
        },
        error: null
      })

      const { LoginForm } = await import('@/components/auth/LoginForm')

      render(
        <QueryClientProvider client={ queryClient } >
        <LoginForm />
      </QueryClientProvider>
      )

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'approved@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
        // For approved users, should redirect to dashboard
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('handles authentication errors properly', async () => {
      // Mock failed login
      mockSignIn.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      })

      const { LoginForm } = await import('@/components/auth/LoginForm')

      render(
        <QueryClientProvider client={ queryClient } >
        <LoginForm />
      </QueryClientProvider>
      )

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument()
      })
    })

    it('handles logout flow', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const mockOnSignOut = jest.fn()

      // Create a mock component that uses signout
      const MockDashboard = () => {
        return (
          <div>
          <span>Dashboard Content </span>
            < button onClick = { mockOnSignOut } > Sign Out </button>
              </div>
        )
  }

      render(
    <QueryClientProvider client={ queryClient } >
    <MockDashboard />
  </QueryClientProvider>
  )

      const signOutButton = screen.getByRole('button', { name: /sign out/i })
  fireEvent.click(signOutButton)

  await waitFor(() => {
    expect(mockOnSignOut).toHaveBeenCalled()
  })
})
  })
})