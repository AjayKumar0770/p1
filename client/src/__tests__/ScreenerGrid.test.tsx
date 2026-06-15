import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScreenerGrid } from "../client-ui";
import { useScreenerStore } from "../client-core";

// Mock Zustand store
vi.mock("../client-core", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useScreenerStore: vi.fn(),
  };
});

// Mock Virtualizer
vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [
      { index: 0, size: 50, start: 0, key: "row-0" }
    ],
    getTotalSize: () => 50,
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
    rsi14: 50,
    sector: "Technology"
  }
];

describe("ScreenerGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useScreenerStore as any).mockImplementation((selector: any) => {
      const state = {
        prices: {
          "AAPL": { price: 152, changePercent: 2.0, volume: 1500000 }
        },
        columnVisibility: {
          symbol: true,
          companyName: true,
          sector: true,
          price: true,
          changePercent: true,
          marketCap: true,
          peRatio: true,
          pbRatio: true,
          dividendYield: true,
          debtToEquity: true,
          roe: true,
          rsi14: true
        },
        sorting: [],
        setSorting: vi.fn(),
      };
      return typeof selector === 'function' ? selector(state) : state;
    });
  });

  it("renders correctly with virtualized rows", async () => {
    render(<ScreenerGrid stocks={mockStocks as any} />);
    
    // Header check
    expect(screen.getByText("Symbol")).toBeInTheDocument();
    
    // Live price should reflect the mock prices state (152) not the base stock price (150)
    expect(screen.getByText(/152\.00/)).toBeInTheDocument();
    
    // Check change cell
    expect(screen.getByText("+2.00%")).toBeInTheDocument();

    // Click column headers to test sorting branches
    const user = userEvent.setup();
    const symbolHeader = screen.getByText("Symbol");
    await user.click(symbolHeader);
    await user.click(symbolHeader);

    const priceHeader = screen.getByText("Price");
    await user.click(priceHeader);
  });
});
