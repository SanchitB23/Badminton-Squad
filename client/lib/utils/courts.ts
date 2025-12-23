/**
 * Calculate the recommended number of badminton courts needed
 * Based on the number of players who marked themselves as COMING
 * 
 * @param comingCount - Number of players who responded COMING
 * @returns Number of courts needed (minimum 1, maximum reasonable limit)
 */
export function calculateCourts(comingCount: number): number {
  if (comingCount === 0) {
    return 0
  }

  // Standard calculation: 4 players per court (2v2 doubles)
  // Use ceiling to ensure enough courts for all players
  const courts = Math.ceil(comingCount / 4)

  // Return at least 1 court if any players are coming
  return Math.max(1, courts)
}

/**
 * Get a descriptive text for court recommendations
 * 
 * @param comingCount - Number of players who responded COMING  
 * @returns Descriptive text about court needs
 */
export function getCourtsDescription(comingCount: number): string {
  const courts = calculateCourts(comingCount)

  if (comingCount === 0) {
    return 'No courts needed'
  }

  if (courts === 1) {
    return `${courts} court needed for ${comingCount} player${comingCount === 1 ? '' : 's'}`
  }

  return `${courts} courts needed for ${comingCount} players`
}

/**
 * Check if we have enough players for a good game
 * 
 * @param comingCount - Number of players who responded COMING
 * @returns Object with status and message
 */
export function getPlayabilityStatus(comingCount: number): {
  status: 'insufficient' | 'minimum' | 'good' | 'excellent'
  message: string
} {
  if (comingCount < 4) {
    return {
      status: 'insufficient',
      message: `Need ${4 - comingCount} more player${4 - comingCount === 1 ? '' : 's'} for doubles`
    }
  } else if (comingCount === 4) {
    return {
      status: 'minimum',
      message: 'Perfect for one doubles game'
    }
  } else if (comingCount <= 8) {
    return {
      status: 'good',
      message: 'Great turnout for multiple games'
    }
  } else {
    return {
      status: 'excellent',
      message: 'Excellent turnout - multiple courts needed'
    }
  }
}