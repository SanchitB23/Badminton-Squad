import { sessionSchema } from '@/lib/validations/session'

describe('Session Validation', () => {
  const validSessionData = {
    title: 'Test Session',
    description: 'A test badminton session',
    location: 'Test Court',
    start_time: '2025-12-26T18:00:00.000Z', // 2 days from Dec 24
    end_time: '2025-12-26T20:00:00.000Z',
  }

  describe('sessionSchema', () => {
    it('should validate a correct session', () => {
      const result = sessionSchema.safeParse(validSessionData)
      expect(result.success).toBe(true)
    })

    it('should require location', () => {
      const result = sessionSchema.safeParse({
        ...validSessionData,
        location: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Location is required')
      }
    })

    it('should require start_time', () => {
      const result = sessionSchema.safeParse({
        ...validSessionData,
        start_time: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Start time is required')
      }
    })

    it('should require end_time', () => {
      const result = sessionSchema.safeParse({
        ...validSessionData,
        end_time: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('End time is required')
      }
    })

    it('should reject end time before start time', () => {
      const result = sessionSchema.safeParse({
        ...validSessionData,
        start_time: '2025-12-26T20:00:00.000Z',
        end_time: '2025-12-26T18:00:00.000Z',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('End time must be after start time')
      }
    })

    it('should reject sessions not at least 2 days in advance', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const result = sessionSchema.safeParse({
        ...validSessionData,
        start_time: tomorrow.toISOString(),
        end_time: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Sessions must be created at least 2 days in advance')
      }
    })

    it('should accept sessions on the same day within 8 hours', () => {
      // Same day, reasonable duration
      const result = sessionSchema.safeParse({
        ...validSessionData,
        start_time: '2025-12-26T04:30:00.000Z', // 10:00 AM IST
        end_time: '2025-12-26T07:30:00.000Z',   // 1:00 PM IST (3 hours)
      })
      expect(result.success).toBe(true)
    })

    it('should enforce business validation rules correctly', () => {
      // Test a session that violates multiple rules to ensure validation order
      const result = sessionSchema.safeParse({
        ...validSessionData,
        start_time: '2024-12-20T04:30:00.000Z', // Past date (violates 2-day rule)
        end_time: '2024-12-20T03:30:00.000Z',   // End before start
      })
      expect(result.success).toBe(false)
      // Should catch the end-before-start error first
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('End time must be after start time')
      }
    })

    it('should trim location field', () => {
      const result = sessionSchema.safeParse({
        ...validSessionData,
        location: '  Test Court  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.location).toBe('Test Court')
      }
    })

    it('should allow optional title and description', () => {
      const result = sessionSchema.safeParse({
        location: 'Test Court',
        start_time: '2025-12-26T18:00:00.000Z',
        end_time: '2025-12-26T20:00:00.000Z',
      })
      expect(result.success).toBe(true)
    })

    it('should reject title longer than 200 characters', () => {
      const result = sessionSchema.safeParse({
        ...validSessionData,
        title: 'a'.repeat(201),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Title cannot exceed 200 characters')
      }
    })

    it('should reject description longer than 1000 characters', () => {
      const result = sessionSchema.safeParse({
        ...validSessionData,
        description: 'a'.repeat(1001),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Description cannot exceed 1000 characters')
      }
    })
  })
})