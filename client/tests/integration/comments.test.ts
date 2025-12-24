import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { jest } from '@jest/globals'

// Mock Supabase database methods
const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()
const mockOrder = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      single: mockSingle,
      order: mockOrder,
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id', app_metadata: { role: 'normal_user' } } },
        error: null
      }))
    }
  })
}))

// Mock comment hooks
const mockCreateComment = jest.fn()
const mockUpdateComment = jest.fn()
const mockDeleteComment = jest.fn()

jest.mock('@/lib/hooks/useComments', () => ({
  useCreateComment: () => ({
    mutateAsync: mockCreateComment,
    isLoading: false
  }),
  useUpdateComment: () => ({
    mutateAsync: mockUpdateComment,
    isLoading: false
  }),
  useDeleteComment: () => ({
    mutateAsync: mockDeleteComment,
    isLoading: false
  }),
  useComments: () => ({
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

describe('Integration: Comments Flow', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    jest.clearAllMocks()

    // Default successful database responses
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: [], error: null })
        })
      })
    })
  })

  describe('Comment Posting → Threading → Moderation Flow', () => {
    const mockSession = {
      id: 'test-session-id',
      title: 'Test Session',
      location: 'Test Court',
      start_time: '2024-12-30T10:00:00+05:30',
      end_time: '2024-12-30T12:00:00+05:30'
    }

    it('handles comment posting and threading flow', async () => {
      // Mock successful comment creation
      mockCreateComment.mockResolvedValue({
        data: {
          id: 'new-comment-id',
          session_id: 'test-session-id',
          user_id: 'test-user-id',
          content: 'Test comment content',
          parent_comment_id: null,
          created_at: '2024-12-24T10:00:00+05:30'
        }
      })

      const { CommentSection } = await import('@/components/comments/CommentSection')

      render(
        <QueryClientProvider client={ queryClient } >
      <CommentSection 
            sessionId="test-session-id"
            currentUserId = "test-user-id"
        />
        </QueryClientProvider>
      )

      // Find comment input
      const commentInput = screen.getByPlaceholderText(/add a comment/i)
      fireEvent.change(commentInput, { target: { value: 'Test comment content' } })

      // Submit comment
      const submitButton = screen.getByRole('button', { name: /post comment/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateComment).toHaveBeenCalledWith({
          sessionId: 'test-session-id',
          content: 'Test comment content',
          parentCommentId: null
        })
      })

      // Input should be cleared after submission
      expect(commentInput.value).toBe('')
    })

    it('handles reply threading', async () => {
      const mockComments = [
        {
          id: 'parent-comment-id',
          session_id: 'test-session-id',
          user_id: 'other-user-id',
          content: 'Parent comment',
          parent_comment_id: null,
          created_at: '2024-12-24T09:00:00+05:30',
          user: {
            id: 'other-user-id',
            name: 'Other User'
          },
          replies: []
        }
      ]

      // Mock reply creation
      mockCreateComment.mockResolvedValue({
        data: {
          id: 'reply-comment-id',
          session_id: 'test-session-id',
          user_id: 'test-user-id',
          content: 'Test reply content',
          parent_comment_id: 'parent-comment-id',
          created_at: '2024-12-24T10:00:00+05:30'
        }
      })

      const { CommentSection } = await import('@/components/comments/CommentSection')

      render(
        <QueryClientProvider client={ queryClient } >
      <CommentSection 
            sessionId="test-session-id"
            currentUserId = "test-user-id"
            comments = { mockComments }
        />
        </QueryClientProvider>
      )

      // Find and click reply button on parent comment
      const replyButton = screen.getByRole('button', { name: /reply/i })
      fireEvent.click(replyButton)

      // Reply input should appear
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/reply to other user/i)).toBeInTheDocument()
      })

      const replyInput = screen.getByPlaceholderText(/reply to other user/i)
      fireEvent.change(replyInput, { target: { value: 'Test reply content' } })

      // Submit reply
      const submitReplyButton = screen.getByRole('button', { name: /post reply/i })
      fireEvent.click(submitReplyButton)

      await waitFor(() => {
        expect(mockCreateComment).toHaveBeenCalledWith({
          sessionId: 'test-session-id',
          content: 'Test reply content',
          parentCommentId: 'parent-comment-id'
        })
      })
    })

    it('handles comment moderation for own comments', async () => {
      const mockOwnComment = {
        id: 'own-comment-id',
        session_id: 'test-session-id',
        user_id: 'test-user-id',
        content: 'My own comment',
        parent_comment_id: null,
        created_at: '2024-12-24T09:00:00+05:30',
        user: {
          id: 'test-user-id',
          name: 'Test User'
        },
        replies: []
      }

      // Mock successful comment update
      mockUpdateComment.mockResolvedValue({
        data: {
          ...mockOwnComment,
          content: 'Updated comment content'
        }
      })

      const { CommentCard } = await import('@/components/comments/CommentCard')

      render(
        <QueryClientProvider client={ queryClient } >
      <CommentCard 
            comment={ mockOwnComment }
            currentUserId = "test-user-id"
            sessionId = "test-session-id"
        />
        </QueryClientProvider>
      )

      // Should show edit/delete options for own comment
      const editButton = screen.getByRole('button', { name: /edit/i })
      expect(editButton).toBeInTheDocument()

      // Click edit button
      fireEvent.click(editButton)

      // Edit form should appear
      await waitFor(() => {
        expect(screen.getByDisplayValue('My own comment')).toBeInTheDocument()
      })

      const editInput = screen.getByDisplayValue('My own comment')
      fireEvent.change(editInput, { target: { value: 'Updated comment content' } })

      // Save changes
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockUpdateComment).toHaveBeenCalledWith({
          commentId: 'own-comment-id',
          content: 'Updated comment content'
        })
      })
    })

    it('handles comment deletion with confirmation', async () => {
      const mockOwnComment = {
        id: 'delete-comment-id',
        session_id: 'test-session-id',
        user_id: 'test-user-id',
        content: 'Comment to delete',
        parent_comment_id: null,
        created_at: '2024-12-24T09:00:00+05:30',
        user: {
          id: 'test-user-id',
          name: 'Test User'
        },
        replies: []
      }

      // Mock successful comment deletion
      mockDeleteComment.mockResolvedValue({ data: null, error: null })

      const { CommentCard } = await import('@/components/comments/CommentCard')

      render(
        <QueryClientProvider client={ queryClient } >
      <CommentCard 
            comment={ mockOwnComment }
            currentUserId = "test-user-id"
            sessionId = "test-session-id"
        />
        </QueryClientProvider>
      )

      // Find delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByText(/are you sure you want to delete this comment/i)).toBeInTheDocument()
      })

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /delete comment/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockDeleteComment).toHaveBeenCalledWith('delete-comment-id')
      })
    })

    it('handles admin comment moderation', async () => {
      // Mock admin user
      const mockAdminAuth = {
        data: {
          user: {
            id: 'admin-user-id',
            app_metadata: { role: 'super_admin' }
          }
        },
        error: null
      }

      jest.mocked(require('@/lib/supabase/client').createClient().auth.getUser)
        .mockResolvedValue(mockAdminAuth)

      const mockOtherUserComment = {
        id: 'other-user-comment-id',
        session_id: 'test-session-id',
        user_id: 'other-user-id',
        content: 'Other user comment',
        parent_comment_id: null,
        created_at: '2024-12-24T09:00:00+05:30',
        user: {
          id: 'other-user-id',
          name: 'Other User'
        },
        replies: []
      }

      const { CommentCard } = await import('@/components/comments/CommentCard')

      render(
        <QueryClientProvider client={ queryClient } >
      <CommentCard 
            comment={ mockOtherUserComment }
            currentUserId = "admin-user-id"
            sessionId = "test-session-id"
        />
        </QueryClientProvider>
      )

      // Admin should see moderation options for other users' comments
      expect(screen.getByRole('button', { name: /moderate/i })).toBeInTheDocument()
    })

    it('handles comment validation and error states', async () => {
      // Mock comment creation failure
      mockCreateComment.mockRejectedValue(new Error('Comment is too long'))

      const { CommentSection } = await import('@/components/comments/CommentSection')

      render(
        <QueryClientProvider client={ queryClient } >
      <CommentSection 
            sessionId="test-session-id"
            currentUserId = "test-user-id"
        />
        </QueryClientProvider>
      )

      // Try to post very long comment
      const commentInput = screen.getByPlaceholderText(/add a comment/i)
      const longComment = 'x'.repeat(1001) // Exceed max length
      fireEvent.change(commentInput, { target: { value: longComment } })

      const submitButton = screen.getByRole('button', { name: /post comment/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/comment is too long/i)).toBeInTheDocument()
      })

      // Input should retain the content for user to fix
      expect(commentInput.value).toBe(longComment)
    })

    it('handles nested threading depth limits', async () => {
      const deeplyNestedComment = {
        id: 'level-5-comment',
        session_id: 'test-session-id',
        user_id: 'other-user-id',
        content: 'Level 5 nested comment',
        parent_comment_id: 'level-4-comment-id',
        created_at: '2024-12-24T09:00:00+05:30',
        user: {
          id: 'other-user-id',
          name: 'Other User'
        },
        replies: [],
        depth: 5
      }

      const { CommentCard } = await import('@/components/comments/CommentCard')

      render(
        <QueryClientProvider client={ queryClient } >
      <CommentCard 
            comment={ deeplyNestedComment }
            currentUserId = "test-user-id"
            sessionId = "test-session-id"
        />
        </QueryClientProvider>
      )

      // At max depth (5), reply button should not be available
      expect(screen.queryByRole('button', { name: /reply/i })).not.toBeInTheDocument()

      // Should show message about max depth
      expect(screen.getByText(/maximum reply depth reached/i)).toBeInTheDocument()
    })

    it('handles real-time comment updates', async () => {
      const initialComments = [
        {
          id: 'comment-1',
          session_id: 'test-session-id',
          user_id: 'other-user-id',
          content: 'First comment',
          parent_comment_id: null,
          created_at: '2024-12-24T09:00:00+05:30',
          user: {
            id: 'other-user-id',
            name: 'Other User'
          },
          replies: []
        }
      ]

      const { CommentSection } = await import('@/components/comments/CommentSection')

      const { rerender } = render(
        <QueryClientProvider client={ queryClient } >
      <CommentSection 
            sessionId="test-session-id"
            currentUserId = "test-user-id"
            comments = { initialComments }
        />
        </QueryClientProvider>
      )

      expect(screen.getByText('First comment')).toBeInTheDocument()

      // Simulate real-time update with new comment
      const updatedComments = [
        ...initialComments,
        {
          id: 'comment-2',
          session_id: 'test-session-id',
          user_id: 'another-user-id',
          content: 'New real-time comment',
          parent_comment_id: null,
          created_at: '2024-12-24T10:00:00+05:30',
          user: {
            id: 'another-user-id',
            name: 'Another User'
          },
          replies: []
        }
      ]

      rerender(
        <QueryClientProvider client={ queryClient } >
      <CommentSection 
            sessionId="test-session-id"
            currentUserId = "test-user-id"
            comments = { updatedComments }
        />
        </QueryClientProvider>
      )

      // New comment should appear
      expect(screen.getByText('New real-time comment')).toBeInTheDocument()
      expect(screen.getByText('Another User')).toBeInTheDocument()
    })
  })
})