const express = require("express");

const app = express();

const PORT = 5000;

// Middleware
app.use(express.json());

// In-memory data
let tasks = [
  {
    id: 1,
    title: "Learn Express",
    completed: false
  },
  {
    id: 2,
    title: "Complete Practical 4",
    completed: false
  }
];

// =========================
// GET - Get All Tasks
// =========================
app.get("/tasks", (req, res) => {
  res.status(200).json(tasks);
});

// =========================
// GET - Get Task By ID
// =========================
app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const task = tasks.find(task => task.id === id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found"
    });
  }

  res.status(200).json(task);
});

// =========================
// POST - Create Task
// =========================
app.post("/tasks", (req, res) => {

  const { title, completed } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Title is required"
    });
  }

  const newTask = {
    id: tasks.length + 1,
    title,
    completed: completed || false
  };

  tasks.push(newTask);

  res.status(201).json({
    message: "Task created successfully",
    task: newTask
  });
});

// =========================
// PUT - Update Task
// =========================
app.put("/tasks/:id", (req, res) => {

  const id = parseInt(req.params.id);

  const task = tasks.find(task => task.id === id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found"
    });
  }

  task.title = req.body.title || task.title;
  task.completed =
    req.body.completed !== undefined
      ? req.body.completed
      : task.completed;

  res.status(200).json({
    message: "Task updated successfully",
    task
  });
});

// =========================
// DELETE - Delete Task
// =========================
app.delete("/tasks/:id", (req, res) => {

  const id = parseInt(req.params.id);

  const index = tasks.findIndex(task => task.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Task not found"
    });
  }

  tasks.splice(index, 1);

  res.status(200).json({
    message: "Task deleted successfully"
  });
});

// =========================
// Root Route
// =========================
app.get("/", (req, res) => {
  res.json({
    message: "Task Manager API Running Successfully"
  });
});

// =========================
// Server
// =========================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});