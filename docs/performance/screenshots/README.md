# Practical 8 — Performance & Lazy Loading Screenshot Evidence Guide

This document provides the exact checklist of required screenshot evidence for **Practical 8: Performance Optimization and Lazy Loading in React**.

Because automated headless environments cannot capture your local browser DevTools UI panels with custom throttling profiles, **USER MUST CAPTURE THESE SCREENSHOTS MANUALLY** using Google Chrome / Chromium DevTools.

---

## Screenshot Evidence Checklist

| # | Item Description | Status | Target File Path | How to Capture |
|---|---|---|---|---|
| **1** | Baseline `npm run build` output BEFORE optimization | [ ] USER MUST CAPTURE THIS SCREENSHOT MANUALLY | `docs/performance/screenshots/01-baseline-build.png` | Terminal screenshot showing Vite build before splitting (single `index-CbjZ8YX1.js` 283.55 kB) |
| **2** | Baseline DevTools Network tab BEFORE optimization | [ ] USER MUST CAPTURE THIS SCREENSHOT MANUALLY | `docs/performance/screenshots/02-baseline-network.png` | Chrome DevTools > Network tab (Disable cache checked) on `http://localhost:5173/` |
| **3** | Baseline initial JavaScript requests BEFORE optimization | [ ] USER MUST CAPTURE THIS SCREENSHOT MANUALLY | `docs/performance/screenshots/03-baseline-initial-js.png` | Filter Network tab by `JS`. Highlight single monolithic bundle request |
| **4** | Updated `npm run build` output showing separate chunks | [ ] USER MUST CAPTURE THIS SCREENSHOT MANUALLY | `docs/performance/screenshots/04-updated-build-chunks.png` | Terminal screenshot running `npm run build` showing chunks: `index-*.js`, `ProjectsPage-*.js`, `ContactPage-*.js`, `AdminDashboard-*.js`, `TaskPage-*.js` |
| **5** | Network tab on initial page AFTER optimization | [ ] USER MUST CAPTURE THIS SCREENSHOT MANUALLY | `docs/performance/screenshots/05-optimized-initial-page.png` | Reload `http://localhost:5173/`. Verify `ProjectsPage` and `ContactPage` chunks are NOT in the network log |
| **6** | Projects route Network tab showing Projects chunk request | [ ] USER MUST CAPTURE THIS SCREENSHOT MANUALLY | `docs/performance/screenshots/06-projects-chunk-network.png` | Click "Projects" in navbar. Network tab shows `ProjectsPage-*.js` dynamically fetched |
| **7** | Contact route Network tab showing Contact chunk request | [ ] USER MUST CAPTURE THIS SCREENSHOT MANUALLY | `docs/performance/screenshots/07-contact-chunk-network.png` | Click "Contact" in navbar. Network tab shows `ContactPage-*.js` dynamically fetched |
| **8** | Slow 3G Projects route showing PageLoader fallback | [ ] USER MUST CAPTURE THIS SCREENSHOT MANUALLY | `docs/performance/screenshots/08-slow3g-projects-fallback.png` | In DevTools Network throttling dropdown, select "Slow 3G". Click "Projects". Capture `<PageLoader />` fallback card |
| **9** | Slow 3G Contact route showing PageLoader fallback | [ ] USER MUST CAPTURE THIS SCREENSHOT MANUALLY | `docs/performance/screenshots/09-slow3g-contact-fallback.png` | While on Slow 3G throttling, click "Contact". Capture `<PageLoader />` fallback card |
| **10** | React DevTools Profiler showing investigated render behavior | [ ] USER MUST CAPTURE THIS SCREENSHOT MANUALLY | `docs/performance/screenshots/10-profiler-rerender-fix.png` | React DevTools > Profiler tab. Record a scroll session showing `ScrollProgress` rendered independently without re-rendering `App` or `Navbar` |
| **11** | Final application UI — Desktop viewport | [ ] USER MUST CAPTURE THIS SCREENSHOT MANUALLY | `docs/performance/screenshots/11-final-ui-desktop.png` | Full browser window at 1440 × 900 showing polished navigation and hero section |
| **12** | Final application UI — Mobile viewport | [ ] USER MUST CAPTURE THIS SCREENSHOT MANUALLY | `docs/performance/screenshots/12-final-ui-mobile.png` | DevTools Device Mode (iPhone 14 / Pixel 7, 375 × 812) showing mobile navigation and layout |

---

## Step-by-Step Instructions for Capturing DevTools Screenshots

### Capturing Screenshots 5, 6, 7 (Network Chunk Verification):
1. Start the dev server in `Frontend/`:
   ```bash
   npm run dev
   ```
2. Open Google Chrome and navigate to `http://localhost:5173/`.
3. Open Developer Tools (`F12` or `Ctrl+Shift+I`).
4. Select the **Network** tab.
5. Check **Disable cache** and select the **JS** filter button.
6. Hard reload the page (`Ctrl+F5`).
7. **Take Screenshot 5:** Notice that only `index.js` and `Home` modules are loaded. `ProjectsPage` and `ContactPage` are absent.
8. Without refreshing, click **Projects** in the navigation header.
9. **Take Screenshot 6:** Observe the new dynamic request for `ProjectsPage.jsx` appear in the network log.
10. Click **Contact** in the navigation header.
11. **Take Screenshot 7:** Observe the new dynamic request for `ContactPage.jsx` appear in the network log.

### Capturing Screenshots 8 & 9 (Slow 3G Suspense Fallback):
1. In the Network tab, find the throttling dropdown (labeled **No throttling** by default).
2. Change it to **Slow 3G** (or create a custom profile with 400 kbps / 2000 ms latency).
3. Clear the network log (trash/clear icon).
4. Navigate to `http://localhost:5173/projects` or click **Projects**.
5. **Take Screenshot 8:** Capture the screen while `<PageLoader />` ("Loading module...") is actively rendered on screen inside `<Suspense>` before the chunk finishes downloading.
6. Repeat for `http://localhost:5173/contact` to capture **Screenshot 9**.

### Capturing Screenshot 10 (React DevTools Profiler):
1. Open Chrome DevTools > **Profiler** tab (from the React Developer Tools extension).
2. Click the gear icon > ensure "Record why each component rendered" is checked.
3. Click the **Record** button (blue circle).
4. Scroll the page up and down.
5. Click **Stop recording**.
6. **Take Screenshot 10:** The flamegraph confirms `ScrollProgress` updates in isolation while parent `App`, `Navbar`, and active page components remain green/unrendered.
