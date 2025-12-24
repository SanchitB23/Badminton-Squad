import { z } from "zod";

// Helper function to check if a date is at least 2 days in advance (IST)
const isAtLeast2DaysInAdvance = (dateString: string): boolean => {
  const inputDate = new Date(dateString);
  const now = new Date();
  
  // Convert to IST for comparison
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const nowIST = new Date(now.getTime() + istOffset);
  const inputIST = new Date(inputDate.getTime() + istOffset);
  
  // Calculate 2 days from now at 00:00 IST (start of the day)
  const twoDaysFromNow = new Date(nowIST);
  twoDaysFromNow.setDate(nowIST.getDate() + 2);
  twoDaysFromNow.setHours(0, 0, 0, 0);
  
  return inputIST >= twoDaysFromNow;
};

// Helper function to check if two dates are on the same day in IST
const isSameDay = (date1String: string, date2String: string): boolean => {
  const date1 = new Date(date1String);
  const date2 = new Date(date2String);
  
  // Convert to IST
  const istOffset = 5.5 * 60 * 60 * 1000;
  const date1IST = new Date(date1.getTime() + istOffset);
  const date2IST = new Date(date2.getTime() + istOffset);
  
  return date1IST.toDateString() === date2IST.toDateString();
};

export const sessionSchema = z.object({
  title: z.string().max(200, "Title cannot exceed 200 characters").optional(),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
  location: z
    .string()
    .min(1, "Location is required")
    .max(255, "Location cannot exceed 255 characters")
    .trim(),
  start_time: z
    .string()
    .min(1, "Start time is required")
    .refine((date) => !isNaN(Date.parse(date)), "Start time must be a valid date"),
  end_time: z
    .string()
    .min(1, "End time is required")
    .refine((date) => !isNaN(Date.parse(date)), "End time must be a valid date"),
}).refine(
  (data) => {
    const start = new Date(data.start_time);
    const end = new Date(data.end_time);
    return end > start;
  },
  {
    message: "End time must be after start time",
    path: ["end_time"],
  }
).refine(
  (data) => isSameDay(data.start_time, data.end_time),
  {
    message: "Session must start and end on the same day (IST)",
    path: ["end_time"],
  }
).refine(
  (data) => isAtLeast2DaysInAdvance(data.start_time),
  {
    message: "Sessions must be created at least 2 days in advance",
    path: ["start_time"],
  }
).refine(
  (data) => {
    const start = new Date(data.start_time);
    const end = new Date(data.end_time);
    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    return durationHours <= 8; // Max 8 hours per session
  },
  {
    message: "Session duration cannot exceed 8 hours",
    path: ["end_time"],
  }
);

// Legacy schema for backward compatibility
export const createSessionSchema = sessionSchema;

export const updateSessionResponseSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  status: z.enum(["COMING", "NOT_COMING", "TENTATIVE"]),
});

export const createCommentSchema = z.object({
  session_id: z.string().uuid("Invalid session ID"),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment cannot exceed 1000 characters")
    .trim(),
  parent_comment_id: z.string().uuid("Invalid parent comment ID").optional(),
});

export type SessionFormData = z.infer<typeof sessionSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionResponseInput = z.infer<typeof updateSessionResponseSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;