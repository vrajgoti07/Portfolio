const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const taskCache = require("../config/cache");

describe("Task Management API Automated Test Suite", () => {
  const jwtSecret = process.env.JWT_SECRET || "default_secret_key";
  const validToken = jwt.sign(
    { id: "test-user-id", email: "tester@example.com", role: "user" },
    jwtSecret,
    { expiresIn: "1h" }
  );

  beforeEach(() => {
    taskCache.flush();
    if (app.inMemoryTasks) {
      app.inMemoryTasks.length = 0;
    }
  });

  afterAll(() => {
    taskCache.flush();
  });

  describe("GET /tasks - Task Listing & Caching Endpoint", () => {
    it("should return HTTP 200 with an array of tasks for unauthenticated request", async () => {
      const response = await request(app).get("/tasks");

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.headers["x-cache"]).toBeDefined();
    });

    it("should return HTTP 200 with an array of tasks for authenticated request", async () => {
      const response = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should set X-Cache to MISS on initial request and HIT on subsequent request", async () => {
      const initialResponse = await request(app).get("/tasks");
      expect(initialResponse.statusCode).toBe(200);
      expect(initialResponse.headers["x-cache"]).toBe("MISS");

      const cachedResponse = await request(app).get("/tasks");
      expect(cachedResponse.statusCode).toBe(200);
      expect(cachedResponse.headers["x-cache"]).toBe("HIT");
    });
  });

  describe("POST /tasks - Request Validation & Authentication Rules", () => {
    it("should return HTTP 400 when task title is missing", async () => {
      const invalidPayload = {
        description: "Task without a title",
        status: "Pending"
      };

      const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidPayload);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Title is required");
    });

    it("should return HTTP 400 when task title is empty or only whitespace", async () => {
      const invalidPayload = {
        title: "    ",
        description: "Task with whitespace title"
      };

      const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidPayload);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Title is required");
    });

    it("should return HTTP 400 when an invalid status is provided", async () => {
      const invalidPayload = {
        title: "Valid Title",
        status: "ArchivedAndDestroyed"
      };

      const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidPayload);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain("Invalid status");
    });

    it("should return HTTP 401 when authorization header is missing", async () => {
      const payload = {
        title: "Unauthorized Task Attempt",
        description: "Missing JWT header"
      };

      const response = await request(app)
        .post("/tasks")
        .send(payload);

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Unauthorized");
    });
  });
});
