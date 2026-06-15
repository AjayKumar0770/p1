import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterPanel } from "../client-ui";
import { useScreenerStore } from "../client-core";

// Mock Zustand store
vi.mock("../client-core", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useScreenerStore: vi.fn(),
  };
});

describe("FilterPanel", () => {
  const mockSetRawFilterString = vi.fn();
  const mockSetSubFilter = vi.fn();
  const mockClearSubFilter = vi.fn();
  const mockResetFilters = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useScreenerStore as any).mockImplementation((selector: any) => {
      const state = {
        rawFilterString: "",
        setRawFilterString: mockSetRawFilterString,
        filterError: null,
        activeSubFilters: {},
        setSubFilter: mockSetSubFilter,
        clearSubFilter: mockClearSubFilter,
        resetFilters: mockResetFilters,
        columnVisibility: {},
        toggleColumn: vi.fn(),
        sorting: []
      };
      return typeof selector === 'function' ? selector(state) : state;
    });
  });

  it("renders correctly and allows interacting with search input", () => {
    render(
      <FilterPanel>
        <div>Child Content</div>
      </FilterPanel>
    );
    
    // Check main panel renders
    expect(screen.getByText("Advanced Query Compiler Expression")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
    
    // Check input interaction
    const input = screen.getByLabelText("Filter stocks using custom expressions");
    fireEvent.change(input, { target: { value: "peRatio < 15" } });
    
    expect(mockSetRawFilterString).toHaveBeenCalledWith("peRatio < 15");
  });

  it("renders presets and allows clicking them", () => {
    render(
      <FilterPanel>
        <div />
      </FilterPanel>
    );
    
    const presetButton = screen.getByText("Undervalued Tech");
    fireEvent.click(presetButton);
    
    expect(mockSetRawFilterString).toHaveBeenCalledWith('sector == "Technology" AND peRatio < 25 AND roe > 15');
  });

  it("calls resetFilters on Clear All", () => {
    render(
      <FilterPanel>
        <div />
      </FilterPanel>
    );
    
    const clearBtn = screen.getByText("Reset All Filters");
    fireEvent.click(clearBtn);
    
    expect(mockResetFilters).toHaveBeenCalled();
  });
});
