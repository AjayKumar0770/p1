import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import StockDetails from "../components/StockDetails";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockDetails = {
  symbol: "AAPL",
  name: "Apple Inc.",
  sector: "Technology",
  industry: "Consumer Electronics",
  ratios: {
    peRatio: 28.5,
    pbRatio: 35.2,
    dividendYield: 0.65,
    debtToEquity: 1.5,
    roe: 30.2,
    roce: 32.1,
    eps: 5.25,
    revenueGrowth: 8.5,
    profitMargin: 25.8,
    currentRatio: 1.2,
    quickRatio: 1.0,
    assetTurnover: 0.8,
    beta: 1.20,
  },
  incomeStatement: [
    { year: "2023", revenue: 383285000000, grossProfit: 169148000000, netIncome: 96995000000 }
  ],
  balanceSheet: [
    { year: "2023", totalAssets: 352583000000, totalLiabilities: 290437000000, equity: 62146000000 }
  ]
};

// Mock fetch
global.fetch = vi.fn();

let queryClient: QueryClient;

describe("StockDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });

  it("renders loading state initially", () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));
    
    render(
      <QueryClientProvider client={queryClient}>
        <StockDetails symbol="AAPL" />
      </QueryClientProvider>
    );

    expect(screen.getByText("Retrieving corporate ledger...")).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });
    
    render(
      <QueryClientProvider client={queryClient}>
        <StockDetails symbol="INVALID" />
      </QueryClientProvider>
    );

    expect(await screen.findByText("Ledger data for INVALID is unavailable.")).toBeInTheDocument();
  });

  it("renders stock details correctly when data is loaded", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDetails
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <StockDetails symbol="AAPL" />
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Apple Inc.*Financial Ratios/i)).toBeInTheDocument();
    expect(screen.getByText("28.50")).toBeInTheDocument(); // PE Ratio
    expect(screen.getByText("$383.29B")).toBeInTheDocument(); // Formatted Revenue
    expect(screen.getAllByText("2023").length).toBeGreaterThan(0); // Year
  });
});
