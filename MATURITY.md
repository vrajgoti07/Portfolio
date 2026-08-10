# Project Maturity & API Architecture Documentation

## Overview
This repository contains a full-stack Task Management application structured as a monorepo consisting of:
- **Backend**: Node.js & Express REST API with MongoDB object data modeling via Mongoose.
- **Frontend**: Modern React single-page web application powered by Vite.

---

## Workspace Structure

```text
AWDF/
├── Backend/
│   ├── models/
│   │   └── Task.js           # Mongoose Data Model for Task Collection
│   ├── .env                  # Environment Variables Configuration
│   ├── .env.example          # Environment Variables Template
│   ├── package.json          # Backend Dependencies & Scripts
│   ├── server.js             # Legacy Express Server (In-Memory Array Storage)
│   └── server_new.js         # Production-ready Express Server (MongoDB Persistent)
├── Frontend/
│   ├── src/                  # React Application Source Code
│   ├── public/               # Static Web Assets
│   └── package.json          # Frontend Dependencies & Scripts
├── postman/
│   └── Task_Manager_API.postman_collection.json # Postman Test Suite
├── package.json              # Monorepo Orchestration Scripts
└── MATURITY.md               # Project Architecture & Maturity Report
```

> [!NOTE]
> `.postman` directory is intentionally excluded from build artifacts as per project specification.

---

## System Maturity Level Assessment

| Level | Dimension | Status | Description |
| :--- | :--- | :---: | :--- |
| **Level 1** | **Core REST Endpoints** | ✅ **Complete** | All basic CRUD routes implemented (`GET`, `POST`, `PUT`, `DELETE`). |
| **Level 2** | **Persistence Layer** | ✅ **Complete** | MongoDB schema definition via Mongoose model (`Backend/models/Task.js`). |
| **Level 3** | **Configuration & Environment** | ✅ **Complete** | Decoupled configuration management via `.env` and `dotenv`. |
| **Level 4** | **Cross-Origin & Middleware** | ✅ **Complete** | Enabled `cors` middleware and structured JSON error response body. |
| **Level 5** | **Testing & API Tooling** | ✅ **Complete** | Exported Postman collection for automated & manual endpoint validation. |

---

## API Documentation

### Base URL
`http://localhost:5000`

### Endpoints Summary

| Method | Endpoint | Description | Request Body | Success Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | API Health Check | None | `200 OK` |
| `GET` | `/tasks` | Retrieve all tasks | None | `200 OK` |
| `GET` | `/tasks/:id` | Get task by MongoDB ID | None | `200 OK` / `404 Not Found` |
| `POST` | `/tasks` | Create a new task | `{ "title": "Task name", "completed": false }` | `201 Created` / `400 Bad Request` |
| `PUT` | `/tasks/:id` | Update task details | `{ "title": "Updated", "completed": true }` | `200 OK` / `404 Not Found` |
| `DELETE` | `/tasks/:id` | Delete task by ID | None | `200 OK` / `404 Not Found` |

---

## Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB Community Server running locally on `mongodb://127.0.0.1:27017`

### Running the Application

1. **Start Backend Service (MongoDB Version)**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start Legacy In-Memory Backend (Optional)**
   ```bash
   cd Backend
   npm start
   ```

3. **Start Frontend Client**
   ```bash
   cd Frontend
   npm run dev
   ```
