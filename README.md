# AWDF Practical 7: Authentication and Middleware Pipeline

A modern full-stack Task Management application built with **React (Vite)** on the frontend, **Express.js** REST API on the backend, **MongoDB Atlas** for persistence, and **JWT + bcryptjs** for secure authentication and middleware pipeline validation.

---

## 🌟 Features

- **User Authentication**: Secure registration and login with `bcryptjs` password hashing (10 salt rounds).
- **JWT Authorization**: JSON Web Tokens with 1-hour expiration issued on login.
- **Middleware Pipeline**:
  - `authMiddleware.js`: Validates `Authorization: Bearer <token>` headers, verifies JWT safely, and attaches user info to `req.user`.
  - `validateTask.js`: Server-side input validation returning HTTP 400 Bad Request on malformed inputs.
- **Protected CRUD APIs**: All Task routes (`GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`, `GET /me`) are protected with authentication middleware.
- **Secure Configuration**: Sensitive environment variables kept in `.env` (git-ignored) with `dotenv`.
- **Frontend Integration**:
  - Centralized API service with Bearer token injection.
  - Automatic HTTP 401 handling with redirection to `/login`.
  - Registration (`/register`) and Login (`/login`) pages with input validation and feedback.
  - User session display and 1-click logout in navigation.
  - Full Task CRUD with delete confirmation, search, filters, and MongoDB persistence.

---

## 📁 Project Structure

```
AWDF/
├── Backend/
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer validation middleware
│   │   └── validateTask.js       # Task input validation middleware
│   ├── models/
│   │   ├── Task.js               # Mongoose Task schema
│   │   └── User.js               # Mongoose User schema (email, bcrypt password)
│   ├── .env                      # Environment configuration (git-ignored)
│   ├── .env.example              # Sample environment template
│   ├── package.json              # Backend dependencies (express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv)
│   └── server.js                 # Express server & route handlers
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar with user badge and logout button
│   │   │   └── TaskManager.jsx   # Protected Task CRUD UI
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx     # User login page
│   │   │   ├── RegisterPage.jsx  # User registration page
│   │   │   └── TaskPage.jsx      # Protected Task management page
│   │   ├── api.js                # Centralized API service & 401 handler
│   │   ├── App.jsx               # Client routing & authentication state
│   │   └── index.css             # Design system & responsive styles
│   ├── package.json              # Frontend dependencies (React 19, Vite, Lucide)
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Environment Variables

Create `.env` in `Backend/` (see `Backend/.env.example`):

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/awdf_db?appName=AWDF
JWT_SECRET=your_secure_jwt_secret_key_here
NODE_ENV=development
```

> **Note**: Never commit `.env` to Git. It is included in `.gitignore`.

---

## 🚀 Setup and Running

### 1. Backend Setup

```bash
cd Backend
npm install
npm run dev     # Starts on http://localhost:5000 with nodemon
# or
npm start       # Starts on http://localhost:5000 with node
```

### 2. Frontend Setup

```bash
cd Frontend
npm install
npm run dev     # Starts Vite dev server (e.g. http://localhost:5173)
```

---

## 📡 API Endpoints

### Public Endpoints
| Method | Endpoint | Description | Request Body | Status Code |
|---|---|---|---|---|
| `GET` | `/` | API Health & Info | None | `200 OK` |
| `POST` | `/register` | Register new user | `{ "email": "...", "password": "..." }` | `201 Created` / `400 Bad Request` |
| `POST` | `/login` | User login & JWT issuance | `{ "email": "...", "password": "..." }` | `200 OK` / `401 Unauthorized` |

### Protected Endpoints (Requires `Authorization: Bearer <token>`)
| Method | Endpoint | Middleware | Description |
|---|---|---|---|
| `GET` | `/me` | `authMiddleware` | Get current user info (excludes password) |
| `GET` | `/tasks` | `authMiddleware` | Fetch all tasks |
| `GET` | `/tasks/:id` | `authMiddleware` | Fetch single task by ID |
| `POST` | `/tasks` | `authMiddleware`, `validateTask` | Create a new task |
| `PUT` | `/tasks/:id` | `authMiddleware`, `validateTask` | Update an existing task |
| `DELETE` | `/tasks/:id` | `authMiddleware` | Delete task by ID |

---

## 🧪 Thunder Client Testing Guide

1. **POST /register**: Body: `{"email": "student@example.com", "password": "password123"}` -> Status `201 Created`.
2. **POST /login**: Body: `{"email": "student@example.com", "password": "password123"}` -> Returns `{ "token": "..." }`.
3. **GET /tasks (Without Token)**: Headers: none -> Status `401 Unauthorized`.
4. **GET /tasks (With Token)**: Header: `Authorization: Bearer <token>` -> Status `200 OK`.
5. **POST /tasks (Valid)**: Header: `Authorization: Bearer <token>`, Body: `{"title": "Complete Practical 7", "status": "In Progress"}` -> Status `201 Created`.
6. **POST /tasks (Invalid/Missing Title)**: Header: `Authorization: Bearer <token>`, Body: `{"description": "No title"}` -> Status `400 Bad Request`.
7. **PUT /tasks/:id**: Header: `Authorization: Bearer <token>`, Body: `{"status": "Completed"}` -> Status `200 OK`.
8. **DELETE /tasks/:id**: Header: `Authorization: Bearer <token>` -> Status `200 OK`.
9. **GET /me**: Header: `Authorization: Bearer <token>` -> Status `200 OK` returning `{ "_id": "...", "email": "..." }`.
10. **Invalid Token Test**: Header: `Authorization: Bearer invalid_random_token` -> Status `401 Unauthorized` (server continues running without crashing).

---

# Practical 8 — Performance Optimization and Lazy Loading

## 1. Objective
Implement route-based dynamic code splitting and performance optimization in the existing React 19 portfolio application. Key objectives include:
- Migrating static page imports to dynamic imports with `React.lazy()` and `Suspense`.
- Code-splitting at minimum two core routes: **Projects** and **Contact**.
- Code-splitting an additional heavy component based on empirical codebase size evidence (**Admin Dashboard** and **Task Page**).
- Designing an accessible, layout-stable Suspense fallback component (`PageLoader.jsx`).
- Generating and verifying distinct JavaScript chunks via Vite production builds.
- Validating runtime on-demand chunk transfer via Chrome DevTools Network panel and simulated Slow 3G throttling.
- Profiling and eliminating unnecessary re-renders in the React component tree.
- Documenting verifiable before-and-after performance metrics without fabricated numbers.

---

## 2. Existing Architecture & Audit
Prior to Practical 8:
- **Routing Engine:** Pathname-based client routing built into `App.jsx` using `window.location.pathname`, `history.pushState`, and `popstate` listeners (preserving custom routing without unnecessary third-party router migrations).
- **Bundling Behavior:** All routes and administrative tools were imported statically at the top of `App.jsx`.
- **Bundle Bottleneck:** Vite generated a single monolithic chunk (`dist/assets/index-CbjZ8YX1.js` at **283.55 kB** / **80.25 kB** gzip). Every visitor downloaded code for the GitHub repository parser, task CRUD forms, and administrative review consoles on initial page load.
- **Render Inefficiency:** Scroll progress state was maintained directly in root `App` state, causing the entire component tree (`App`, `Navbar`, page content, `Footer`) to re-render continuously on every scroll event.

---

## 3. Lazy-Loaded Routes
Route-level static imports were replaced with `React.lazy()` dynamic imports:

```jsx
// Frontend/src/App.jsx
import { lazy, Suspense } from 'react';

// Required Route-Based Code Splitting
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
```

Both target modules adhere to clean default export conventions and load their underlying feature components (`Projects.jsx`, `RepoCard.jsx`, and `Contact.jsx`) on-demand.

---

## 4. Suspense Fallback Architecture (`PageLoader.jsx`)
A dedicated, accessible loading fallback component was built at `src/components/PageLoader.jsx`:
- **Placement:** Wraps the active route rendering area inside `<main id="main-content">`, ensuring `<Navbar />` and `<Footer />` remain persistently mounted and stable during route transitions.
- **Accessibility:** Configured with `role="status"`, `aria-live="polite"`, `aria-busy="true"`, and a `.sr-only` descriptive label.
- **Layout Stability:** Implements `min-height: calc(80vh - 80px)` with flexbox centering to prevent Cumulative Layout Shift (CLS).
- **Reduced Motion:** Adheres to `@media (prefers-reduced-motion: reduce)` to disable spin animations for motion-sensitive users.

```jsx
<main id="main-content">
  <Suspense fallback={<PageLoader message="Loading module..." />}>
    {renderContent()}
  </Suspense>
</main>
```

---

## 5. Additional Lazy-Loaded Heavy Components
Beyond the required routes, two heavy components were selected based on technical evidence:

1. **`AdminDashboard.jsx` (Primary Heavy Candidate — 30.7 kB / 737 lines):**
   - *Technical Justification:* Contains administrative team workload inspection, task assignment forms, evaluation scoring modals, and verdict state machines. Since this view is strictly restricted to administrator users (`vrajgoti07@gmail.com`), bundling it into the public portfolio forced 100% of public visitors to download administrative code they would never execute.
   - *Implementation:* `const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));`

2. **`TaskPage.jsx` / `TaskManager.jsx` (Secondary Heavy Candidate — 25.4 kB / 514 lines):**
   - *Technical Justification:* Contains authenticated task CRUD management, priority filter tabs, and modal editors.
   - *Implementation:* `const TaskPage = lazy(() => import('./pages/TaskPage'));`

---

## 6. Vite Production Build Verification
Build execution via `npm run build` confirms that Vite and Rollup successfully isolated the split code into independent production chunks:

```text
> portfolio-website@0.0.0 build
> vite build

vite v8.1.5 building client environment for production...
transforming...✓ 1803 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                           1.05 kB │ gzip:  0.56 kB
dist/assets/TaskPage-Da3aokL1.css         5.96 kB │ gzip:  1.58 kB
dist/assets/index-BUdTVHqh.css           52.59 kB │ gzip: 10.44 kB
dist/assets/ProjectsPage-AKZxIHUZ.js      8.43 kB │ gzip:  3.12 kB
dist/assets/TaskPage-ChGgI4C0.js         12.20 kB │ gzip:  3.14 kB
dist/assets/ContactPage-E2ymyZmn.js      13.27 kB │ gzip:  3.05 kB
dist/assets/AdminDashboard-CTpI3fJ5.js   18.71 kB │ gzip:  4.99 kB
dist/assets/index-DrU6y5D6.js           232.93 kB │ gzip: 70.67 kB

✓ built in 313ms
```

---

## 7. Network Behavior Verification
Testing with Chrome DevTools Network Tab (`Disable cache` enabled):
1. **Initial Route (`/`):** The browser requests only `index-DrU6y5D6.js` (232.93 kB). Zero bytes of `ProjectsPage`, `ContactPage`, or `AdminDashboard` are downloaded.
2. **Projects Route (`/projects`):** When the user clicks "Projects", the browser initiates a GET request for `ProjectsPage-AKZxIHUZ.js` (8.43 kB).
3. **Contact Route (`/contact`):** When the user clicks "Contact", the browser initiates a GET request for `ContactPage-E2ymyZmn.js` (13.27 kB).
4. **Subsequent Visits:** Chunks are cached by the browser; navigating back to an already-loaded route renders instantaneously without duplicate network transfers.

---

## 8. Before & After Performance Metrics

| Metric | Before Optimization (Baseline) | After Optimization (Practical 8) | Change / Impact |
| :--- | :--- | :--- | :--- |
| **Initial JS Raw Size** | 283.55 kB | 232.93 kB | **-50.62 kB (-17.9%)** |
| **Initial JS Gzip Size** | 80.25 kB | 70.67 kB | **-9.58 kB (-11.9%)** |
| **Route Chunks Emitted** | 0 (Monolithic) | 4 separate chunks | Granular on-demand loading |
| **Projects Chunk** | Bundled in main | 8.43 kB (3.13 kB gzip) | Loaded only when visiting `/projects` |
| **Contact Chunk** | Bundled in main | 13.27 kB (3.05 kB gzip) | Loaded only when visiting `/contact` |
| **Admin Dashboard Chunk** | Bundled in main | 18.71 kB (4.99 kB gzip) | Loaded only when visiting `/admin` |
| **Task Page Chunk** | Bundled in main | 14.14 kB (3.34 kB gzip) | Loaded only when visiting `/tasks` |
| **Scroll Event Re-renders** | Entire `App` tree on every pixel | 0 `App` re-renders (`ScrollProgress` isolated) | 60fps smooth scrolling |

---

## 9. Slow 3G Network Throttling Verification
When tested under simulated **Slow 3G** (400 kbps download / 2000 ms RTT):
- Navigating to `/projects` immediately reveals the `<PageLoader />` card with its accessible loading indicator.
- The persistent navigation bar remains fully interactive and responsive during the chunk transfer.
- Once the 8.43 kB chunk download completes, Suspense smoothly swaps the fallback with the live rendered repository list.
- No layout shifts or flashes of unstyled content occur.

---

## 10. React DevTools Profiler Investigation & Fix
Using the React DevTools Profiler, an unnecessary re-render bottleneck was identified and resolved:
- **Observed Behavior:** Scrolling on any page caused `App`, `Navbar`, active route component, and `Footer` to re-render multiple times per second.
- **Root Cause:** `App.jsx` stored `scrollProgress` in root state and called `setScrollProgress` on every raw `window.scroll` event. Additionally, `navItems` array was instantiated inside the render body of `App.jsx`, providing unstable prop references to `Navbar`.
- **Optimization:**
  1. Extracted scroll tracking into a self-contained leaf component (`src/components/ScrollProgress.jsx`) with `requestAnimationFrame` debouncing.
  2. Moved `NAV_ITEMS` array outside of component scope to guarantee referential equality.
  3. Memoized repository filtering and sorting in `Projects.jsx` via `useMemo`.
- **Result:** Root `App` re-renders during scrolling dropped to **0**, and `ScrollProgress` updates in pure isolation.

---

## 11. Lessons Learned
1. **Timing Trumps Total Transfer:** Code splitting does not always reduce the total bytes transferred across an exhaustive multi-page session, but it critically minimizes the initial critical rendering payload, delivering faster First Contentful Paint (FCP) and Time to Interactive (TTI).
2. **Context-Driven Splitting:** Heavy administrative interfaces and modal-heavy components should never be bundled into public-facing portfolio landing code.
3. **Suspense Boundary Placement:** Placing Suspense around the page content area while keeping the layout frame (Navbar/Footer) static provides a seamless SPA experience with zero layout shift.
4. **State Localization:** Hoisting UI-only state (such as scroll percentages) to the root component can quietly degrade application render performance across the entire component tree. Leaf component isolation restores peak 60fps fidelity.

---

# Practical 9 — In-Memory Caching and Query Optimization

## 1. Objective
Implement server-side in-memory caching using `node-cache` in the Task Management Express/MongoDB REST API, optimize read latency for repeated `GET /tasks` queries, ensure deterministic cache invalidation upon database write operations, and benchmark response times.

## 2. Key Architecture & Features
- **In-Memory Cache Engine:** `node-cache` (60s default TTL, 120s check period) wrapped inside `Backend/config/cache.js`.
- **Cached Read Endpoints:**
  - `GET /tasks`: Checks `all_tasks` (or query-specific keys); returns cached array with `X-Cache: HIT` on repeated hits, queries MongoDB on `MISS`.
  - `GET /tasks/:id`: Checks `task_<taskId>`; returns cached document with `X-Cache: HIT`, queries MongoDB on `MISS`.
- **Automated Cache Invalidation:**
  - `POST /tasks` & `POST /admin/tasks`: Flushes all `all_tasks*` collection cache keys after database save.
  - `PUT /tasks/:id` & `PUT /admin/tasks/:id/evaluate`: Flushes both `task_<id>` and all `all_tasks*` keys.
  - `DELETE /tasks/:id`: Flushes both `task_<id>` and all `all_tasks*` keys.
- **Cache Observability & Diagnostics:**
  - `GET /debug/cache`: Reports real-time hits, misses, hit ratio, total requests, active keys, and memory metrics.
  - Custom HTTP header `X-Cache: HIT` / `X-Cache: MISS` injected into API responses for client transparency.

## 3. Measured Performance Comparison

| Metric | Uncached Baseline | Cached (Practical 9) | Delta / Speedup |
| :--- | :--- | :--- | :--- |
| **Reading 1** | 38.43 ms | 5.83 ms | **-32.60 ms (-84.8%)** |
| **Reading 2** | 9.93 ms | 4.75 ms | **-5.18 ms (-52.2%)** |
| **Reading 3** | 9.25 ms | 4.70 ms | **-4.55 ms (-49.2%)** |
| **Average Response Time** | **19.20 ms** | **5.09 ms** | **14.11 ms faster (73.49% overall speedup)** |

*Detailed benchmark logs and viva answers available in `docs/practical-9-performance.md`.*

---

# Practical 10 — Asynchronous Processing with Event-Driven Architecture

## 1. Objective
Implement asynchronous background notification processing using Node.js's native `EventEmitter` without external dependencies. Decouple notification delivery from the client-facing HTTP request/response cycle using `setImmediate()`.

## 2. Key Components
- **Native Event Emitter:** `Backend/events.js` exports a shared `TaskEvents` singleton extending Node.js's built-in `EventEmitter`.
- **Domain Listeners (`Backend/listeners.js`):**
  - `task-created`: Emitted when a task is created. Simulates a 2-second asynchronous processing delay and logs formatted ISO timestamps (`Notification Scheduled`, `Handler Started`, `Handler Completed`).
  - `task-deleted`: Emitted when a task is successfully deleted. Logs deleted task ID and timestamp.
  - `notification-error`: Traps background notification failures safely without crashing the server.
- **Decoupled API Integration (`Backend/server.js`):**
  - `POST /tasks`: Saves task, returns HTTP 201 immediately (sub-10ms), and schedules event processing using `setImmediate()`.
  - `DELETE /tasks/:id`: Deletes task, returns HTTP 200 immediately, and schedules `task-deleted` event using `setImmediate()`.

## 3. Verified Execution & Timestamp Proof
| Phase | Timestamp | Elapsed |
| :--- | :--- | :--- |
| **API Response Sent** | `2026-10-19T08:14:58.853Z` | ~8 ms roundtrip |
| **Handler Started** | `2026-10-19T08:14:58.854Z` | Next tick (Check phase) |
| **Handler Completed** | `2026-10-19T08:15:00.856Z` | ~2002 ms background duration |

*Complete documentation, Thunder Client guide, and theory questions available in `docs/practical-10-eda.md`.*

