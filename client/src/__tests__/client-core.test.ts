import { describe, it, expect, beforeEach, vi } from "vitest";
import { useScreenerStore } from "../client-core";

describe("client-core store", () => {
  beforeEach(() => {
    // Reset store state
    useScreenerStore.setState({
      prices: {},
      fundamentals: {},
      stocks: [],
      stocksError: null,
      filterError: null,
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
      sorting: []
    });
    vi.clearAllMocks();
  });

  it("updates live prices", () => {
    const { updatePrices } = useScreenerStore.getState();
    updatePrices([{ symbol: "AAPL", price: 155, change: 5, changePercent: 2.5, volume: 1000000 }]);
    
    const { prices } = useScreenerStore.getState();
    expect(prices["AAPL"]).toMatchObject({ price: 155, changePercent: 2.5, volume: 1000000 });
  });

  it("sets raw filter string", () => {
    const { setRawFilterString } = useScreenerStore.getState();
    setRawFilterString("price > 100");

    const state = useScreenerStore.getState();
    expect(state.rawFilterString).toBe("price > 100");
  });

  it("sets filter error", () => {
    const { setFilterError } = useScreenerStore.getState();
    setFilterError("Syntax error");

    const state = useScreenerStore.getState();
    expect(state.filterError).toBe("Syntax error");
  });

  it("resets filters", () => {
    useScreenerStore.setState({ rawFilterString: "price > 100", filterError: "error", activeSubFilters: { "foo": "bar" } } as any);
    
    const { resetFilters } = useScreenerStore.getState();
    resetFilters();

    const state = useScreenerStore.getState();
    expect(state.rawFilterString).toBe("");
    expect(state.filterError).toBeNull();
    expect(state.activeSubFilters).toEqual({});
  });

  it("sets column visibility", () => {
    const { setColumnVisibility } = useScreenerStore.getState();
    
    const visibility = { symbol: true, peRatio: false };
    setColumnVisibility(visibility);
    expect(useScreenerStore.getState().columnVisibility).toEqual(visibility);
  });

  it("sets sorting", () => {
    const { setSorting } = useScreenerStore.getState();
    const newSort = [{ id: "price", desc: true }];
    setSorting(newSort);

    expect(useScreenerStore.getState().sorting).toEqual(newSort);
  });

  it("loads stocks successfully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ symbol: "AAPL", price: 150 }]
    });

    const { loadStocks } = useScreenerStore.getState();
    await loadStocks();

    const state = useScreenerStore.getState();
    expect(state.isLoadingStocks).toBe(false);
    expect(state.stocks).toEqual([{ symbol: "AAPL", price: 150 }]);
    expect(state.stocksError).toBeNull();
  });

  it("loads stocks with error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false
    });

    const { loadStocks } = useScreenerStore.getState();
    await loadStocks();

    const state = useScreenerStore.getState();
    expect(state.isLoadingStocks).toBe(false);
    expect(state.stocksError).toBe("Server returned HTTP error code");
  });

  it("loads fundamentals successfully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        overview: { symbol: "AAPL" },
        incomeStatement: [],
        balanceSheet: []
      })
    });

    const { loadFundamentals } = useScreenerStore.getState();
    await loadFundamentals("AAPL");

    const state = useScreenerStore.getState();
    expect(state.fundamentals["AAPL"]).toEqual({
        overview: { symbol: "AAPL" },
        incomeStatement: [],
        balanceSheet: []
    });
  });

  it("loads fundamentals with error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false
    });

    const { loadFundamentals } = useScreenerStore.getState();
    await loadFundamentals("AAPL");

    const state = useScreenerStore.getState();
    // It should just log and not crash, doesn't throw.
    expect(state.fundamentals["AAPL"]).toBeUndefined();
  });

  it("registers and unregisters sub filters", () => {
    const { registerSubFilter, unregisterSubFilter } = useScreenerStore.getState();
    
    registerSubFilter("panel1", "price > 50");
    expect(useScreenerStore.getState().activeSubFilters["panel1"]).toBe("price > 50");

    unregisterSubFilter("panel1");
    expect(useScreenerStore.getState().activeSubFilters["panel1"]).toBeUndefined();
  });
});
