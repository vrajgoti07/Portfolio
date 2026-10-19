# Practical 10: Asynchronous Processing with Event-Driven Architecture (ITUE301)

## 1. Practical Overview
- **Title:** Practical 10: Asynchronous Processing with Event-Driven Architecture
- **Subject:** Advanced Web Development Frameworks (ITUE301)
- **Objective:** Implement asynchronous background notification processing using Node.js's native `EventEmitter` without external dependencies. Decouple notification delivery from the client-facing HTTP request/response pipeline using `setImmediate()`.

---

## 2. Architecture & Execution Flow

```
                      Client (Thunder Client / Postman)
                                     │
                                     │ 1. POST /tasks
                                     ▼
                      ┌─────────────────────────────┐
                      │    Express Router / Auth    │
                      │  authMiddleware + validator │
                      └──────────────┬──────────────┘
                                     │ 2. Validated
                                     ▼
                      ┌─────────────────────────────┐
                      │   Task Model (MongoDB Save) │
                      │      Task.save()            │
                      └──────────────┬──────────────┘
                                     │ 3. Saved & Timestamped
                                     ▼
                      ┌─────────────────────────────┐
                      │   Immediate HTTP Response   │
                      │  Status: 201 Created (8ms)  │ ──► Client receives
                      └──────────────┬──────────────┘     instant 201 response
                                     │ 4. setImmediate()
                                     ▼
                      ┌─────────────────────────────┐
                      │    TaskEvents.emit()        │
                      │    ('task-created', data)   │
                      └──────────────┬──────────────┘
                                     │ 5. Dispatched to Event Loop Check phase
                                     ▼
                      ┌─────────────────────────────┐
                      │   Notification Listener     │
                      │   - Log start timestamp     │
                      │   - Non-blocking 2s delay   │
                      │   - Log complete timestamp  │
                      └─────────────────────────────┘
```

---

## 3. Implementation Details

### A. Dedicated Event System (`Backend/events.js`)
Extends Node.js native `EventEmitter` from the built-in `events` module. Exports a single shared singleton instance across the application. Zero external queue libraries or packages required.

```javascript
const EventEmitter = require("events");

class TaskEvents extends EventEmitter {}

module.exports = new TaskEvents();
```

### B. Event Listeners (`Backend/listeners.js`)
Registers three core event listeners:
1. **`task-created`**:
   - Logs task title, assigned user, task ID, notification scheduled timestamp, handler start timestamp, and handler completion timestamp in ISO format.
   - Simulates an asynchronous 2-second background processing delay:
     `await new Promise((resolve) => setTimeout(resolve, 2000));`
   - Includes safe `try...catch` error trapping.
2. **`task-deleted`**:
   - Dispatched only when a task is successfully deleted.
   - Logs task ID, task title, deletion timestamp, and handler execution timestamp.
3. **`notification-error`**:
   - Traps background processing exceptions and logs them without crashing the Node.js server process.

### C. Route Integration (`Backend/server.js`)
- **`POST /tasks`**:
  - Validates request payload.
  - Persists task via Mongoose `Task` model.
  - Flushes collection cache keys (`taskCache.invalidateAllTasks()`).
  - Records response timestamp and dispatches HTTP 201 Created to the client immediately.
  - Employs `setImmediate()` to schedule `taskEvents.emit('task-created', ...)` in the background.
- **`DELETE /tasks/:id`**:
  - Validates ObjectId and checks task existence (HTTP 404 if missing, no event emitted).
  - Enforces status locking rules.
  - Deletes task document and returns HTTP 200 OK.
  - Employs `setImmediate()` to schedule `taskEvents.emit('task-deleted', ...)` in the background.

---

## 4. Timestamps & Asynchronous Evidence

From automated test execution (`node test_practical10.js`):

| Metric | Timestamp / Value | Description |
| :--- | :--- | :--- |
| **API Response Sent** | `2026-10-19T08:14:58.853Z` | HTTP 201 response received by client in **8 ms** |
| **Handler Started** | `2026-10-19T08:14:58.854Z` | Notification listener kicked off on next tick |
| **Handler Completed** | `2026-10-19T08:15:00.856Z` | Notification finished exactly ~2002 ms later |
| **Elapsed Processing** | **2002 ms** | Occurred purely in background without blocking HTTP response |

---

## 5. Thunder Client Step-by-Step Testing Guide

### Prerequisites
1. Start the backend:
   ```bash
   cd Backend
   npm start
   # or
   npm run dev
   ```
2. Obtain Admin Bearer Token via Login:
   - **Method:** `POST`
   - **URL:** `http://localhost:5000/login`
   - **Header:** `Content-Type: application/json`
   - **Body:**
     ```json
     {
       "email": "vrajgoti07@gmail.com",
       "password": "123456789"
     }
     ```
   - Copy the `"token"` value from the response.

---

### Request 1: Create a Task (Test 1 & Test 2)
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/tasks`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer <YOUR_ADMIN_TOKEN>`
4. **Body:**
   ```json
   {
     "title": "Complete Practical 10",
     "description": "Implement EventEmitter notifications",
     "assignedTo": "vrajgoti07@gmail.com",
     "status": "Pending",
     "priority": "High"
   }
   ```
5. **Expected Output:**
   - **Status Code:** `201 Created`
   - **Response Time:** Sub-50ms (arrives immediately!)
   - **Server Console:**
     ```text
     ==================================================
     [Notification] Task created
     Title: Complete Practical 10
     Assigned User: vrajgoti07@gmail.com
     Task ID: 6ad5d182cb587dc6831afc08
     Notification Scheduled: 2026-10-19T08:14:58.853Z
     Handler Started: 2026-10-19T08:14:58.854Z
     Handler Completed: 2026-10-19T08:15:00.856Z
     Processing Duration: ~2002 ms
     ==================================================
     ```

---

### Request 2: Delete a Task (Test 3)
1. **Method:** `DELETE`
2. **URL:** `http://localhost:5000/tasks/<COPIED_TASK_ID>`
3. **Headers:**
   - `Authorization: Bearer <YOUR_ADMIN_TOKEN>`
4. **Expected Output:**
   - **Status Code:** `200 OK`
   - **Body:** `{ "message": "Task deleted successfully", ... }`
   - **Server Console:**
     ```text
     ==================================================
     [Notification] Task deleted
     Title: Complete Practical 10
     Task ID: 6ad5d182cb587dc6831afc08
     Deleted At: 2026-10-19T08:15:01.358Z
     Handler Timestamp: 2026-10-19T08:15:01.359Z
     ==================================================
     ```

---

### Request 3: Invalid Task Payload Validation (Test 4)
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/tasks`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer <YOUR_ADMIN_TOKEN>`
4. **Body:**
   ```json
   {
     "title": "",
     "status": "UnknownStatus"
   }
   ```
5. **Expected Output:**
   - **Status Code:** `400 Bad Request`
   - **Body:** `{ "message": "Title is required" }`
   - **Server Console:** No `task-created` event emitted.

---

### Request 4: Delete Nonexistent Task (Test 5)
1. **Method:** `DELETE`
2. **URL:** `http://localhost:5000/tasks/660000000000000000000999`
3. **Headers:**
   - `Authorization: Bearer <YOUR_ADMIN_TOKEN>`
4. **Expected Output:**
   - **Status Code:** `404 Not Found`
   - **Body:** `{ "message": "Task not found" }`
   - **Server Console:** No `task-deleted` event emitted.

---

### Request 5: Notification Error Handling (Test 6)
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/tasks`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer <YOUR_ADMIN_TOKEN>`
4. **Body:**
   ```json
   {
     "title": "[TRIGGER_ERROR] Error Test Task",
     "description": "Trigger simulated background failure",
     "status": "Pending",
     "simulateError": true
   }
   ```
5. **Expected Output:**
   - **Status Code:** `201 Created`
   - **Server Console:**
     ```text
     ==================================================
     [Notification Error] Exception caught inside task-created listener:
     Reason: Simulated background notification failure (Controlled Test Exception)
     Occurred At: 2026-10-19T08:15:01.367Z
     Resilience: Server continues normal operation without crashing.
     ==================================================
     ```
   - **Server Health:** Verify server remains running by sending `GET http://localhost:5000/` (returns `200 OK`).

---

## 6. Theory & Conceptual Analysis

### 1. What is EventEmitter?
Node.js's `EventEmitter` is a core module (`require('events')`) implementing the Publisher/Subscriber (Observer) pattern in memory. It maintains a dictionary of event names mapped to arrays of callback functions and invokes them when `.emit(eventName, ...args)` is called.

### 2. What is Event-Driven Architecture (EDA)?
Event-Driven Architecture is a software design paradigm where system components communicate indirectly by producing, detecting, and consuming events (state changes or occurrences) rather than making tight, coupled direct function calls.

### 3. What is Synchronous Execution?
In synchronous execution, operations execute sequentially. Each instruction blocks thread execution until it completes. If a function takes 2 seconds to complete, the entire thread halts for 2 seconds before the next line runs.

### 4. What is Asynchronous Execution?
In asynchronous execution, long-running tasks (I/O, timers, network requests) are delegated to background subsystem threads or the operating system kernel. The main JavaScript thread continues executing subsequent instructions without blocking. When the task finishes, its callback is scheduled onto the event loop.

### 5. What is the Node.js Event Loop?
The Node.js event loop is a single-threaded infinite loop coordinated by `libuv` that continuously checks and cycles through specific phases:
1. **Timers phase:** Executes callbacks scheduled by `setTimeout()` and `setInterval()`.
2. **Pending callbacks phase:** Executes I/O callbacks deferred from the previous loop iteration.
3. **Idle / Prepare phase:** Internal housekeeping.
4. **Poll phase:** Retrieves new I/O events and executes I/O related callbacks.
5. **Check phase:** Executes callbacks registered with `setImmediate()`.
6. **Close callbacks phase:** Handles close events (e.g. `socket.on('close')`).

### 6. Why can Database Operations be Awaited?
Database operations involve network I/O across sockets. The MongoDB driver returns a `Promise`. In JavaScript, `await` pauses execution of the surrounding `async` function while releasing the event loop to service other incoming HTTP requests until the promise resolves.

### 7. Does EventEmitter.emit() execute listeners asynchronously?
**NO.** This is one of the most common misconceptions in Node.js. `EventEmitter.prototype.emit()` iterates over the array of registered callback functions and invokes each one **synchronously in the order they were registered**. If a listener contains a synchronous loop, it will freeze the caller.

### 8. Why do we use setImmediate() in this implementation?
Because `emit()` is synchronous, calling `emit()` directly in the HTTP handler before or after `res.send()` would initiate listener execution on the current tick. By wrapping `emit()` inside `setImmediate(() => taskEvents.emit(...))`, we explicitly instruct the event loop to queue the event emission in the **Check phase** on the next iteration. This guarantees that the HTTP response is finalized, sent across the TCP socket, and completed on the client side before background processing begins.

### 9. Why is notification processing separated from the API route?
1. **Separation of Concerns (SoC):** The API controller is responsible only for validating requests, updating persistence, and returning an HTTP status. It should not know how or when notifications, emails, or audits are handled.
2. **Response Latency:** Slow notification channels (e.g., email dispatch, external webhooks, SMS gateways) should never bloat the client's HTTP request duration.
3. **Fault Isolation:** A failure in sending a notification should not cause a database rollback or convert a successful task creation into an HTTP 500 server error.

### 10. What is the difference between EventEmitter and a Message Queue?
| Feature | Node.js EventEmitter | Distributed Message Queue (RabbitMQ / BullMQ / Kafka) |
| :--- | :--- | :--- |
| **Scope** | In-process (single Node.js memory space) | External distributed service (cross-process / multi-server) |
| **Durability** | Ephemeral (events in memory are lost if server restarts) | Persistent (messages saved to disk / Redis) |
| **Retries & DLQ** | No built-in retry or dead-letter queue mechanism | Native automatic retries, backoff, and Dead Letter Queues |
| **Worker Scaling** | Bound to the single process | Can distribute load across dozens of background worker nodes |
| **Overhead** | Zero extra dependencies or infrastructure | Requires managing external brokers (Redis, RabbitMQ cluster) |

### 11. Why is EventEmitter appropriate for this practical?
For an academic assignment and lightweight notification decoupled processing, `EventEmitter` is ideal because:
- It requires **zero external infrastructure** (no Redis, Docker, or broker setup).
- It introduces **zero new npm dependencies**.
- It clearly demonstrates event-driven decoupling and event-loop scheduling principles.

### 12. What are its limitations for large production systems?
1. **Process Crash Loss:** Any events in flight during a server crash or container restart are permanently lost.
2. **Memory Overload:** If events are produced faster than listeners can process them, Node.js process memory grows indefinitely.
3. **No Horizontal Scaling:** If the backend is scaled to multiple cluster instances or container replicas, an event emitted on Instance A cannot be received by a listener running on Instance B.
4. **Single Thread Bottleneck:** CPU-heavy listener tasks run on the same event loop and can block incoming API traffic.

---

## 7. Deliverables Checklist

- [x] `Backend/events.js` created with `TaskEvents` extending `EventEmitter`.
- [x] `Backend/listeners.js` created with `task-created`, `task-deleted`, and `notification-error` listeners.
- [x] `Backend/server.js` updated to import and register listeners before accepting requests.
- [x] `POST /tasks` decoupled with `setImmediate()`, returning 201 immediately with 2-second simulated delay in listener.
- [x] `DELETE /tasks/:id` integrated with `setImmediate()` emitting `task-deleted`.
- [x] Controlled error simulation hook safely handled without crashing the server process.
- [x] Automated test suite `Backend/test_practical10.js` created and validated (all 6 tests passing).
- [x] npm script `"test:p10"` added to `Backend/package.json`.
- [x] Comprehensive Thunder Client testing documentation with real endpoints and payloads.
