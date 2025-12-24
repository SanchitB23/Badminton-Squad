import { updateSessionResponseSchema } from '@/lib/validations/session'

describe('Response Validation', () => {
  describe('updateSessionResponseSchema', () => {
    it('should validate correct response data', () => {
      const validData = {
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'COMING' as const,
      }

      const result = updateSessionResponseSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid UUID for sessionId', () => {
      const result = updateSessionResponseSchema.safeParse({
        sessionId: 'invalid-uuid',
        status: 'COMING',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid session ID')
      }
    })

    it('should accept all valid status values', () => {
      const validStatuses = ['COMING', 'NOT_COMING', 'TENTATIVE']

      validStatuses.forEach(status => {
        const result = updateSessionResponseSchema.safeParse({
          sessionId: '123e4567-e89b-12d3-a456-426614174000',
          status,
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid status values', () => {
      const result = updateSessionResponseSchema.safeParse({
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'INVALID_STATUS',
      })
      expect(result.success).toBe(false)
    })

    it('should require both sessionId and status', () => {
      const resultMissingSessionId = updateSessionResponseSchema.safeParse({
        status: 'COMING',
      })
      expect(resultMissingSessionId.success).toBe(false)

      const resultMissingStatus = updateSessionResponseSchema.safeParse({
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
      })
      expect(resultMissingStatus.success).toBe(false)
    })
  })
})