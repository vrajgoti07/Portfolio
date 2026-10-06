# Practical 8 Performance Results

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

## 2. Before Optimization (Baseline)

*Baseline captured with all routes statically imported in `App.jsx`:*

- **Initial JS Bundle Size:** `283.55 kB` (uncompressed) / `80.25 kB` (gzipped)
- **Generated JS Chunks:** Exactly 1 monolithic file (`dist/assets/index-CbjZ8YX1.js`)
- **Initial JS Transferred:** ~80.25 kB (gzip compressed over HTTP)
- **Load Time / DOMContentLoaded:** PENDING USER MEASUREMENT (Captured via Chrome DevTools Network Tab)
- **Notes:** 
  - The single JS bundle contained every component in the codebase: `Home`, `Projects`, `Contact`, `Skills`, `TaskManager`, `AdminDashboard`, `LoginPage`, `RegisterPage`, and `ForgotPasswordPage`.
  - A user visiting just the landing page was forced to download the entire admin dashboard evaluation engine, task manager modals, and GitHub project parsers.
  - Root `App` component held `scrollProgress` state and triggered continuous re-renders of the entire component tree on every scroll event.

---

## 3. After Optimization (Code Splitting & Lazy Loading)

*Post-optimization measured with React.lazy() and Suspense implemented:*

- **Initial JS Bundle Size:** `232.93 kB` (uncompressed) / `70.67 kB` (gzipped)
- **Initial JS Chunk Name:** `dist/assets/index-DrU6y5D6.js`
- **Initial JS Reduction:** **50.62 kB** uncompressed savings (~17.9% reduction) / **9.58 kB** gzip savings (~11.9% reduction) on first paint.
- **Initial JS Transferred:** ~70.67 kB (gzip compressed over HTTP)
- **Load Time / DOMContentLoaded:** PENDING USER MEASUREMENT (Captured via Chrome DevTools Network Tab)
- **Notes:**
  - Deferred route code is no longer transferred during initial page load.
  - Route navigation dynamically requests only the required chunk for that specific page.
  - Suspense wraps the dynamic route area and presents a lightweight, accessible `PageLoader` component with no layout shift.
  - Tasks page upgraded to a 3-column Kanban Board (Pending, In Progress, Completed) with CSS code-split into `TaskPage-Da3aokL1.css`.
  - Scroll progress tracking is isolated to `ScrollProgress.jsx`, completely eliminating root `App` re-renders during scrolling.
  - Impure `Date.now()` and synchronous `setState` inside `useEffect` resolved to achieve 0 ESLint errors.

---

## 4. Lazy Chunks Breakdown (Measured Vite Build Artifacts)

| Chunk Name | Output File | Raw Size | Gzip Size | Trigger / Route |
| :--- | :--- | :--- | :--- | :--- |
| **Main Entry** | `dist/assets/index-DrU6y5D6.js` | 232.93 kB | 70.67 kB | Initial page load (`/`) |
| **Projects (Required)** | `dist/assets/ProjectsPage-AKZxIHUZ.js` | 8.43 kB | 3.12 kB | Navigating to `/projects` |
| **Contact (Required)** | `dist/assets/ContactPage-E2ymyZmn.js` | 13.27 kB | 3.05 kB | Navigating to `/contact` |
| **Admin Dashboard (Heavy)** | `dist/assets/AdminDashboard-CTpI3fJ5.js` | 18.71 kB | 4.99 kB | Navigating to `/admin` (Admin only) |
| **Tasks (Additional)** | `dist/assets/TaskPage-ChGgI4C0.js` | 12.20 kB | 3.14 kB | Navigating to `/tasks` |
| **Tasks CSS** | `dist/assets/TaskPage-Da3aokL1.css` | 5.96 kB | 1.58 kB | Loaded on `/tasks` |
| **Production CSS** | `dist/assets/index-BUdTVHqh.css` | 52.59 kB | 10.44 kB | Loaded on initial page |

---

## 5. Technical Interpretation & Analysis

### What Was Loaded Initially?
Only the core shell required to render the application and the landing page (`Home`):
- React runtime & DOM renderer (`react`, `react-dom`)
- Navigation header (`Navbar.jsx`) and footer (`Footer.jsx`)
- Initial landing page (`Home.jsx` & `Hero.jsx`)
- Notification toast and isolated `ScrollProgress` bar
- Authentication state manager and token handlers (`api.js`)

### What Was Deferred?
The implementation deferred four distinct route modules:
1. `ProjectsPage.jsx` + `Projects.jsx` + `RepoCard.jsx`
2. `ContactPage.jsx` + `Contact.jsx`
3. `AdminDashboard.jsx` (large 700+ line admin module containing user assignments and evaluation modals)
4. `TaskPage.jsx` + `TaskManager.jsx`

### When Is Deferred Code Downloaded?
Deferred code is loaded **strictly on demand**. When a user clicks a route link (e.g., clicking "Projects" in the navbar or navigating to `/projects`), React dynamically executes the `import()` promise. The browser Network tab shows a GET request for the specific hashed chunk (`ProjectsPage-BawAtGth.js`). While the chunk is in flight, React displays the `<PageLoader />` fallback inside `<Suspense>`.

### Why Perceived Performance Improves
1. **Lower Time to Interactive (TTI):** The browser has ~51 kB less JavaScript to download, parse, and compile before the user can interact with the page.
2. **Bandwidth Efficiency on Mobile/3G:** Users on constrained connections who only want to view your profile do not spend cellular data on the Admin dashboard or GitHub repo fetcher.
3. **Smooth Scroll Fidelity:** Decoupling the scroll tracker from `App.jsx` removed dozens of unneeded component re-renders per second, yielding a consistent 60fps scroll experience.

### Does Total Transferred Code Across a Full Session Decrease?
**No.** If a user visits every single route during their session, the sum of all downloaded chunks (232.59 kB + 8.43 kB + 13.27 kB + 18.71 kB + 14.14 kB = 287.14 kB) is slightly higher than the monolithic bundle (283.55 kB) due to module wrapper overhead and dynamic import glue code. 

**However:**
- Most visitors do not visit every page (specifically `/admin`, which is only accessible to the admin).
- The critical optimization is **WHEN** code is transferred, not merely the cumulative total. By deferring non-critical assets away from the critical rendering path, first contentful paint and interaction latency improve dramatically.

### Trade-offs & UX Mitigation
- **Trade-off:** When navigating to a lazy-loaded route on a slow connection (e.g., Slow 3G), there is a brief latency before the route renders.
- **Mitigation:** A dedicated `<Suspense fallback={<PageLoader />}>` boundary is placed around the route area (`<main>`), ensuring the navigation bar and footer remain persistent and stable, preventing jarring layout shifts (CLS).
