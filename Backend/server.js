const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Task = require("./models/Task");
const User = require("./models/User");
const authMiddleware = require("./middleware/authMiddleware");
const optionalAuth = require("./middleware/optionalAuth");
const adminMiddleware = require("./middleware/adminMiddleware");
const validateTask = require("./middleware/validateTask");
const emailService = require("./services/emailService");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/awdf_db";

// Global Middleware
app.use(cors());
app.use(express.json());

// Seed/Guarantee Admin Account: vrajgoti07@gmail.com / 123456789
const seedAdminAccount = async () => {
  try {
    const adminEmail = "vrajgoti07@gmail.com";
    const adminPass = "123456789";
    const hashedPassword = await bcrypt.hash(adminPass, 10);

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        name: "Vraj Goti (Admin)",
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });
      await admin.save();
      console.log(`[SEED] Admin account (${adminEmail}) successfully created.`);
    } else {
      admin.role = "admin";
      admin.password = hashedPassword;
      if (!admin.name) admin.name = "Vraj Goti (Admin)";
      await admin.save();
      console.log(`[SEED] Admin account (${adminEmail}) verified and role updated to admin.`);
    }
  } catch (err) {
    console.error("[SEED] Error seeding admin account:", err.message);
  }
};

// MongoDB Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 4000 });
    console.log("Connected successfully to MongoDB database (awdf_db)");
    await seedAdminAccount();
  } catch (err) {
    console.warn(`Primary MongoDB connection error: ${err.message}. Attempting local fallback...`);
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/awdf_db", { serverSelectionTimeoutMS: 4000 });
      console.log("Connected successfully to local MongoDB database (awdf_db)");
      await seedAdminAccount();
    } catch (fallbackErr) {
      console.error("MongoDB connection error:", fallbackErr.message);
    }
  }
};

connectDB();

// ==========================================
// Root Route
// ==========================================
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Task Manager API with Role-Based Access Control (RBAC) & SMTP Email Service Active",
    admin: "vrajgoti07@gmail.com",
    smtp: {
      protocol: "SMTP",
      configured: emailService.isSmtpConfigured()
    },
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// SMTP Protocol Status & Test Route
// ==========================================
app.get("/smtp/status", async (req, res) => {
  try {
    const result = await emailService.verifySmtpConnection();
    res.status(200).json({
      protocol: "SMTP",
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER || "vrajgoti07@gmail.com",
      configured: emailService.isSmtpConfigured(),
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Authentication Routes (Practical 7 + RBAC)
// ==========================================

// POST /register - Register a new user
app.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password || typeof password !== "string" || password.trim() === "") {
      return res.status(400).json({ message: "Password is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Only vrajgoti07@gmail.com can be admin; all other registrations default to user
    const role = normalizedEmail === "vrajgoti07@gmail.com" ? "admin" : "user";

    const newUser = new User({
      name: name ? name.trim() : normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: hashedPassword,
      role
    });

    await newUser.save();

    // Trigger SMTP Welcome Email
    emailService.sendWelcomeEmail(newUser.email, newUser.name).catch((err) => {
      console.error("[SMTP NOTICE] Welcome email error:", err.message);
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    return res.status(500).json({
      message: "Server error during registration",
      error: error.message
    });
  }
});

// POST /login - User Login & JWT Generation
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password with bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Ensure role integrity
    const role = normalizedEmail === "vrajgoti07@gmail.com" ? "admin" : (user.role || "user");

    // Generate JWT token with ~24 hour expiry
    const token = jwt.sign(
      { id: user._id, email: user.email, role },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name || user.email.split("@")[0],
        role
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during login",
      error: error.message
    });
  }
});

// POST /forgot-password - Reset password by email
app.post("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Trigger SMTP Password Reset Security Alert Email
    emailService.sendPasswordResetSuccessEmail(normalizedEmail).catch((err) => {
      console.error("[SMTP NOTICE] Password reset alert error:", err.message);
    });

    return res.status(200).json({
      message: "Password updated successfully. You can now sign in with your new password."
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during password reset",
      error: error.message
    });
  }
});

// GET /me - Get Current Authenticated User (Protected)
app.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      _id: user._id,
      email: user.email,
      name: user.name || user.email.split("@")[0],
      role: user.email === "vrajgoti07@gmail.com" ? "admin" : (user.role || "user"),
      createdAt: user.createdAt
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve user profile",
      error: error.message
    });
  }
});

// ==========================================
// Admin Dedicated Routes (Admin Only: vrajgoti07@gmail.com)
// ==========================================

// GET /admin/users - Get registered users list and workload for task assignment
app.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    // Aggregate task counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const total = await Task.countDocuments({ assignedTo: u.email });
        const pending = await Task.countDocuments({ assignedTo: u.email, status: "Pending" });
        const ongoing = await Task.countDocuments({
          assignedTo: u.email,
          status: { $in: ["Ongoing", "In Progress"] }
        });
        const completed = await Task.countDocuments({ assignedTo: u.email, status: "Completed" });

        return {
          _id: u._id,
          name: u.name || u.email.split("@")[0],
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          taskStats: { total, pending, ongoing, completed }
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithStats
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users list for admin dashboard",
      error: error.message
    });
  }
});

// POST /admin/tasks - Admin assigns task to a particular team member
app.post("/admin/tasks", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, assignedTo, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    if (!assignedTo || !assignedTo.trim()) {
      return res.status(400).json({ message: "Must select a user to assign the task to" });
    }

    const assignedEmail = assignedTo.trim().toLowerCase();
    const targetUser = await User.findOne({ email: assignedEmail });

    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : "",
      status: "Pending",
      priority: priority && ["Low", "Medium", "High", "Urgent"].includes(priority) ? priority : "Medium",
      assignedTo: assignedEmail,
      assignedToName: targetUser?.name || assignedEmail.split("@")[0],
      assignedBy: "vrajgoti07@gmail.com",
      evaluationVerdict: "Pending Evaluation",
      completed: false
    });

    const savedTask = await newTask.save();

    // Trigger SMTP Notification Email to Assignee
    emailService.sendTaskAssignmentEmail(assignedEmail, savedTask).catch((err) => {
      console.error("[SMTP NOTICE] Assignment email dispatch error:", err.message);
    });

    res.status(201).json({
      message: `Task successfully assigned to ${assignedEmail}!`,
      task: savedTask
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to assign task",
      error: error.message
    });
  }
});

// PUT /admin/tasks/:id/evaluate - Admin evaluates deliverable
app.put("/admin/tasks/:id/evaluate", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { evaluationVerdict, evaluationNotes, evaluationScore } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Task ID format" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (evaluationVerdict !== undefined) {
      task.evaluationVerdict = evaluationVerdict;
    }
    if (evaluationNotes !== undefined) {
      task.evaluationNotes = evaluationNotes.trim();
    }
    if (evaluationScore !== undefined) {
      task.evaluationScore = Number(evaluationScore);
    }
    task.evaluatedAt = new Date();

    await task.save();

    // Trigger SMTP Notification Email to Assignee if assigned
    if (task.assignedTo) {
      emailService.sendTaskEvaluationEmail(task.assignedTo, task).catch((err) => {
        console.error("[SMTP NOTICE] Evaluation email dispatch error:", err.message);
      });
    }

    res.status(200).json({
      message: "Task evaluation submitted successfully",
      task
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to evaluate task",
      error: error.message
    });
  }
});

// ==========================================
// General Task Routes (Public Read, Protected Write)
// ==========================================

// GET /tasks - Get All Tasks (Public read with optionalAuth to prevent 401s on page visit)
app.get("/tasks", optionalAuth, async (req, res) => {
  try {
    const { assignedTo, status } = req.query;
    const filter = {};

    if (assignedTo) {
      filter.assignedTo = assignedTo.trim().toLowerCase();
    }
    if (status && status !== "All") {
      if (status === "Ongoing") {
        filter.status = { $in: ["Ongoing", "In Progress"] };
      } else {
        filter.status = status;
      }
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message
    });
  }
});

// GET /tasks/:id - Get Single Task
app.get("/tasks/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Task ID format" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch task",
      error: error.message
    });
  }
});

// POST /tasks - Create Task (Protected by authMiddleware and validateTask)
app.post("/tasks", authMiddleware, validateTask, async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo } = req.body;

    const taskStatus = status && ["Pending", "Ongoing", "Completed", "In Progress"].includes(status)
      ? (status === "In Progress" ? "Ongoing" : status)
      : "Pending";

    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : "",
      status: taskStatus,
      priority: priority || "Medium",
      assignedTo: assignedTo || req.user?.email || "",
      assignedBy: req.user?.role === "admin" ? "vrajgoti07@gmail.com" : req.user?.email,
      completed: taskStatus === "Completed"
    });

    const savedTask = await newTask.save();

    res.status(201).json({
      message: "Task created successfully",
      task: savedTask
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create task",
      error: error.message
    });
  }
});

// PUT /tasks/:id - Update Task with Status Lifecycle & Edit Locking
app.put("/tasks/:id", authMiddleware, validateTask, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Task ID format" });
    }

    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isAdmin = req.user?.role === "admin" || req.user?.email === "vrajgoti07@gmail.com";
    const isOngoingOrCompleted = existingTask.status === "Ongoing" || existingTask.status === "Completed" || existingTask.status === "In Progress";

    // Enforce strict edit locking rule
    if (!isAdmin && isOngoingOrCompleted) {
      const isAttemptingContentEdit =
        (req.body.title !== undefined && req.body.title.trim() !== existingTask.title) ||
        (req.body.description !== undefined && req.body.description.trim() !== existingTask.description);

      if (isAttemptingContentEdit) {
        return res.status(403).json({
          message: `Editing is locked! Tasks cannot be edited once they are in ${existingTask.status} status. Only pending tasks can be edited.`
        });
      }
    }

    // Apply allowed updates
    if (req.body.title !== undefined && (isAdmin || existingTask.status === "Pending")) {
      existingTask.title = req.body.title.trim();
    }
    if (req.body.description !== undefined && (isAdmin || existingTask.status === "Pending")) {
      existingTask.description = req.body.description.trim();
    }
    if (req.body.priority !== undefined && (isAdmin || existingTask.status === "Pending")) {
      existingTask.priority = req.body.priority;
    }

    // Status transition is allowed (Pending -> Ongoing -> Completed)
    if (req.body.status !== undefined) {
      let nextStatus = req.body.status;
      if (nextStatus === "In Progress") nextStatus = "Ongoing";
      existingTask.status = nextStatus;
      existingTask.completed = nextStatus === "Completed";
    }

    const updatedTask = await existingTask.save();

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task",
      error: error.message
    });
  }
});

// DELETE /tasks/:id - Delete Task (Protected by authMiddleware)
app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Task ID format" });
    }

    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Task deleted successfully",
      task: deletedTask
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete task",
      error: error.message
    });
  }
});

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Server listener
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});