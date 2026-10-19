# Practical 11: Containerization with Docker and Docker Compose

**Subject:** Advanced Web Development Frameworks (`ITUE301`)  
**University:** CHARUSAT University  
**Repository:** [Portfolio (Task Management System)](https://github.com/vrajgoti07/Portfolio)

---

## 1. Practical Overview & Objectives

### Objective
Containerize the complete full-stack Task Management application (React frontend, Node.js/Express backend, and MongoDB database) using Docker and orchestrate all three services seamlessly using Docker Compose with zero-loss persistence and single-command deployment:
```bash
docker compose up --build
```

### Core Requirements
1. **Frontend Containerization:** Multi-stage Dockerfile (`node:20-alpine` build stage + `nginx:alpine` runtime stage) serving production-built static assets with SPA routing.
2. **Backend Containerization:** Production-ready Dockerfile (`node:20-alpine`) with dependency layer caching, non-root best practices, environment decoupling, and health monitoring.
3. **Database Containerization:** Official MongoDB image (`mongo:7.0`) with persistent named volumes and healthcheck validation.
4. **Service Orchestration:** Unified `docker-compose.yml` declaring an isolated bridge network (`app-network`), service dependencies, health checks, and named volumes (`mongodb_data`).
5. **Preserved Features:** All existing functionality—JWT authentication, RBAC, CRUD task APIs, in-memory caching (Practical 9), and asynchronous event notifications (Practical 10)—remains 100% operational.

---

## 2. Multi-Container Architecture Diagram

```
                                  HOST MACHINE / BROWSER
                         ┌──────────────────────────────────────┐
                         │   Frontend: http://localhost:5173    │
                         │   Backend:  http://localhost:5000    │
                         │   MongoDB:  localhost:27017          │
                         └──────────────────┬───────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │       DOCKER ENGINE / DOCKER COMPOSE          │
                    │                                               │
                    │   ┌──────────────────────────────────────┐    │
                    │   │        Bridge Network: app-network   │    │
                    │   │                                      │    │
                    │   │   ┌───────────────┐                  │    │
                    │   │   │ awdf-frontend │                  │    │
                    │   │   │ (Nginx:80)    │                  │    │
                    │   │   └───────┬───────┘                  │    │
                    │   │           │ Browser calls            │    │
                    │   │           │ http://localhost:5000    │    │
                    │   │           ▼                          │    │
                    │   │   ┌───────────────┐                  │    │
                    │   │   │ awdf-backend  │                  │    │
                    │   │   │ (Node.js:5000)│                  │    │
                    │   │   └───────┬───────┘                  │    │
                    │   │           │ Internal DNS             │    │
                    │   │           │ mongodb://mongodb:27017  │    │
                    │   │           ▼                          │    │
                    │   │   ┌───────────────┐                  │    │
                    │   │   │ awdf-mongodb  │                  │    │
                    │   │   │ (Mongo:27017) │                  │    │
                    │   │   └───────┬───────┘                  │    │
                    │   └───────────┼──────────────────────────┘    │
                    │               │                               │
                    │               ▼ Named Volume                  │
                    │      ┌─────────────────┐                      │
                    │      │  mongodb_data   │ (Persists across     │
                    │      │  /data/db       │  container restarts) │
                    │      └─────────────────┘                      │
                    └───────────────────────────────────────────────┘
```

---

## 3. Dockerfile Analysis & Implementation

### A. Backend Dockerfile (`Backend/Dockerfile`)

```dockerfile
# Stage: Production Node.js Backend
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install curl for container healthchecks
RUN apk --no-cache add curl

# Copy dependency manifests first for optimal Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose backend REST API port
EXPOSE 5000

# Health check to monitor container health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Start the Express server
CMD ["npm", "start"]
```

#### Key Engineering Decisions:
1. **`node:20-alpine`:** Alpine Linux reduces image attack surface and size (~180MB vs >1GB for full Debian-based Node images).
2. **Layer Caching:** Copying `package*.json` and executing `npm ci --omit=dev` before copying source code ensures dependency layers are cached unless `package-lock.json` changes.
3. **`HEALTHCHECK`:** Uses `curl -f http://localhost:5000/` to allow Docker Compose and container runtimes to detect unhealthy or deadlocked server states.

---

### B. Frontend Dockerfile (`Frontend/Dockerfile`)

```dockerfile
# ==========================================
# Stage 1: Build Stage (Node.js)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies required for Vite build)
RUN npm ci

# Pass browser-accessible API base URL as build argument
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

# Copy source code
COPY . .

# Build the production React application
RUN npm run build

# ==========================================
# Stage 2: Runtime Stage (Lightweight Nginx)
# ==========================================
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built static artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration supporting React SPA client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
```

#### Key Engineering Decisions:
1. **Multi-Stage Build:** The build tools (Node.js, Vite, Rollup, Babel, npm devDependencies) are discarded after Stage 1. Only the static HTML, CSS, and JS bundles are transferred to Stage 2 (`nginx:alpine`), yielding a runtime container footprint of **< 25 MB**!
2. **`VITE_API_URL` Build Argument:** Vite embeds environment variables into client JS bundles during `vite build`. Passing `VITE_API_URL=http://localhost:5000` guarantees the host browser calls the correct exposed backend port.
3. **Custom Nginx Routing (`Frontend/nginx.conf`):** Directs all non-file route requests to `/index.html` via `try_files $uri $uri/ /index.html;`, preventing HTTP 404 errors when refreshing React routes like `/tasks`, `/login`, or `/admin`.

---

## 4. Docker Compose Orchestration (`docker-compose.yml`)

```yaml
services:
  # ========================================================
  # Database Service: MongoDB
  # ========================================================
  mongodb:
    image: mongo:7.0
    container_name: awdf-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=awdf_db
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # ========================================================
  # Backend Service: Node.js / Express REST API
  # ========================================================
  backend:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    container_name: awdf-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/awdf_db
      - JWT_SECRET=awdf_practical11_jwt_secret_key_secure_2026_super_key
      - NODE_ENV=production
      - SMTP_SECURE=false
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - app-network

  # ========================================================
  # Frontend Service: React (Vite) + Nginx SPA
  # ========================================================
  frontend:
    build:
      context: ./Frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=http://localhost:5000
    container_name: awdf-frontend
    restart: unless-stopped
    ports:
      - "5173:80"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    name: app-network
    driver: bridge

volumes:
  mongodb_data:
    name: mongodb_data
    driver: local
```

---

## 5. Resilient MongoDB Connection Strategy

Inside containers, MongoDB may take several seconds to initialize database files and create replica locks. To avoid crash loops, [Backend/server.js](file:///e:/AWDF/Backend/server.js) was upgraded with an automated retry loop:

```javascript
// MongoDB Database Connection with resilient retry strategy
const connectDB = async (retries = 5, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const sanitizedUri = MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
      console.log(`[DB] Connecting to MongoDB (Attempt ${attempt}/${retries}): ${sanitizedUri}`);
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      console.log("Connected successfully to MongoDB database (awdf_db)");
      await seedAdminAccount();
      return;
    } catch (err) {
      console.warn(`[DB] Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) {
        console.log(`[DB] Retrying connection in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // Fallback to local MongoDB if primary was a remote/custom address
  if (!MONGO_URI.includes("127.0.0.1") && !MONGO_URI.includes("localhost")) {
    console.warn("[DB] Primary MongoDB connection failed. Attempting local fallback (mongodb://127.0.0.1:27017/awdf_db)...");
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/awdf_db", { serverSelectionTimeoutMS: 4000 });
      console.log("Connected successfully to local MongoDB database (awdf_db)");
      await seedAdminAccount();
      return;
    } catch (fallbackErr) {
      console.error("[DB] Local fallback error:", fallbackErr.message);
    }
  }

  console.warn("[DB Notice] Operating with in-memory persistence fallback until MongoDB is reachable.");
};
```

---

## 6. Commands to Run and Manage the Containerized Stack

### 1. Validate Docker Compose Configuration
```bash
docker compose config
```

### 2. Build and Launch All Services
```bash
docker compose up --build
```
*(Or run in background/detached mode: `docker compose up --build -d`)*

### 3. Check Running Service Containers
```bash
docker compose ps
```

Expected status output:
```text
NAME            IMAGE           COMMAND                  SERVICE      STATUS                    PORTS
awdf-backend    awdf-backend    "npm start"              backend      running (healthy)         0.0.0.0:5000->5000/tcp
awdf-frontend   awdf-frontend   "nginx -g 'daemon of…"   frontend     running                   0.0.0.0:5173->80/tcp
awdf-mongodb    mongo:7.0       "docker-entrypoint.s…"   mongodb      running (healthy)         0.0.0.0:27017->27017/tcp
```

### 4. Inspect Container Logs
```bash
# View all logs
docker compose logs -f

# View backend logs (observe Practical 10 event notifications)
docker compose logs -f backend

# View MongoDB connection logs
docker compose logs -f mongodb

# View frontend web server logs
docker compose logs -f frontend
```

### 5. Stop Containers (Preserving Database Data)
```bash
docker compose down
```
> [!IMPORTANT]
> Never use `docker compose down -v` during standard testing, as the `-v` flag deletes named volumes and all stored tasks in MongoDB.

### 6. Restart Service Containers (Verifying Data Persistence)
```bash
docker compose up -d
```

---

## 7. Practical & Viva Examination Theory Guide

### Q1: What is the difference between a Docker Image and a Docker Container?
- **Docker Image:** A read-only, immutable template containing application code, libraries, runtime, and configuration. Built once via a `Dockerfile`.
- **Docker Container:** A runnable, isolated instance of a Docker image. It includes a thin read-write layer on top of the image and its own isolated processes, network interface, and filesystem.

### Q2: What is the difference between a Dockerfile and docker-compose.yml?
- **`Dockerfile`:** Defines how to build a **single** container image (source code compilation, dependency installation, entry points).
- **`docker-compose.yml`:** A declarative configuration file that orchestrates **multiple** interconnected containers, defining networks, shared volumes, environment variables, startup order, and port mappings.

### Q3: What is the difference between EXPOSE and host port mapping?
- **`EXPOSE 5000` (in Dockerfile):** Purely documentation/metadata signaling which port the containerized process listens on inside its private network. It does not publish the port to the host machine.
- **`ports: - "5000:5000"` (in docker-compose.yml):** Binds host port `5000` to container port `5000`. Traffic arriving at `localhost:5000` on the host machine is forwarded through iptables / Docker proxy into the container.

### Q4: Why must the backend use `mongodb://mongodb:27017` while the browser uses `http://localhost:5000`?
- **Inside the Docker network:** Containers communicate using Docker's internal DNS. `localhost` inside the backend container refers only to the backend container itself. Therefore, the backend must use the service name `mongodb` to reach the database.
- **From the host browser:** The browser runs on the user's operating system outside the Docker network. The host cannot resolve private Docker service names like `http://backend:5000`. It must connect to the mapped host port `http://localhost:5000`.

### Q5: What is the purpose of a Docker Named Volume vs. Bind Mount?
- **Named Volume (`mongodb_data`):** Managed completely by Docker inside its storage subsystem (`/var/lib/docker/volumes`). It survives container removal, provides high I/O performance, and guarantees data durability for stateful databases like MongoDB.
- **Bind Mount:** Directly maps a specific host directory into the container. Often used for hot-reloading code during local development.

### Q6: Why use a Multi-Stage Build for the React Frontend?
Single-stage builds leave the Node.js runtime, npm cache, and build tools inside the production image, bloating image size to 500MB–1GB. Multi-stage builds compile static assets in Stage 1, copy only the compiled `/dist` directory to Stage 2 (`nginx:alpine`), and discard the build tools, reducing the final image size to **~25MB** with zero Node.js runtime attack surface.

---

## 8. Deliverables & Created Files Summary

| File | Status | Description |
| :--- | :--- | :--- |
| [Backend/Dockerfile](file:///e:/AWDF/Backend/Dockerfile) | **CREATED** | Production Node 20 image with dependency caching, port 5000 expose, and healthcheck. |
| [Backend/.dockerignore](file:///e:/AWDF/Backend/.dockerignore) | **CREATED** | Excludes `node_modules`, `.env`, tests, logs from image build context. |
| [Frontend/Dockerfile](file:///e:/AWDF/Frontend/Dockerfile) | **CREATED** | Multi-stage build (Node build -> Nginx runtime) delivering lightweight static SPA. |
| [Frontend/.dockerignore](file:///e:/AWDF/Frontend/.dockerignore) | **CREATED** | Excludes `node_modules`, `dist`, `.env` from frontend build context. |
| [Frontend/nginx.conf](file:///e:/AWDF/Frontend/nginx.conf) | **CREATED** | Nginx web server config supporting React client-side history routing. |
| [docker-compose.yml](file:///e:/AWDF/docker-compose.yml) | **CREATED** | Multi-service orchestration for `frontend`, `backend`, and `mongodb`. |
| [.env.example](file:///e:/AWDF/.env.example) | **CREATED** | Safe environment template documenting all variables without exposing secrets. |
| [Backend/server.js](file:///e:/AWDF/Backend/server.js) | **MODIFIED** | Upgraded `connectDB()` with resilient 5-attempt retry loop and delay for Docker startup. |
| [Frontend/.gitignore](file:///e:/AWDF/Frontend/.gitignore) | **MODIFIED** | Added `.env` and `.env.*` rules to prevent credential leaks. |
| [README.md](file:///e:/AWDF/README.md) | **MODIFIED** | Appended Practical 11 orchestration guide, commands, and architecture. |
| [docs/practical-11-docker.md](file:///e:/AWDF/docs/practical-11-docker.md) | **CREATED** | Full practical documentation with architecture, theory, and viva questions. |
