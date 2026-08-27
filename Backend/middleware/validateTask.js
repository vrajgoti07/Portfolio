const validateTask = (req, res, next) => {
  if (req.method === "POST") {
    const { title, status } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    if (status !== undefined && !["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be Pending, In Progress, or Completed"
      });
    }
  }

  if (req.method === "PUT") {
    const { title, status } = req.body;

    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      return res.status(400).json({
        message: "Title cannot be empty"
      });
    }

    if (status !== undefined && !["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be Pending, In Progress, or Completed"
      });
    }
  }

  next();
};

module.exports = validateTask;
