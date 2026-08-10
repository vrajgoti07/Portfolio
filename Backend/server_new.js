const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Task = require("./models/Task");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskdb";

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Database Connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected successfully to MongoDB database");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

// =========================
// Root Route
// =========================
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Task Manager API (v2 - MongoDB Persistent) Running Successfully",
    timestamp: new Date().toISOString()
  });
});

// =========================
// GET - Get All Tasks
// =========================
app.get("/tasks", async (req, res) => {
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

// =========================
// GET - Get Task By ID
// =========================
app.get("/tasks/:id", async (req, res) => {
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

// =========================
// POST - Create Task
// =========================
app.post("/tasks", async (req, res) => {
  try {
    const { title, completed } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    const newTask = new Task({
      title: title.trim(),
      completed: completed !== undefined ? Boolean(completed) : false
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

// =========================
// PUT - Update Task
// =========================
app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Task ID format"
      });
    }

    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.completed !== undefined) updateData.completed = req.body.completed;

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

// =========================
// DELETE - Delete Task
// =========================
app.delete("/tasks/:id", async (req, res) => {
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

// Server listener
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
