import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { jest } from '@jest/globals'

// Mock Supabase database methods
const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      eq: mockEq,
      single: mockSingle,
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null
      }))
    }
  })
}))

// Mock session hooks
const mockCreateSession = jest.fn()
const mockUpdateResponse = jest.fn()

jest.mock('@/lib/hooks/useSessions', () => ({
  useCreateSession: () => ({
    mutateAsync: mockCreateSession,
    isLoading: false
  }),
  useUpdateSessionResponse: () => ({
    mutateAsync: mockUpdateResponse,
    isLoading: false
  }),
  useSessions: () => ({
    data: [],
    isLoading: false,
    error: null
  })
}))

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

describe('Integration: Sessions Flow', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    jest.clearAllMocks()

    // Default successful database responses
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        single: mockSingle.mockResolvedValue({ data: null, error: null })
      })
    })
  })

  describe('Create Session → Respond → View Counts Flow', () => {
    it('handles complete session creation and response flow', async () => {
      // Mock successful session creation
      mockCreateSession.mockResolvedValue({
        data: {
          id: 'new-session-id',
          title: 'Test Session',
          description: 'Integration test session',
          location: 'Test Court',
          start_time: '2024-12-30T10:00:00+05:30',
          end_time: '2024-12-30T12:00:00+05:30',
          created_by: 'test-user-id',
          created_at: '2024-12-24T10:00:00+05:30'
        }
      })

      // Import components dynamically
      const { CreateSessionDialog } = await import('@/components/CreateSessionDialog')

      render(
        <QueryClientProvider client={ queryClient } >
      <CreateSessionDialog>
      <button>Create Session </button>
      </CreateSessionDialog>
      </QueryClientProvider>
      )

      // Open create session dialog
      fireEvent.click(screen.getByText('Create Session'))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Fill out session form
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const locationInput = screen.getByLabelText(/location/i)
      const startTimeInput = screen.getByLabelText(/start time/i)
      const endTimeInput = screen.getByLabelText(/end time/i)

      fireEvent.change(titleInput, { target: { value: 'Test Session' } })
      fireEvent.change(descriptionInput, { target: { value: 'Integration test session' } })
      fireEvent.change(locationInput, { target: { value: 'Test Court' } })
      fireEvent.change(startTimeInput, { target: { value: '2024-12-30T10:00' } })
      fireEvent.change(endTimeInput, { target: { value: '2024-12-30T12:00' } })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create session/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateSession).toHaveBeenCalledWith({
          title: 'Test Session',
          description: 'Integration test session',
          location: 'Test Court',
          start_time: '2024-12-30T04:30:00.000Z', // Converted to UTC
          end_time: '2024-12-30T06:30:00.000Z'
        })
      })
    })

    it('handles session response updates', async () => {
      // Mock successful response update
      mockUpdateResponse.mockResolvedValue({
        data: {
          session_id: 'test-session-id',
          user_id: 'test-user-id',
          status: 'COMING'
        }
      })

      // Mock session data
      const mockSession = {
        id: 'test-session-id',
        title: 'Test Session',
        location: 'Test Court',
        start_time: '2024-12-30T10:00:00+05:30',
        end_time: '2024-12-30T12:00:00+05:30',
        created_by: {
          id: 'creator-id',
          name: 'Session Creator'
        },
        responses: [],
        response_counts: {
          COMING: 0,
          TENTATIVE: 0,
          NOT_COMING: 0
        },
        recommended_courts: 0,
        user_response: null,
        created_at: '2024-12-24T10:00:00+05:30'
      }

      const { SessionCard } = await import('@/components/session/SessionCard')

      render(
        <QueryClientProvider client={ queryClient } >
      <SessionCard 
            session={ mockSession } 
            currentUserId = "test-user-id"
        />
        </QueryClientProvider>
      )

      // Find and click Coming response button
      const comingButton = screen.getByRole('button', { name: 'Coming' })
      fireEvent.click(comingButton)

      await waitFor(() => {
        expect(mockUpdateResponse).toHaveBeenCalledWith({
          sessionId: 'test-session-id',
          status: 'COMING'
        })
      })
    })

    it('handles response count updates in real-time', async () => {
      // Mock session with existing responses
      const mockSessionWithResponses = {
        id: 'test-session-id',
        title: 'Test Session',
        location: 'Test Court',
        start_time: '2024-12-30T10:00:00+05:30',
        end_time: '2024-12-30T12:00:00+05:30',
        created_by: {
          id: 'creator-id',
          name: 'Session Creator'
        },
        responses: [
          {
            user_id: 'user1',
            status: 'COMING' as const,
            user: { name: 'User One' }
          },
          {
            user_id: 'user2',
            status: 'COMING' as const,
            user: { name: 'User Two' }
          },
          {
            user_id: 'user3',
            status: 'TENTATIVE' as const,
            user: { name: 'User Three' }
          }
        ],
        response_counts: {
          COMING: 2,
          TENTATIVE: 1,
          NOT_COMING: 0
        },
        recommended_courts: 1,
        user_response: null,
        created_at: '2024-12-24T10:00:00+05:30'
      }

      const { SessionCard } = await import('@/components/session/SessionCard')

      render(
        <QueryClientProvider client={ queryClient } >
      <SessionCard 
            session={ mockSessionWithResponses } 
            currentUserId = "test-user-id"
        />
        </QueryClientProvider>
      )

      // Verify response counts are displayed
      expect(screen.getByText('2 Coming')).toBeInTheDocument()
      expect(screen.getByText('1 Maybe')).toBeInTheDocument()
      expect(screen.getByText('0 Not coming')).toBeInTheDocument()

      // Verify court calculation
      expect(screen.getByText('1 court')).toBeInTheDocument()
    })

    it('handles session validation before creation', async () => {
      mockCreateSession.mockRejectedValue(new Error('Session must be at least 2 days in advance'))

      const { CreateSessionDialog } = await import('@/components/CreateSessionDialog')

      render(
        <QueryClientProvider client={ queryClient } >
      <CreateSessionDialog>
      <button>Create Session </button>
      </CreateSessionDialog>
      </QueryClientProvider>
      )

      fireEvent.click(screen.getByText('Create Session'))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Try to create session for tomorrow (should fail 2-day rule)
      const titleInput = screen.getByLabelText(/title/i)
      const locationInput = screen.getByLabelText(/location/i)
      const startTimeInput = screen.getByLabelText(/start time/i)
      const endTimeInput = screen.getByLabelText(/end time/i)

      fireEvent.change(titleInput, { target: { value: 'Invalid Session' } })
      fireEvent.change(locationInput, { target: { value: 'Test Court' } })
      fireEvent.change(startTimeInput, { target: { value: '2024-12-25T10:00' } }) // Tomorrow
      fireEvent.change(endTimeInput, { target: { value: '2024-12-25T12:00' } })

      const submitButton = screen.getByRole('button', { name: /create session/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/session must be at least 2 days in advance/i)).toBeInTheDocument()
      })
    })

    it('handles response deadline enforcement', async () => {
      // Mock session that's past response deadline (T-1 day)
      const mockPastDeadlineSession = {
        id: 'past-deadline-session',
        title: 'Past Deadline Session',
        location: 'Test Court',
        start_time: '2024-12-25T10:00:00+05:30', // Tomorrow (past T-1 deadline)
        end_time: '2024-12-25T12:00:00+05:30',
        created_by: {
          id: 'creator-id',
          name: 'Session Creator'
        },
        responses: [],
        response_counts: {
          COMING: 0,
          TENTATIVE: 0,
          NOT_COMING: 0
        },
        recommended_courts: 0,
        user_response: null,
        created_at: '2024-12-20T10:00:00+05:30'
      }

      const { SessionCard } = await import('@/components/session/SessionCard')

      render(
        <QueryClientProvider client={ queryClient } >
      <SessionCard 
            session={ mockPastDeadlineSession } 
            currentUserId = "test-user-id"
        />
        </QueryClientProvider>
      )

      // Should show deadline passed message
      expect(screen.getByText(/response deadline has passed/i)).toBeInTheDocument()

      // Response buttons should be disabled
      const comingButton = screen.getByRole('button', { name: 'Coming' })
      expect(comingButton).toBeDisabled()
    })
  })
})