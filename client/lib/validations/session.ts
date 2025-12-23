import { z } from "zod";

export const createSessionSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  start_time: z.string().datetime("Start time must be a valid datetime"),
  end_time: z.string().datetime("End time must be a valid datetime"),
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
  (data) => {
    const start = new Date(data.start_time);
    const end = new Date(data.end_time);
    return start.toDateString() === end.toDateString();
  },
  {
    message: "Session must start and end on the same day",
    path: ["end_time"],
  }
);

export const updateSessionResponseSchema = z.object({
  session_id: z.string().uuid(),
  status: z.enum(["COMING", "NOT_COMING", "TENTATIVE"]),
});

export const createCommentSchema = z.object({
  session_id: z.string().uuid(),
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
  parent_comment_id: z.string().uuid().optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionResponseInput = z.infer<typeof updateSessionResponseSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;