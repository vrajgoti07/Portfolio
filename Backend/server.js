const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Task = require("./models/Task");
const User = require("./models/User");
const authMiddleware = require("./middleware/authMiddleware");
const validateTask = require("./middleware/validateTask");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/awdf_db";

// Global Middleware
app.use(cors());
app.use(express.json());

// MongoDB Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 4000 });
    console.log("Connected successfully to MongoDB database (awdf_db)");
  } catch (err) {
    console.warn(`Primary MongoDB connection error: ${err.message}. Attempting local fallback...`);
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/awdf_db", { serverSelectionTimeoutMS: 4000 });
      console.log("Connected successfully to local MongoDB database (awdf_db)");
    } catch (fallbackErr) {
      console.error("MongoDB connection error:", fallbackErr.message);
    }
  }
};

connectDB();

// =========================
// Root Route
// =========================
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Task Manager API with JWT Authentication & Middleware Pipeline Running Successfully",
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// Authentication Routes (Practical 7)
// ==========================================

// POST /register - Register a new user
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    if (!password || typeof password !== "string" || password.trim() === "") {
      return res.status(400).json({
        message: "Password is required"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please provide a valid email address"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered"
      });
    }

    // Hash password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: normalizedEmail,
      password: hashedPassword
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully"
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email is already registered"
      });
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
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare password with bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Generate JWT token with ~1 hour expiry
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during login",
      error: error.message
    });
  }
});

// GET /me - Get Current Authenticated User (Protected)
app.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      _id: user._id,
      email: user.email,
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
// Protected Task Routes (Practical 6 + Practical 7)
// ==========================================

// GET /tasks - Get All Tasks (Protected by authMiddleware)
app.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message
    });
  }
});

// GET /tasks/:id - Get Single Task (Protected by authMiddleware)
app.get("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    let task = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      task = await Task.findById(id);
    }

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
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
    const { title, description, status, completed } = req.body;

    const taskStatus =
      status && ["Pending", "In Progress", "Completed"].includes(status)
        ? status
        : completed
        ? "Completed"
        : "Pending";

    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : "",
      status: taskStatus,
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

// PUT /tasks/:id - Update Task (Protected by authMiddleware and validateTask)
app.put("/tasks/:id", authMiddleware, validateTask, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Task ID format"
      });
    }

    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title.trim();
    if (req.body.description !== undefined) updateData.description = req.body.description.trim();
    if (req.body.status !== undefined) {
      updateData.status = req.body.status;
      updateData.completed = req.body.status === "Completed";
    } else if (req.body.completed !== undefined) {
      updateData.completed = Boolean(req.body.completed);
      if (updateData.completed) updateData.status = "Completed";
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

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
      return res.status(400).json({
        message: "Invalid Task ID format"
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
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
  res.status(404).json({
    message: "Endpoint not found"
  });
});

// Server listener
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});