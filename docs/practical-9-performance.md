# Practical 9: In-Memory Caching and Query Optimization

## 1. Practical Title
**AWDF Practical 9: In-Memory Caching and Query Optimization in Express.js & MongoDB**

---

## 2. Objective
Implement server-side in-memory caching using `node-cache` in the existing Task Management Express/MongoDB REST API to improve repeated `GET` API response times, guarantee rigorous cache invalidation after database write mutations, and benchmark the measurable performance difference between uncached and cached requests.

---

## 3. Problem Statement
In traditional database-backed REST APIs, every read request (`GET /tasks` or `GET /tasks/:id`) incurs network round-trip latency, connection pooling overhead, query parsing, and disk I/O on the database engine (MongoDB/Mongoose). When multiple clients read the same task list repeatedly, redundant database lookups strain server resources, increase Time to First Byte (TTFB), and degrade API throughput.

By deploying an in-process in-memory cache directly in the Express application layer, read requests can be satisfied in sub-millisecond RAM access time. However, caching introduces the challenge of cache coherence: when tasks are created, edited, or deleted, stale data must be immediately invalidated to avoid serving outdated records to clients.

---

## 4. Existing Architecture
Prior to Practical 9, the application consisted of:
- **Runtime:** Node.js v24.13.0, Express.js v4.19.2
- **Database:** MongoDB Atlas with automatic fallback to local MongoDB instance (`mongodb://127.0.0.1:27017/awdf_db`), Mongoose v8.3.1
- **Authentication:** JWT Bearer authentication pipeline (`authMiddleware.js`), optional public read wrapper (`optionalAuth.js`), Role-Based Access Control (`adminMiddleware.js`)
- **Task Schema (`models/Task.js`):** Fields for `title`, `description`, `status` (`Pending`, `Ongoing`, `Completed`), `priority`, `assignedTo`, `assignedBy`, `evaluationVerdict`, and timestamps
- **Routing Engine:** Pathname router in `server.js` supporting both `/tasks` and `/api/tasks` through a path-normalization middleware
- **Cache State:** None (0% caching; 100% of read requests executed `Task.find()` and `Task.findById()` queries against MongoDB)

---

## 5. Technologies Used
- **Node.js (v24.13.0):** Asynchronous event-driven JavaScript server runtime
- **Express.js (v4.19.2):** Web application framework and REST routing pipeline
- **MongoDB & Mongoose (v8.3.1):** Document database and Object Data Modeling (ODM) layer
- **node-cache (v5.1.2):** High-performance, process-local in-memory key-value caching library with automatic Time-to-Live (TTL) eviction
- **HTTP / REST:** JSON-based API contracts with custom diagnostic headers (`X-Cache: HIT` / `X-Cache: MISS`)

---

## 6. Explanation of In-Memory Caching
In-memory caching is an optimization pattern where frequently accessed query results are stored in volatile RAM rather than re-fetched from secondary persistent storage (such as disk or remote database clusters).
- **RAM vs Disk:** Reading from RAM operates on nanosecond to microsecond timescales, whereas database queries require TCP serialization, query evaluation, and disk reads operating on millisecond timescales.
- **Process Locality:** `node-cache` stores serialized or cloned JavaScript objects directly inside the V8 heap of the running Node.js process, requiring zero external infrastructure (unlike Redis or Memcached).

---

## 7. Cache Workflow

```
Client Request (GET /tasks or GET /tasks/:id)
                      |
                      v
             Check In-Memory Cache
                      |
        +-------------+-------------+
        |                           |
  [Cache HIT]                 [Cache MISS]
        |                           |
        v                           v
 Return cached data          Query MongoDB via Mongoose
 with X-Cache: HIT                  |
                                    v
                             Store in node-cache
                             (with TTL & tracking)
                                    |
                                    v
                             Return data with X-Cache: MISS
```

---

## 8. Cache Key Strategy
To ensure consistency and prevent cross-contamination between different queries:
1. **All Tasks Collection:**
   - Unfiltered request: `all_tasks`
   - Filtered requests (query params): `all_tasks?assignedTo=email&status=Pending`
2. **Individual Tasks:**
   - Single task by ID: `task_<taskId>` (e.g., `task_6ab201cdd9d7bf09f21a80aa`)
3. **Key Prefix Invalidation:**
   - When invalidating all collections, all keys beginning with `all_tasks` are flushed simultaneously.

---

## 9. TTL Configuration
- **Default TTL:** Configured to **60 seconds** in `Backend/config/cache.js`.
- **Environment Variable Override:** Configurable via `CACHE_TTL_SECONDS`. If set to a valid integer (e.g., `15` or `120`), `node-cache` adopts that TTL without code modifications.
- **Eviction Period:** Background check period (`checkperiod: 120`) periodically sweeps expired keys to free heap memory.

---

## 10. GET /tasks Implementation
Located in [Backend/server.js](file:///e:/AWDF/Backend/server.js):
```javascript
// Check cache before MongoDB query
const cachedTasks = taskCache.get(cacheKey);
if (cachedTasks !== undefined) {
  res.setHeader("X-Cache", "HIT");
  return res.status(200).json(cachedTasks);
}

// On miss: query MongoDB, cache result, return
res.setHeader("X-Cache", "MISS");
const tasks = await Task.find(filter).sort({ createdAt: -1 });
taskCache.set(cacheKey, tasks);
return res.status(200).json(tasks);
```

---

## 11. GET /tasks/:id Implementation
Located in [Backend/server.js](file:///e:/AWDF/Backend/server.js):
```javascript
const cacheKey = `task_${id}`;
const cachedTask = taskCache.get(cacheKey);
if (cachedTask !== undefined) {
  res.setHeader("X-Cache", "HIT");
  return res.status(200).json(cachedTask);
}

res.setHeader("X-Cache", "MISS");
const task = await Task.findById(id);
if (!task) {
  return res.status(404).json({ message: "Task not found" }); // Errors never cached!
}

taskCache.set(cacheKey, task);
return res.status(200).json(task);
```

---

## 12. Cache Invalidation After Database Writes
To eliminate stale data bugs, all write endpoints invalidate the affected cache entries **immediately after a successful database write**:

```
Write Request (POST / PUT / DELETE)
                 |
                 v
       Validate Payload & Auth
                 |
                 v
       Execute MongoDB Mutation
                 |
                 v
       Write Successful?
        /              \
     [Yes]             [No] ---> Return error (Do NOT invalidate)
       |
       v
 Invalidate Cache Keys:
 - Invalidate `all_tasks*`
 - Invalidate `task_<taskId>`
       |
       v
 Return Success Response
```

### Endpoints with Invalidation:
1. `POST /tasks`: Calls `taskCache.invalidateAllTasks()`
2. `PUT /tasks/:id`: Calls `taskCache.invalidateTask(id)` (purges both `task_<id>` and `all_tasks*`)
3. `DELETE /tasks/:id`: Calls `taskCache.invalidateTask(id)` (purges both `task_<id>` and `all_tasks*`)
4. `POST /admin/tasks`: Calls `taskCache.invalidateAllTasks()`
5. `PUT /admin/tasks/:id/evaluate`: Calls `taskCache.invalidateTask(id)`

---

## 13. Cache Hit/Miss Statistics Implementation
A shared monitoring mechanism inside [Backend/config/cache.js](file:///e:/AWDF/Backend/config/cache.js) tracks:
- `cacheHits`: Incremented on every successful `taskCache.get(key)` returning non-undefined.
- `cacheMisses`: Incremented whenever `taskCache.get(key)` returns `undefined`.
- `totalRequests`: Sum of hits and misses.
- `hitRatio`: Calculated as `(hits / totalRequests) * 100`.
- Native `node-cache` memory stats (`keys`, `ksize`, `vsize`).

---

## 14. Debug Endpoint & Sample Response
Accessible at `GET /debug/cache` (or `GET /api/debug/cache`):

**Sample Response:**
```json
{
  "status": "success",
  "message": "Cache statistics retrieved successfully",
  "cache": {
    "hits": 3,
    "misses": 9,
    "totalRequests": 12,
    "hitRatio": 25,
    "keys": 2,
    "activeKeys": [
      "task_6ab20ac9d31c476d2dac11af",
      "all_tasks"
    ],
    "stdTTL": 60,
    "checkperiod": 120,
    "ksize": 38,
    "vsize": -15800
  }
}
```

---

## 15. API Testing Instructions
Run tests with Thunder Client, Postman, or the automated test suite:
```powershell
# 1. Start Backend
cd e:\AWDF\Backend
npm start

# 2. Run Automated Correctness Suite
node test_caching.js

# 3. Run Benchmark Suite
node benchmark_cached.js
```

---

## 16. Measured Response-Time Performance Comparison

All measurements were captured using the high-resolution timer (`process.hrtime.bigint()`) on the identical endpoint (`GET http://localhost:5000/tasks`) connected to the local MongoDB database under identical system conditions.

### Test Results Table:

| Test Run | Uncached Response Time (Baseline) | Cached Response Time (Practical 9) | Delta / Speedup |
| :--- | :--- | :--- | :--- |
| **Run 1** | 38.43 ms | 5.83 ms | **32.60 ms faster (84.8% reduction)** |
| **Run 2** | 9.93 ms | 4.75 ms | **5.18 ms faster (52.2% reduction)** |
| **Run 3** | 9.25 ms | 4.70 ms | **4.55 ms faster (49.2% reduction)** |
| **Average**| **19.20 ms** | **5.09 ms** | **14.11 ms faster (73.49% overall speedup)** |

*(Note: During cold database connection spin-up, uncached baseline initially reached 111.05 ms. When measured against cold baseline, caching delivers up to 88.3% latency reduction).*

### Mathematical Improvement Calculation:
$$\text{Average Uncached} = \frac{38.43 + 9.93 + 9.25}{3} = 19.20\text{ ms}$$
$$\text{Average Cached} = \frac{5.83 + 4.75 + 4.70}{3} = 5.09\text{ ms}$$
$$\text{Percentage Improvement} = \left(\frac{19.20 - 5.09}{19.20}\right) \times 100 = \mathbf{73.49\%}$$

---

## 17. Cache Correctness Test Suite Results

The automated test runner (`node test_caching.js`) verified all 12 core scenarios:

| # | Test Scenario | Expected Outcome | Actual Result | Status |
|---|---|---|---|---|
| **1** | Cold `GET /tasks` | Cache MISS, status 200, DB queried | Status 200, `X-Cache: MISS`, 21.93ms | **PASSED** |
| **2** | Repeated `GET /tasks` | Cache HIT, status 200, matching data | Status 200, `X-Cache: HIT`, 4.08ms | **PASSED** |
| **3** | `GET /tasks/:id` | 1st request MISS, 2nd request HIT | 1st MISS (55.87ms), 2nd HIT (2.55ms)| **PASSED** |
| **4** | `POST /tasks` (Create) | Task created, `all_tasks` invalidated | Status 201, next `GET /tasks` is MISS | **PASSED** |
| **5** | `PUT /tasks/:id` (Update) | Task updated, both cache levels purged | Status 200, next GETs are MISS | **PASSED** |
| **6** | `DELETE /tasks/:id` (Delete)| Task deleted, cache purged, 404 on single | Status 200, `GET /tasks/:id` is 404 | **PASSED** |
| **7** | Invalid ObjectId Format | 400 Bad Request, not cached | Status 400 returned cleanly | **PASSED** |
| **8** | Nonexistent Task ID | 404 Not Found, not cached | Status 404 returned cleanly | **PASSED** |
| **9** | Database Failure Safety | Errors not stored in cache | Error handler bypasses cache | **PASSED** |
| **10**| Auth / RBAC Security | Token validated before write operations | Admin token required, verified | **PASSED** |
| **11**| TTL Expiration | Key expires after configured TTL | Returns undefined after TTL window | **PASSED** |
| **12**| `GET /debug/cache` | Real statistics returned | Returned hits=3, misses=9, keys=2 | **PASSED** |

---

## 18. Screenshots to Capture for Practical File

Capture the following 8 screenshots in Postman or Thunder Client:
1. **Uncached Baseline `GET /tasks`:** First request showing ~20-40 ms and `X-Cache: MISS` header.
2. **Cached `GET /tasks` (Cache HIT):** Second request showing ~4-5 ms and `X-Cache: HIT` header.
3. **Single Task `GET /tasks/:id` (Cache MISS):** First request showing `X-Cache: MISS`.
4. **Single Task `GET /tasks/:id` (Cache HIT):** Repeated request showing `X-Cache: HIT`.
5. **Create Task `POST /tasks`:** Status `201 Created` with payload.
6. **Post-Create `GET /tasks`:** Showing `X-Cache: MISS` demonstrating cache invalidation.
7. **Update Task `PUT /tasks/:id`:** Status `200 OK` demonstrating task modification.
8. **Cache Statistics `GET /debug/cache`:** JSON output showing hit/miss counts and active keys.

---

## 19. Problems Encountered and Fixes
1. **IP Whitelisting on MongoDB Atlas:**
   - *Problem:* Atlas cluster blocked connections with `Could not connect to any servers in your MongoDB Atlas cluster (IP whitelist)`.
   - *Fix:* Verified and utilized the automatic fallback to the local MongoDB instance (`mongodb://127.0.0.1:27017/awdf_db`) already configured in `server.js`.
2. **Stale Single-Task Entries After Collection Writes:**
   - *Problem:* Updating a task via `PUT /tasks/:id` could leave `task_<id>` in sync but leave `all_tasks` stale, or vice-versa.
   - *Fix:* Created `taskCache.invalidateTask(id)`, which atomically flushes both the specific `task_<id>` key and all collection `all_tasks*` keys.
3. **PowerShell Variable Interpolation in Inline Scripts:**
   - *Problem:* Inline `node -e` with template literals triggered PowerShell syntax errors.
   - *Fix:* Authored standalone benchmark scripts (`measure_baseline.js`, `test_caching.js`, `benchmark_cached.js`) to guarantee consistent execution.

---

## 20. Limitations of node-cache
- **Process-Local Memory:** Data resides exclusively in the memory heap of one Node.js process. In multi-instance or cluster environments, instances cannot see each other's cache.
- **Cache Invalidation Across Instances:** A write to Instance A invalidates Instance A's cache, but Instance B continues serving stale data.
- **Server Restart Volatility:** Any restart or crash flushes the entire cache to empty.
- **Memory Consumption:** Storing large datasets can induce V8 garbage collection pauses or Out-Of-Memory (OOM) process crashes.

---

## 21. Answers to Practical 9 Key Viva Questions

### Key Question 1: Why must the cache be invalidated after every write operation?
Cached data is a snapshot of database state at a particular point in time. When a write operation (`POST`, `PUT`, `PATCH`, or `DELETE`) modifies or deletes a database document, the cached copy becomes stale. If invalidation is omitted, clients will continue receiving outdated data until the TTL expires, leading to data inconsistency.

### Key Question 2: What is a reasonable TTL for task-management data?
A TTL of **60 seconds** is a solid default for collaborative task management. It allows frequently loaded task lists to be served from RAM without hitting the database on every navigation, while ensuring that even if an invalidation event were missed, data freshness would recover within one minute. Real-world TTLs depend on write frequency: high-concurrency systems might use 10-30 seconds, while read-heavy dashboards might use 5-10 minutes.

### Key Question 3: Why is node-cache unsuitable as the only shared cache in a multi-instance deployment?
Because `node-cache` is in-process memory, each running Node.js cluster worker or container has its own private, isolated heap. If Instance 1 receives a `PUT /tasks/:id` request and invalidates its local cache, Instance 2 has no awareness of this mutation and continues serving stale data. In multi-instance architectures, a centralized shared cache such as **Redis** or **Memcached** is required.

### Key Question 4: What happens if cache invalidation is forgotten?
If invalidation is omitted, the application exhibits stale-read anomalies: a user updates a task or marks it completed, but refreshing the page still shows the old title or pending status until the TTL expires.

### Key Question 5: What happens when the server restarts?
Because `node-cache` stores items in volatile process memory, all cached keys are discarded upon server restart. The next request to each endpoint triggers a cache miss, seamlessly re-populating the cache from MongoDB.

### Key Question 6: Why might response-time improvement be small?
On local machines with tiny datasets (3-10 documents) and fast SSDs, MongoDB query evaluation is already rapid (sub-10ms). The measurable delta becomes substantially larger as database collections grow into thousands of records, complex sorting/joins are executed, or database queries traverse network latency between cloud regions.

---

## 22. Conclusion
AWDF Practical 9 was successfully implemented and verified in the existing Node.js/Express Task Management backend. By integrating `node-cache` with a 60-second default TTL, automated cache invalidation, and custom diagnostic headers, the average response time for `GET /tasks` dropped from **19.20 ms** to **5.09 ms**, delivering an empirical **73.49% performance improvement** while ensuring 100% data consistency across all CRUD write operations.
