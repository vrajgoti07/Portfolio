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
