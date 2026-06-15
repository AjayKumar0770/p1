# Code Coverage Report

## Overall Metrics
- **Statements:** 72.54%
- **Branches:** 62.77%
- **Functions:** 78.90%
- **Lines:** 74.84%

*(Target Coverage: >70% Statement/Line)*

## Breakdown by File

| File | % Statements | % Branches | % Functions | % Lines |
|------|-------------|------------|-------------|---------|
| **client-core.tsx** | 55.95% | 46.37% | 78.02% | 58.27% |
| **client-ui.tsx** | 72.34% | 60.86% | 69.23% | 75.36% |
| **StockChart.tsx** | 87.55% | 73.91% | 88.88% | 90.76% |
| **StockDetails.tsx** | 82.60% | 75.00% | 100.00% | 89.47% |
| **parser.ts** | 81.67% | 70.06% | 90.47% | 84.83% |
| **math.ts** | 98.98% | 89.47% | 100.00% | 100.00% |
| **formatters.ts** | 100.00% | 100.00% | 100.00% | 100.00% |

## Covered Modules
1. **Utility Functions:** Currency and large-number formatters are 100% covered.
2. **Indicator Calculations:** Complex math for SMA, EMA, RSI, Bollinger Bands, and Volume Profile operates at ~99% statement coverage and 100% function coverage.
3. **Filter Predicates (AST):** Abstract Syntax Tree evaluation and parsing logic for screening expressions reached >80% coverage.
4. **Components:**
   - `ScreenerGrid` (Virtualized DataGrid) with custom cell renderers (Price, Change, etc.)
   - `FilterPanel` (Expression inputs and Presets)
   - `StockChart` (Indicators and overlays logic handling)
   - `StockDetails` (Financial metrics)
5. **Integration (Workflow):** The `filter-to-grid` integration tests simulate an entire lifecycle of fetching data, rendering rows, and correctly typing a complex AST filter query into the panel to successfully winnow down the DataGrid records.
