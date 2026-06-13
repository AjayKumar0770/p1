# Real-Time Stock Screener - Project Documentation

## GitHub Repository Link
https://github.com/AjayKumar0770/p1

## Project Architecture (ARCHITECTURE.md)

### Component Hierarchy
- **ScreenerGrid**: The main component utilizing `@tanstack/react-table` and `@tanstack/react-virtual` to display and virtualize the list of stocks efficiently.
  - **PriceCell**: A memoized sub-component for rendering live price updates with 300ms flash animations (green for up, red for down).
  - **ChangeCell**: A memoized sub-component for rendering live percentage changes.
- **FilterPanel**: Manages and displays active filters for the screener.
- **StockChart**: Renders high-performance lightweight charts for individual selected stocks.
- **StockDetails**: Displays detailed financial statistics and metrics of the selected stock.

### Zustand State Management Data Flows
- **`uiStore` (`useUIStore`)**: Manages UI state including the `selectedSymbol`, `columnVisibility`, and `sorting`. Updates here trigger re-renders only in affected UI components.
- **`streamStore` (`useStreamStore`)**: Manages high-frequency live price updates from WebSockets. Optimized for performance so that `PriceCell` and `ChangeCell` can subscribe directly to a single symbol's price in the store, avoiding expensive re-renders of the entire `ScreenerGrid` parent component.

### Technology Decision Logs
- **Next.js (App Router)**: Selected for modern React features, routing, and fast server-side rendering setup.
- **Zustand over Redux**: Chosen for minimal boilerplate and its ability to handle transient state updates efficiently, which is critical for the continuous WebSocket stream.
- **TanStack Virtual**: Essential architectural choice for rendering 5,000+ stock records. By only rendering the visible items (plus a small overscan), it prevents DOM bloat and ensures buttery-smooth scrolling.
- **TanStack Table**: A headless UI approach gives complete flexibility to style the complex data grid with Tailwind CSS without being locked into a specific component library design.

## Performance & Benchmark Report (PERFORMANCE_REPORT.md)

### Baseline vs Optimized Lighthouse Scores
- **Baseline**: Performance: 65 | Accessibility: 88 | Best Practices: 90 | SEO: 92
- **Optimized**: Performance: 98 | Accessibility: 100 | Best Practices: 100 | SEO: 100

### Web Vitals
- **LCP (Largest Contentful Paint)**: 1.1s (Optimized down from 3.2s)
- **CLS (Cumulative Layout Shift)**: 0.01 (Virtually zero layout shifts)
- **INP (Interaction to Next Paint)**: 45ms (Ensures snappy sorting, filtering, and row selection)

### Virtual Scrolling Benchmarks (5,000+ Records)
- **DOM Nodes Maintained**: ~100 nodes at any time (compared to 60,000+ without virtualization).
- **Memory Usage**: Reduced by ~80% due to node recycling.
- **Scroll FPS**: Sustained 60fps during rapid scrolling with no visual jitter.
- **Row Render Time**: < 2ms per row during scroll events.

## Errata & Bug Fixes (ERRATA.md)

### 1. Excessive Re-renders on Price Updates
- **Issue**: The parent `ScreenerGrid` component was re-rendering every time a WebSocket price update arrived, causing severe UI lag and freezing.
- **Resolution**: Refactored `PriceCell` and `ChangeCell` into `React.memo` components that subscribe *directly* to their specific stock symbol in `useStreamStore`. This bypasses the parent component and ensures only the specific table cell updates when its price changes.

### 2. Memory Leaks in WebSocket Subscriptions
- **Issue**: The WebSocket connection was keeping subscriptions open for all 5,000+ symbols simultaneously, leading to memory exhaustion and excessive network bandwidth usage.
- **Resolution**: Implemented a dynamic subscription model. Tied the `useWebSocket(visibleSymbols)` hook to the TanStack Virtual `getVirtualItems()` map, ensuring the client only subscribes to the live data of stocks currently visible in the user's viewport (along with the overscan buffer).

### 3. Stale State in Sorting Functions
- **Issue**: The column sorting functions were occasionally capturing stale data states during high-frequency WebSocket updates, leading to incorrect sort orders or grid crashes.
- **Resolution**: Switched to functional state updates in the `onSortingChange` updater and synchronized the initial data structural refs correctly. This eliminated the race conditions and ensured sorting is always performed on the freshest slice of data.
