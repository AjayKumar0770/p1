import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StockChart from "../components/StockChart";

// Mock lightweight-charts
vi.mock("lightweight-charts", () => ({
  createChart: vi.fn(() => ({
    addSeries: vi.fn(() => ({
      setData: vi.fn(),
      priceToCoordinate: vi.fn(() => 100),
    })),
    removeSeries: vi.fn(),
    timeScale: vi.fn(() => ({
      subscribeVisibleLogicalRangeChange: vi.fn(),
      unsubscribeVisibleLogicalRangeChange: vi.fn(),
      setVisibleLogicalRange: vi.fn(),
      getVisibleLogicalRange: vi.fn(() => ({ from: 0, to: 10 })),
    })),
    resize: vi.fn(),
    remove: vi.fn(),
  })),
  CandlestickSeries: "CandlestickSeries",
  LineSeries: "LineSeries",
}));

// Mock ResizeObserver is already in setup.ts

describe("StockChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        { time: 1672531200, open: 150, high: 155, low: 148, close: 152, volume: 1000 },
        { time: 1672617600, open: 152, high: 160, low: 151, close: 158, volume: 1200 },
      ])
    });
  });

  it("renders chart containers after loading and toggles indicators", async () => {
    // Resolve immediately with enough data for indicators
    const mockData = Array.from({ length: 100 }, (_, i) => ({
      time: `2023-01-${(i % 28 + 1).toString().padStart(2, '0')}`,
      open: 150, high: 155, low: 148, close: 152, volume: 1000000
    }));

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    const user = userEvent.setup();
    render(<StockChart symbol="AAPL" />);
    
    // Wait for the buttons to appear
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Hide SMA" })).toBeInTheDocument();
    });

    // Toggle SMA
    const smaBtn = screen.getByRole("button", { name: "Hide SMA" });
    await user.click(smaBtn);
    expect(screen.getByRole("button", { name: "Show SMA" })).toBeInTheDocument();

    // Toggle EMA
    const emaBtn = screen.getByRole("button", { name: "Hide EMA" });
    await user.click(emaBtn);
    expect(screen.getByRole("button", { name: "Show EMA" })).toBeInTheDocument();

    // Toggle BB
    const bbBtn = screen.getByRole("button", { name: "Hide Bollinger Bands" });
    await user.click(bbBtn);
    expect(screen.getByRole("button", { name: "Show Bollinger Bands" })).toBeInTheDocument();

    // Toggle Volume Profile
    const volBtn = screen.getByRole("button", { name: "Hide Volume Profile" });
    await user.click(volBtn);
    expect(screen.getByRole("button", { name: "Show Volume Profile" })).toBeInTheDocument();

    // Toggle Tabular View
    const tabBtn = screen.getByRole("button", { name: "Toggle screen reader accessible historical table" });
    await user.click(tabBtn);
  });

  it("renders loading state", async () => {
    // delay resolution to test loading state
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    render(<StockChart symbol="AAPL" />);
    await waitFor(() => {
      expect(screen.getByText("Recompiling Indicator Channels...")).toBeInTheDocument();
    });
  });

  it("renders chart containers after loading", async () => {
    render(<StockChart symbol="AAPL" />);
    
    // Check if the tabular view toggle exists (it implies the chart loaded)
    expect(await screen.findByText("Tabular View (Accessible)")).toBeInTheDocument();
    
    // Check if the control buttons are there
    expect(screen.getByLabelText("Hide SMA")).toBeInTheDocument();
  });
});
