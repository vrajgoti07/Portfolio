# Practical 8 Performance Results: Lazy Loading & Code Splitting

## 1. Environment

- **Browser:** Google Chrome / Chromium
- **Browser Version:** Current stable channel (120+)
- **Operating System:** Windows 11
- **Viewport:** 1440 × 900 (Desktop) / 375 × 812 (Mobile)
- **Network Conditions:** 
  - Fast / Unthrottled (WiFi/Ethernet)
  - Simulated Slow 3G (400 kbps download, 400 kbps upload, 2000 ms RTT)
- **Build Tool:** Vite v8.1.5 (`npm run build`)
- **React Version:** React 19.2.7

---

## 2. Before / After Comparison Table

| Metric | Before Optimization (Baseline) | After Optimization (Lazy Loaded) | Delta / Improvement | Status / Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Total JS Chunks Generated** | 1 monolithic chunk | 5 distinct chunks | +4 split modules | Measured via `npm run build` |
| **Initial JS Bundle Size (Raw)** | 283.55 kB | 232.93 kB | **-50.62 kB (-17.85%)** | Measured via `npm run build` |
| **Initial JS Bundle Size (Gzip)** | 80.25 kB | 70.66 kB | **-9.59 kB (-11.95%)** | Measured via `npm run build` |
| **Projects Route In Initial Bundle** | Included (statically imported) | Deferred (`ProjectsPage-*.js`) | Excluded from entry chunk | Verified in build output |
| **Contact Route In Initial Bundle** | Included (statically imported) | Deferred (`ContactPage-*.js`) | Excluded from entry chunk | Verified in build output |
| **Admin Route In Initial Bundle** | Included (statically imported) | Deferred (`AdminDashboard-*.js`) | Excluded from entry chunk | Verified in build output |
| **Tasks Route In Initial Bundle** | Included (statically imported) | Deferred (`TaskPage-*.js`) | Excluded from entry chunk | Verified in build output |
| **Root Re-renders on Scroll** | Continuous (App + tree re-renders) | 0 (Isolated in `ScrollProgress`) | Complete elimination | Verified via Profiler audit |
| **ESLint Errors / Warnings** | 0 errors | 0 errors | Clean build | Verified via `npm run lint` |
| **Initial Page Load Time (Fast)** | PENDING USER MEASUREMENT | PENDING USER MEASUREMENT | PENDING USER MEASUREMENT | Chrome DevTools Network Tab |
| **Initial Page Load Time (Slow 3G)** | PENDING USER MEASUREMENT | PENDING USER MEASUREMENT | PENDING USER MEASUREMENT | Chrome DevTools Network Tab |
| **DOM Content Loaded (DCL)** | PENDING USER MEASUREMENT | PENDING USER MEASUREMENT | PENDING USER MEASUREMENT | Chrome DevTools Network Tab |

---

## 3. After Optimization: Measured Vite Build Output

**Build Command:**
```bash
cd Frontend
npm run build
```

**Measured Vite Build Log:**
```text
> portfolio-website@0.0.0 build
> vite build

vite v8.1.5 building client environment for production...
transforming...✓ 1803 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                           1.05 kB │ gzip:  0.56 kB
dist/assets/TaskPage-CarvxjTj.css         6.14 kB │ gzip:  1.61 kB
dist/assets/index-BUdTVHqh.css           52.59 kB │ gzip: 10.44 kB
dist/assets/ProjectsPage-Boq3MvPJ.js      8.43 kB │ gzip:  3.13 kB
dist/assets/TaskPage-Bud7K3V8.js         13.00 kB │ gzip:  3.31 kB
dist/assets/ContactPage-RxEiZke7.js      13.27 kB │ gzip:  3.05 kB
dist/assets/AdminDashboard-DIeEC-qm.js   18.71 kB │ gzip:  4.99 kB
dist/assets/index-D5qpXzVO.js           232.93 kB │ gzip: 70.66 kB

✓ built in 613ms
```

---

## 4. Lazy Chunks Breakdown

| Chunk Name | Output File | Raw Size | Gzip Size | Trigger / Route |
| :--- | :--- | :--- | :--- | :--- |
| **Main Entry** | `dist/assets/index-D5qpXzVO.js` | 232.93 kB | 70.66 kB | Initial page load (`/`) |
| **Projects (Required Route)** | `dist/assets/ProjectsPage-Boq3MvPJ.js` | 8.43 kB | 3.13 kB | Navigating to `/projects` |
| **Contact (Required Route)** | `dist/assets/ContactPage-RxEiZke7.js` | 13.27 kB | 3.05 kB | Navigating to `/contact` |
| **Admin Dashboard (Heavy Component)** | `dist/assets/AdminDashboard-DIeEC-qm.js` | 18.71 kB | 4.99 kB | Navigating to `/admin` (Admin only) |
| **Task Page (Additional Component)** | `dist/assets/TaskPage-Bud7K3V8.js` | 13.00 kB | 3.31 kB | Navigating to `/tasks` |
| **Task Page Styles** | `dist/assets/TaskPage-CarvxjTj.css` | 6.14 kB | 1.61 kB | Loaded on `/tasks` |
| **Global Styles** | `dist/assets/index-BUdTVHqh.css` | 52.59 kB | 10.44 kB | Loaded on initial page |

---

## 5. Technical Interpretation & Analysis

### What Was Loaded Initially?
Only the core application shell and components required for first paint:
- React 19 runtime & DOM renderer (`react`, `react-dom`)
- Application layout: `Navbar.jsx` and `Footer.jsx`
- Home landing page: `Home.jsx`, `Hero.jsx`, and `Skills.jsx`
- Authentication state manager & token services: `api.js`
- UI utilities: `NotificationToast.jsx` and isolated `ScrollProgress.jsx`

### What Was Deferred?
Four distinct route and component modules are dynamically deferred:
1. `ProjectsPage.jsx` (`Projects.jsx`, `RepoCard.jsx`, GitHub API handling)
2. `ContactPage.jsx` (`Contact.jsx`, contact form validation, feedback states)
3. `AdminDashboard.jsx` (large 700+ line administrative portal with user management)
4. `TaskPage.jsx` (`TaskManager.jsx`, Kanban board columns, modals, task persistence)

### When Is Deferred Code Downloaded?
Code is fetched **strictly on demand**. When a user clicks a route link (e.g., clicking "Projects" in the navbar or typing `/projects` in the address bar):
1. React executes the dynamic `import()` promise.
2. The browser Network tab issues an HTTP GET request for the specific chunk (`ProjectsPage-Boq3MvPJ.js`).
3. While the chunk is downloading, React renders the `<PageLoader />` fallback component within the `<Suspense>` boundary.
4. Once loaded, the component renders smoothly without reloading the navigation bar, footer, or parent context.

### Why Perceived Performance Improves
1. **Reduced Initial Download:** Over 50 kB of uncompressed JavaScript (~9.6 kB gzipped) is excluded from the critical path.
2. **Faster First Contentful Paint (FCP) and Time to Interactive (TTI):** Less JavaScript to parse and compile allows the browser main thread to paint the homepage faster.
3. **Data Savings for Users on Cellular / Metered Connections:** Profile visitors who only read the home section never download admin dashboards or task management tooling.
4. **Stable Layout:** The persistent `Navbar` and `Footer` stay mounted while only `<main id="main-content">` transitions, preventing layout shifts (CLS).

### Does Total Transferred Code Across a Full Session Decrease?
**No.** If a user navigates to every single route during their session, the combined size of all chunks (232.93 + 8.43 + 13.27 + 18.71 + 13.00 = 286.34 kB) is slightly larger than the monolithic bundle (283.55 kB) due to module wrappers and dynamic import runtime overhead.

**However:**
- Most visitors do not navigate to every page.
- The critical performance metric is **Time to First Paint & Interactivity**, which directly benefits from deferring non-essential assets off the initial payload.

---

## 6. Profiler Analysis & Re-render Optimization

### Unnecessary Re-render Identified
- **Component:** Root `App.jsx` and all children (`Navbar`, `Home`, `Hero`, `Footer`)
- **Cause:** `App.jsx` originally managed window scroll event listening and maintained `scrollProgress` state at root level (`useState(0)`). Every scroll event triggered `setScrollProgress()`, causing the root component to re-render up to 60 times per second during scrolling.
- **Evidence:** React DevTools Profiler recorded continuous render commits on scroll with reason: `Hook 1 changed (scrollProgress)`.
- **Solution:** 
  1. Extracted scroll logic into a dedicated, isolated leaf component (`ScrollProgress.jsx`).
  2. Applied `window.requestAnimationFrame` throttling inside `ScrollProgress.jsx` to synchronize with display refresh cycles.
  3. Placed `<ScrollProgress />` alongside `<main>` as a sibling leaf.
- **Outcome:** The entire React tree (`App`, `Navbar`, `Home`, `Footer`) remains idle during scrolling; only the isolated progress bar renders, eliminating frame drops.
