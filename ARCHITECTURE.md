# Project Architecture (ARCHITECTURE.md)

## Component Hierarchy
- **ScreenerGrid**: The main table component utilizing `@tanstack/react-table` and `@tanstack/react-virtual` to display and virtualize the list of stocks efficiently.
  - **PriceCell**: A memoized sub-component for rendering live price updates with 300ms flash animations (green for price up, red for price down).
  - **ChangeCell**: A memoized sub-component for rendering live percentage changes.
- **FilterPanel**: Manages, parses, and displays active screening filters and presets for the screener.
- **StockChart**: Renders high-performance canvas-based TradingView lightweight charts for individual selected stocks.
- **StockDetails**: Displays detailed financial statistics, ratios, and balance sheet tables of the selected stock.

---

## Zustand State Management Data Flows
- **`uiStore` (`useUIStore`)**: Manages general UI state including the `selectedSymbol`, `columnVisibility`, and `sorting` preferences. Updates here trigger re-renders only in affected UI components.
- **`streamStore` (`useStreamStore`)**: Manages high-frequency live price updates from WebSockets. Optimized for extreme performance so that `PriceCell` and `ChangeCell` subscribe directly to a single symbol's price in the store, bypassing parent container re-renders entirely.

---

## Technology Decision Logs
- **Next.js (App Router)**: Selected for modern React server-side rendering, routing structure, and quick production bundling.
- **Zustand over Redux**: Chosen for minimal boilerplate and its lightweight capability to handle high-frequency transient state updates efficiently, which is critical for the continuous WebSocket stream.
- **TanStack Virtual**: Essential architectural choice for rendering 5,000+ stock records. By only rendering elements inside the user's viewport, it keeps DOM node counts low and scrolling fluid at 60 FPS.
- **TanStack Table**: A headless UI approach gives complete flexibility to style the complex data grid with CSS/Tailwind without being locked into a specific component library design.
