# Day 2: Price Update Decoupling & Grid Optimization

## Focus
Refactoring state subscriptions to eliminate grid-wide re-render storms and optimize real-time table rendering.

## Key Accomplishments
1. **Zustand Subscription Refactoring**:
   - Decoupled high-frequency live price streams from the core `useStockScreener` hook to prevent the parent layout from triggering updates on every incoming WebSocket message.
   - Refactored `useStockScreener` to run filtering and sorting operations only when user settings change, using memoized static snapshots.
2. **Cell-Level Isolation**:
   - Isolated and memoized `PriceCell` and `ChangeCell` using `React.memo`.
   - Subscribed each cell *directly* to its corresponding ticker data in the Zustand stream store (`useStreamStore`). 
   - This architectural shift allowed updates to bypass parent nodes and directly re-render only the specific updated price cell.
3. **Rendering Benchmarks**:
   - Measured average filter evaluation and rendering time, which decreased from **120ms/tick** to **<2ms/tick**.

## Findings & Metrics
- **Grid Scroll FPS:** Increased from ~25 FPS to a solid ~48 FPS.
- **CPU Idle Time:** Improved by 75% during high-frequency streaming.
- **Active DOM Node Updates:** Reduced from 5,000+ nodes to strictly the cells corresponding to the live price tick (max 10-15 updates at any instant).
