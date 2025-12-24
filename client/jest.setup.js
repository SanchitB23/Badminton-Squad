import "@testing-library/jest-dom";

// Set environment variables for Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "";
  },
  redirect: jest.fn(),
}));

// Mock date-fns
jest.mock("date-fns", () => ({
  format: jest.fn((date, pattern) => {
    const d = new Date(date);
    // Handle specific patterns used in SessionCard
    if (pattern === "MMM d") return "Dec 24";
    if (pattern === "EEE") return "Tue";
    if (pattern === "EEE, MMM d") return "Tue, Dec 24";
    if (pattern === "h:mm a")
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    return `formatted-${pattern}`;
  }),
  formatDistanceToNow: jest.fn(() => "2 minutes ago"),
  parseISO: jest.fn((date) => new Date(date)),
  addDays: jest.fn(
    (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
  ),
  isBefore: jest.fn((date1, date2) => new Date(date1) < new Date(date2)),
  isAfter: jest.fn((date1, date2) => new Date(date1) > new Date(date2)),
  startOfDay: jest.fn((date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }),
}));

// Suppress console errors in tests unless needed
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
