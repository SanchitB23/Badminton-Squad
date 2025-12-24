import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionCard } from "@/components/session/SessionCard";

// Define the interface based on SessionCard props
interface Session {
  id: string;
  title?: string;
  description?: string;
  location: string;
  start_time: string;
  end_time: string;
  created_by: {
    id: string;
    name?: string;
  };
  responses: Array<{
    user_id: string;
    status: "COMING" | "NOT_COMING" | "TENTATIVE";
    user: {
      name: string;
    };
  }>;
  response_counts: {
    COMING: number;
    TENTATIVE: number;
    NOT_COMING: number;
  };
  recommended_courts: number;
  user_response?: "COMING" | "NOT_COMING" | "TENTATIVE" | null;
  created_at: string;
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

// Mock date to ensure consistent test results
jest.useFakeTimers();
jest.setSystemTime(new Date("2024-12-22T10:00:00.000Z")); // Saturday 3:30 PM IST

const mockSession: Session = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  title: "Weekly Badminton Session",
  description: "Regular weekend session",
  location: "Sports Complex Court 1",
  start_time: "2024-12-24T10:30:00+05:30", // Future date in IST
  end_time: "2024-12-24T12:30:00+05:30",
  created_by: {
    id: "user-123",
    name: "John Doe",
  },
  created_at: "2024-12-22T04:30:00.000Z",
  response_counts: {
    COMING: 2,
    NOT_COMING: 1,
    TENTATIVE: 1,
  },
  recommended_courts: 1,
  user_response: "COMING" as const,
  responses: [
    {
      user_id: "user-1",
      status: "COMING" as const,
      user: { name: "Alice Smith" },
    },
    {
      user_id: "user-2",
      status: "COMING" as const,
      user: { name: "Bob Johnson" },
    },
    {
      user_id: "user-3",
      status: "NOT_COMING" as const,
      user: { name: "Charlie Brown" },
    },
    {
      user_id: "user-4",
      status: "TENTATIVE" as const,
      user: { name: "Diana Prince" },
    },
  ],
};

const mockProps = {
  session: mockSession,
  currentUserId: "current-user",
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe("SessionCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("Basic Rendering", () => {
    it("renders session title and details", () => {
      renderWithQueryClient(<SessionCard {...mockProps} />);

      expect(screen.getByText("Weekly Badminton Session")).toBeInTheDocument();
      expect(screen.getByText("Regular weekend session")).toBeInTheDocument();
      expect(screen.getByText("Sports Complex Court 1")).toBeInTheDocument();
      expect(screen.getByText(/Created by John Doe/)).toBeInTheDocument();
    });

    it("renders session timing correctly", () => {
      renderWithQueryClient(<SessionCard {...mockProps} />);

      // Check if time format is displayed correctly
      expect(screen.getByText(/10:30 AM - 12:30 PM/)).toBeInTheDocument();
    });

    it("renders date in header", () => {
      renderWithQueryClient(<SessionCard {...mockProps} />);

      expect(screen.getByText("Dec 24")).toBeInTheDocument();
      expect(screen.getByText("Tue")).toBeInTheDocument();
    });
  });

  describe("Response Counts", () => {
    it("displays response counts correctly", () => {
      renderWithQueryClient(<SessionCard {...mockProps} />);

      expect(screen.getByText("2 Coming")).toBeInTheDocument();
      expect(screen.getByText("1 Maybe")).toBeInTheDocument();
      expect(screen.getByText("1 Not coming")).toBeInTheDocument();
    });

    it("shows current user response when they have responded", () => {
      renderWithQueryClient(<SessionCard {...mockProps} />);

      expect(screen.getByText("Your response:")).toBeInTheDocument();
      const responseSpan = screen.getByText(
        (content, element) =>
          element?.tagName.toLowerCase() === "span" &&
          element?.className.includes("text-green-600") &&
          content === "Coming"
      );
      expect(responseSpan).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles session with no responses", () => {
      const sessionNoResponses = {
        ...mockSession,
        responses: [],
        response_counts: { COMING: 0, NOT_COMING: 0, TENTATIVE: 0 },
      };

      renderWithQueryClient(
        <SessionCard {...mockProps} session={sessionNoResponses} />
      );

      expect(screen.getByText("0 Coming")).toBeInTheDocument();
      expect(screen.getByText("0 Maybe")).toBeInTheDocument();
      expect(screen.getByText("0 Not coming")).toBeInTheDocument();
    });

    it("handles session without description", () => {
      const sessionNoDescription = {
        ...mockSession,
        description: undefined,
      };

      renderWithQueryClient(
        <SessionCard {...mockProps} session={sessionNoDescription} />
      );

      expect(
        screen.queryByText("Regular weekend session")
      ).not.toBeInTheDocument();
    });

    it("shows edit/delete options for session creator", () => {
      const creatorProps = {
        ...mockProps,
        currentUserId: "user-123", // Same as created_by id
      };

      renderWithQueryClient(<SessionCard {...creatorProps} />);

      expect(
        screen.getByRole("button", { name: "Open menu" })
      ).toBeInTheDocument();
    });

    it("hides edit/delete options for non-creators", () => {
      const nonCreatorProps = {
        ...mockProps,
        currentUserId: "different-user",
      };

      renderWithQueryClient(<SessionCard {...nonCreatorProps} />);

      expect(
        screen.queryByRole("button", { name: "Open menu" })
      ).not.toBeInTheDocument();
    });
  });
});
