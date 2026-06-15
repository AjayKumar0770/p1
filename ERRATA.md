# Errata & Bug Fixes (ERRATA.md)

This document contains a comprehensive record of the core performance, rendering, state synchronization, and configuration issues discovered during the audit of the Aegis Real-Time Stock Screener, along with their engineering resolutions.

---

### 1. Excessive Re-renders on High-Frequency Price Updates
> [!WARNING]
> **Performance Impact:** High (Severe main-thread blocking, UI freezing, drop to < 10 FPS during active market updates).

- **Symptom:** The data grid would lag and lock up during rapid price ticks (10 WebSocket packets per second). React DevTools profiler highlighted that the entire `ScreenerGrid` parent component and all of its cells were re-rendering on every tick.
- **Root Cause:** The `useStockScreener` hook subscribed to the `prices` slice of `useScreenerStore` (via `useShallow`). Any update to a single stock symbol's price in the store triggered a full re-evaluation of the hook, which re-run sorting and filtering and re-rendered the entire React Virtual layout.
- **Resolution:**
  - Decoupled the high-frequency price updates from the main hook dependencies.
  - Refactored `PriceCell` and `ChangeCell` into isolated `React.memo` components.
  - Subscribed each cell *directly* to the `streamStore` for its specific symbol using `useStreamStore(state => state.prices[symbol])`. This bypasses the parent grid entirely, ensuring only the target DOM cell updates and flashes when its price changes.

---

### 2. Memory Leaks in WebSocket Subscriptions
> [!CAUTION]
> **Resource Leak:** Medium (High memory footprint over time, excessive client bandwidth consumption, and socket connection thrashing).

- **Symptom:** Performance degraded over longer sessions as the browser maintained real-time connections and processed ticks for all 5,000+ simulated tickers, exhausting CPU resources.
- **Root Cause:** The client opened websocket subscriptions for the entire universe of stocks upon initial boot, processing incoming ticks for off-screen rows.
- **Resolution:**
  - Implemented a viewport-driven subscription manager.
  - Integrated the `useWebSocket` subscription handler with TanStack Virtual's `getVirtualItems()`.
  - The client now dynamically subscribes and unsubscribes from ticker streams based on the current window view range (including a safety overscan padding of 5 rows above and below).

---

### 3. Stale State & Race Conditions in Sorting / Filtering
> [!IMPORTANT]
> **Functional Issue:** Medium (Inaccurate sort behavior, intermittent app crashes during rapid sorting toggles).

- **Symptom:** Sorting the grid by Price or Change% would occasionally yield stale states, visual jumps, or result in out-of-order rendering.
- **Root Cause:** Standard state setters in the table handlers captured the closures of the fast-changing websocket values, leading to race conditions between asynchronous react renders and state updates.
- **Resolution:**
  - Updated the column sorting updaters to use functional state updates (`setSorting(prev => ...)`).
  - Synchronized and memoized the data source reference against the latest tick values via refs to ensure the sorting comparator always evaluates the fresh value array.

---

### 4. Chart Canvas Redraw Loop on Candle Updates
> [!WARNING]
> **Performance Impact:** High (CPU spikes, memory leaks, and unresponsive DOM during charting).

- **Symptom:** Switching or updating indicators caused the entire Lightweight Charts canvas element to be torn down and rebuilt from scratch on every update, flashing the UI black.
- **Root Cause:** The `useEffect` hook in `StockChart.tsx` was destroying the chart instance (`chart.remove()`) and clearing container inner HTML on every render or state tick.
- **Resolution:**
  - Restructured the charting layout to initialize the Lightweight Charts canvas *exactly once* via `useRef` handles.
  - Pumped update packets into the active series reference using `.setData()` and `.update()` API calls instead of recreating the instance, yielding a buttery-smooth 60fps chart render.

---

### 5. TypeScript Path Resolution Validation Error (IDE Specific)
- **Symptom:** Standard editors and TypeScript Language Servers marked `client/tsconfig.json` line 1 with an error: *"Option 'paths' cannot be used without specifying '--baseUrl'"*.
- **Root Cause:** The project used absolute import mapping `"paths": { "@/*": ["./src/*"] }` but omitted the companion `"baseUrl"` compiler option, causing standard IDE checkers to fail resolving relative paths correctly.
- **Resolution:** Added `"baseUrl": "."` directly under `compilerOptions` inside `client/tsconfig.json`. All typechecking (`npx tsc --noEmit`) now succeeds cleanly without warnings.
