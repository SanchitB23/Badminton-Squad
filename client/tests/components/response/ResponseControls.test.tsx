import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ResponseControls } from "@/components/response/ResponseControls";

// Mock the useUpdateSessionResponse hook
const mockMutateAsync = jest.fn();
const mockUpdateResponse = {
  mutateAsync: mockMutateAsync,
  isLoading: false,
  error: null,
};

jest.mock("@/lib/hooks/useSessions", () => ({
  useUpdateSessionResponse: () => mockUpdateResponse,
}));

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

const mockProps = {
  sessionId: "123e4567-e89b-12d3-a456-426614174000",
  currentResponse: null as "COMING" | "NOT_COMING" | "TENTATIVE" | null,
  disabled: false,
};

describe("ResponseControls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync.mockResolvedValue({});
  });

  describe("Basic Rendering", () => {
    it("renders all response buttons", () => {
      renderWithQueryClient(<ResponseControls {...mockProps} />);

      expect(
        screen.getByRole("button", { name: "Coming" })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Maybe" })).toBeInTheDocument();
      // Note: The actual button text includes both "Can't make it" and "No"
      expect(
        screen.getByRole("button", { name: /can't make it/i })
      ).toBeInTheDocument();
    });

    it("highlights current response button", () => {
      const propsWithResponse = {
        ...mockProps,
        currentResponse: "COMING" as const,
      };

      renderWithQueryClient(<ResponseControls {...propsWithResponse} />);

      const comingButton = screen.getByRole("button", { name: "Coming" });
      expect(comingButton).toHaveClass("bg-primary");
    });
  });

  describe("User Interactions", () => {
    it("calls mutation when Coming button is clicked", async () => {
      renderWithQueryClient(<ResponseControls {...mockProps} />);

      const comingButton = screen.getByRole("button", { name: "Coming" });
      fireEvent.click(comingButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          sessionId: mockProps.sessionId,
          status: "COMING",
        });
      });
    });

    it("calls mutation when Maybe button is clicked", async () => {
      renderWithQueryClient(<ResponseControls {...mockProps} />);

      const maybeButton = screen.getByRole("button", { name: "Maybe" });
      fireEvent.click(maybeButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          sessionId: mockProps.sessionId,
          status: "TENTATIVE",
        });
      });
    });

    it("calls mutation when Not Coming button is clicked", async () => {
      renderWithQueryClient(<ResponseControls {...mockProps} />);

      const notComingButton = screen.getByRole("button", {
        name: /can't make it/i,
      });
      fireEvent.click(notComingButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          sessionId: mockProps.sessionId,
          status: "NOT_COMING",
        });
      });
    });
  });

  describe("Disabled State", () => {
    it("disables all buttons when disabled prop is true", () => {
      const disabledProps = { ...mockProps, disabled: true };

      renderWithQueryClient(<ResponseControls {...disabledProps} />);

      const comingButton = screen.getByRole("button", { name: "Coming" });
      const maybeButton = screen.getByRole("button", { name: "Maybe" });
      const notComingButton = screen.getByRole("button", {
        name: /can't make it/i,
      });

      expect(comingButton).toBeDisabled();
      expect(maybeButton).toBeDisabled();
      expect(notComingButton).toBeDisabled();
    });
  });
});
