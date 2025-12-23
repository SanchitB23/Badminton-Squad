import type { Database } from "@/types/database.types";

type ResponseStatus = Database["public"]["Enums"]["response_status"];

export interface PredictionAccuracy {
  userId: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracyPercentage: number;
}

export interface SessionAnalytics {
  sessionId: string;
  totalResponses: number;
  actualAttendance: number;
  accuracyRate: number;
}

/**
 * Calculate accuracy percentage for user predictions
 */
export function calculateUserAccuracy(analytics: {
  predicted_status: ResponseStatus;
  actual_attendance: boolean | null;
}[]): PredictionAccuracy {
  if (analytics.length === 0) {
    return {
      userId: "",
      totalPredictions: 0,
      correctPredictions: 0,
      accuracyPercentage: 0,
    };
  }

  const validPredictions = analytics.filter(a => a.actual_attendance !== null);
  
  if (validPredictions.length === 0) {
    return {
      userId: "",
      totalPredictions: analytics.length,
      correctPredictions: 0,
      accuracyPercentage: 0,
    };
  }

  const correctPredictions = validPredictions.filter(a => {
    const predictedAttending = a.predicted_status === "COMING";
    return predictedAttending === a.actual_attendance;
  });

  return {
    userId: "",
    totalPredictions: validPredictions.length,
    correctPredictions: correctPredictions.length,
    accuracyPercentage: (correctPredictions.length / validPredictions.length) * 100,
  };
}

/**
 * Calculate session-wide analytics
 */
export function calculateSessionAnalytics(
  responses: { status: ResponseStatus }[],
  actualAttendees: number
): SessionAnalytics {
  const comingCount = responses.filter(r => r.status === "COMING").length;
  const totalResponses = responses.length;

  // Calculate accuracy based on how close predictions were to actual attendance
  const accuracyRate = totalResponses > 0 
    ? Math.max(0, 100 - Math.abs(comingCount - actualAttendees) * (100 / totalResponses))
    : 0;

  return {
    sessionId: "",
    totalResponses,
    actualAttendance: actualAttendees,
    accuracyRate,
  };
}

/**
 * Determine attendance status from response status
 */
export function responseStatusToAttendance(status: ResponseStatus): boolean | null {
  switch (status) {
    case "COMING":
      return true;
    case "NOT_COMING":
      return false;
    case "TENTATIVE":
      return null; // Cannot predict attendance for tentative responses
    default:
      return null;
  }
}

/**
 * Calculate reliability score for a user based on past predictions
 */
export function calculateReliabilityScore(analytics: PredictionAccuracy): number {
  if (analytics.totalPredictions < 3) {
    return 50; // Neutral score for users with insufficient data
  }

  return Math.round(analytics.accuracyPercentage);
}