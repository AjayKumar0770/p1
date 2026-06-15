import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "../client-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Virtualizer so it renders all items for testing
vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getVirtualItems: () => Array.from({ length: count }).map((_, i) => ({ index: i, size: 50, start: i * 50, key: `row-${i}` })),
    getTotalSize: () => count * 50,
    measureElement: vi.fn(),
    scrollToIndex: vi.fn()
  })
}));

const mockStocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 150,
    changePercent: 1.5,
    volume: 1000000,
    marketCap: 2500000000000,
    peRatio: 25,
    pbRatio: 10,
    dividendYield: 1.5,
    roe: 30,
    debtToEquity: 1.2,
    rsi14: 55,
    sector: "Technology"
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase",
    price: 130,
    changePercent: -1.5,
    volume: 800000,
    marketCap: 400000000000,
    peRatio: 10.5,
    pbRatio: 1.5,
    dividendYield: 3.5,
    roe: 12,
    debtToEquity: 1.5,
    rsi14: 45,
    sector: "Financials"
  }
];

let queryClient: QueryClient;

describe("Filter to Grid Workflow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockStocks
    });
  });

  it("filters the grid based on AST input", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    );

    // Wait for stocks to load
    await waitFor(() => {
      expect(screen.getByText("AAPL")).toBeInTheDocument();
      expect(screen.getByText("JPM")).toBeInTheDocument();
    });

    // Type into the filter
    const input = screen.getByLabelText("Filter stocks using custom expressions");
    fireEvent.change(input, { target: { value: "peRatio < 15" } });

    // JPM should remain, AAPL should disappear
    await waitFor(() => {
      expect(screen.queryByText("AAPL")).not.toBeInTheDocument();
      expect(screen.getByText("JPM")).toBeInTheDocument();
    });

    // Clear filter
    const clearBtn = screen.getByText("Reset All Filters");
    fireEvent.click(clearBtn);

    // AAPL should return
    await waitFor(() => {
      expect(screen.getByText("AAPL")).toBeInTheDocument();
    });
  });
});
