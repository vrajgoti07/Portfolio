# Practical 8 Performance Baseline (Before Optimization)

This document records the baseline build and network performance of the application **prior** to implementing code splitting and lazy loading in Practical 8.

---

## 1. Environment & Test Setup

- **Project:** Advanced Web Development Frameworks (AWDF) - Practical 8
- **Repository:** https://github.com/vrajgoti07/Portfolio
- **Date Measured:** Baseline recorded from monolithic build prior to route-based splitting
- **Operating System:** Windows 11
- **Node.js / Build Tool:** Node.js v20+ / Vite v8.1.5
- **Frontend Framework:** React 19.2.7
- **Browser for Network Verification:** Google Chrome / Chromium
- **Viewport:** 1440 × 900 (Desktop) / 375 × 812 (Mobile)
- **DevTools Cache:** Disabled (`Disable cache` checked in Network tab)

---

## 2. Baseline Build Output (Vite Production Build)

**Build Command:**
```bash
cd Frontend
npm run build
```

**Measured Vite Build Log (Baseline):**
```text
> portfolio-website@0.0.0 build
> vite build

vite v8.1.5 building client environment for production...
transforming...✓ 1798 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.05 kB │ gzip:  0.56 kB
dist/assets/index-Bl4KCutu.css   48.52 kB │ gzip:  9.87 kB
dist/assets/index-CbjZ8YX1.js   283.55 kB │ gzip: 80.25 kB

✓ built in 647ms
```

### Baseline Chunk Analysis:
- **Total JS Files Generated:** Exactly **1** monolithic chunk (`dist/assets/index-CbjZ8YX1.js`).
- **Initial JS Bundle Size:** **283.55 kB** (uncompressed) / **80.25 kB** (gzipped).
- **Route-based chunks:** **0** (No code splitting present; all routes, components, and heavy dashboards are bundled together).

---

## 3. Baseline DevTools Network Metrics

*Network conditions tested with DevTools Cache Disabled:*

### Scenario A: Unthrottled / Fast Network (Initial Route `/`)
- **Initial JS Requested:** `index-CbjZ8YX1.js` (283.55 kB raw, ~80.25 kB transferred)
- **Projects Route Code Included in Initial Bundle:** YES (statically imported)
- **Contact Route Code Included in Initial Bundle:** YES (statically imported)
- **Admin Dashboard Code Included in Initial Bundle:** YES (statically imported)
- **Task Manager Code Included in Initial Bundle:** YES (statically imported)
- **Total JS Transferred on Initial Load:** ~80.25 kB gzip
- **Load Time / DOMContentLoaded:** PENDING USER MEASUREMENT (Captured via Chrome DevTools Network Tab)
- **Finish Time:** PENDING USER MEASUREMENT (Captured via Chrome DevTools Network Tab)

### Scenario B: Simulated Slow 3G (Initial Route `/`)
- **Network Profile:** Slow 3G (Download: 400 kbps, Upload: 400 kbps, Latency: 2000 ms)
- **Initial JS Transfer Time:** PENDING USER MEASUREMENT (Estimated ~2.1s - 3.5s for 80+ kB payload over high-latency link)
- **Observations:** User must download the full bundle including all unused pages (Projects, Contact, Admin, Task Manager) before any page can become interactive.

---

## 4. Key Observations & Bottlenecks Identified

1. **Monolithic Bundle:** `App.jsx` statically imported `ProjectsPage`, `ContactPage`, `AdminDashboard`, `TaskPage`, `LoginPage`, `RegisterPage`, and `ForgotPasswordPage`. Every visitor received code for admin controls, task manager modals, and GitHub project parsers regardless of which page they visited.
2. **Re-render on Scroll:** `App.jsx` maintained `scrollProgress` state at root level and updated it on every window scroll event, causing the entire React tree (`App`, `Navbar`, active page, `Footer`) to re-render repeatedly during scrolling.
3. **Array Reference Instability:** `navItems` array was recreated inside the render body of `App.jsx` on every render, triggering unnecessary re-renders in `Navbar`.
4. **Heavy Visual CSS Overheads:** Noise texture generation (`feTurbulence`) and animated orb keyframes forced repeated paint/composite operations.
