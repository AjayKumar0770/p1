# Day 1: Codebase Audit & Performance Profiling

## Focus
Initial exploration of the real-time stock screener codebase, performance profiling, and bottleneck analysis.

## Key Accomplishments
1. **Repository Setup & Inspection**:
   - Analyzed the client (Next.js) and server (Express-based market simulation) structure.
   - Audited the state management patterns (`zustand` store instances) and the real-time data pipeline powered by WebSockets.
2. **Performance Auditing**:
   - Ran initial Lighthouse audits on the client, recording a baseline score of **~67 Performance** and **~86 Accessibility**.
   - Profiled memory allocation and CPU execution patterns during simulated high-frequency market updates (10 updates/second) using Chrome DevTools.
3. **Bottleneck Identification**:
   - Discovered that the entire `ScreenerGrid` component and all child components were re-rendering with every single price tick due to a shallow-subscribing `useStockScreener` hook.
   - Identified redundant canvas re-initialization inside the charting code (`StockChart.tsx`), causing DOM thrashing and layout lag.

## Findings & Metrics
- **Baseline Performance Score:** 67 (Lighthouse)
- **Baseline Accessibility Score:** 86 (Lighthouse)
- **Main Thread Blocking Time:** ~320ms during price updates (due to re-rendering of all grid rows).
- **Target Metrics:** >90 Performance, 100% Accessibility (WCAG AA Compliant), 60 FPS scrolling.
