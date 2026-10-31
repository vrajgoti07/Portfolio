const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../app");

describe("Security Hardening & Production Readiness Test Suite", () => {
  const testSecret = "security_test_secret_for_suite_1234567890";

  beforeAll(() => {
    process.env.JWT_SECRET = testSecret;
  });

  describe("1 & 2. JWT Secret Enforcement & Cryptographic Integrity", () => {
    it("should reject tokens forged with the old default_secret_key", async () => {
      const forgedToken = jwt.sign(
        { id: "fake-user-id", email: "hacker@example.com", role: "admin" },
        "default_secret_key",
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${forgedToken}`)
        .send({ title: "Forged Task", status: "Pending" });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Invalid token|Unauthorized/);
    });

    it("should accept valid tokens signed with process.env.JWT_SECRET", async () => {
      const validToken = jwt.sign(
        { id: "valid-user-id", email: "user@example.com", role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ title: "Legitimate User Task", status: "Pending" });

      expect(res.statusCode).toBe(201);
      expect(res.body.task.title).toBe("Legitimate User Task");
    });
  });

  describe("3, 4 & 5. Role Escalation Prevention & Removal of Offline Fallbacks", () => {
    it("should not allow users to register with admin role simply by passing role in body", async () => {
      // Mock User.findOne to return null (user doesn't exist)
      const findOneSpy = jest.spyOn(mongoose.Model, "findOne").mockResolvedValue(null);
      let capturedRole = null;
      const saveSpy = jest.spyOn(mongoose.Model.prototype, "save").mockImplementation(function () {
        capturedRole = this.role;
        this._id = new mongoose.Types.ObjectId();
        return Promise.resolve(this);
      });

      const res = await request(app)
        .post("/register")
        .send({
          name: "Attacker",
          email: "attacker@example.com",
          password: "password123",
          role: "admin"
        });

      expect(res.statusCode).toBe(201);
      expect(capturedRole).toBe("user");
      expect(res.body.user.role).toBe("user");

      findOneSpy.mockRestore();
      saveSpy.mockRestore();
    });

    it("should NOT make a user admin even if registering with vrajgoti07@gmail.com", async () => {
      const findOneSpy = jest.spyOn(mongoose.Model, "findOne").mockResolvedValue(null);
      let capturedRole = null;
      const saveSpy = jest.spyOn(mongoose.Model.prototype, "save").mockImplementation(function () {
        capturedRole = this.role;
        this._id = new mongoose.Types.ObjectId();
        return Promise.resolve(this);
      });

      const res = await request(app)
        .post("/register")
        .send({
          name: "Vraj Goti",
          email: "vrajgoti07@gmail.com",
          password: "password123"
        });

      expect(res.statusCode).toBe(201);
      expect(capturedRole).toBe("user");
      expect(res.body.user.role).toBe("user");

      findOneSpy.mockRestore();
      saveSpy.mockRestore();
    });

    it("should reject offline admin login fallback without database connection", async () => {
      // When mongoose.connection.readyState !== 1, login should return 503 instead of offline fallback
      const originalReadyState = mongoose.connection.readyState;
      Object.defineProperty(mongoose.connection, "readyState", { value: 0, configurable: true });

      const res = await request(app)
        .post("/login")
        .send({
          email: "vrajgoti07@gmail.com",
          password: "123456789"
        });

      expect(res.statusCode).toBe(503);
      expect(res.body.message).toContain("Database service unavailable");

      Object.defineProperty(mongoose.connection, "readyState", { value: originalReadyState, configurable: true });
    });
  });

  describe("Role-Based Access Control (adminMiddleware)", () => {
    it("should return HTTP 403 when a standard user accesses admin routes", async () => {
      const userToken = jwt.sign(
        { id: "user-123", email: "regular@example.com", role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/admin/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Forbidden: Admin access required");
    });

    it("should allow an authenticated admin to access admin routes", async () => {
      const adminToken = jwt.sign(
        { id: "admin-123", email: "admin@example.com", role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const findSpy = jest.spyOn(mongoose.Model, "find").mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([])
        })
      });

      const res = await request(app)
        .get("/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      findSpy.mockRestore();
    });
  });

  describe("7. Sensitive Information Disclosure Prevention", () => {
    it("should not expose database credentials or secrets on GET /", async () => {
      const res = await request(app).get("/");

      expect(res.statusCode).toBe(200);
      const jsonStr = JSON.stringify(res.body);
      expect(jsonStr).not.toContain("password");
      expect(jsonStr).not.toContain("mongodb+srv");
      expect(jsonStr).not.toContain("secret");
      expect(jsonStr).not.toContain("123456789");
    });

    it("should not expose SMTP credentials on GET /smtp/status", async () => {
      const res = await request(app).get("/smtp/status");

      expect(res.statusCode).toBe(200);
      const jsonStr = JSON.stringify(res.body);
      expect(jsonStr).not.toContain("pass");
      expect(jsonStr).not.toContain("SMTP_PASS");
    });
  });
});

