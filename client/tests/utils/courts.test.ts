import { calculateCourts, getPlayabilityStatus } from '@/lib/utils/courts'

describe('Courts Calculation Logic', () => {
  describe('calculateCourts', () => {
    it('should calculate courts based on ceiling of players divided by 4', () => {
      expect(calculateCourts(0)).toBe(0)
      expect(calculateCourts(1)).toBe(1)
      expect(calculateCourts(4)).toBe(1)
      expect(calculateCourts(5)).toBe(2)
      expect(calculateCourts(8)).toBe(2)
      expect(calculateCourts(9)).toBe(3)
      expect(calculateCourts(12)).toBe(3)
    })

    it('should handle edge cases', () => {
      expect(calculateCourts(-1)).toBe(1) // Negative inputs should return at least 1 court
      expect(calculateCourts(100)).toBe(25) // 100 players = 25 courts
    })
  })

  describe('getPlayabilityStatus', () => {
    it('should return insufficient status for less than 4 players', () => {
      const status = getPlayabilityStatus(2)
      expect(status.status).toBe('insufficient')
      expect(status.message).toContain('Need 2 more players for doubles')
    })

    it('should return minimum status for exactly 4 players', () => {
      const status = getPlayabilityStatus(4)
      expect(status.status).toBe('minimum')
      expect(status.message).toContain('Perfect for one doubles game')
    })

    it('should return good status for 5-8 players', () => {
      const status = getPlayabilityStatus(6)
      expect(status.status).toBe('good')
      expect(status.message).toContain('Great turnout for multiple games')
    })

    it('should return excellent status for 8+ players', () => {
      const status = getPlayabilityStatus(10)
      expect(status.status).toBe('excellent')
      expect(status.message).toContain('Excellent turnout')
    })

    it('should handle edge cases', () => {
      expect(getPlayabilityStatus(0).status).toBe('insufficient')
      expect(getPlayabilityStatus(-1).status).toBe('insufficient')
    })
  })
})