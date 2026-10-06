const ALLOWED_STATUSES = ["Pending", "Ongoing", "Completed", "In Progress"];

const validateTask = (req, res, next) => {
  if (req.method === "POST") {
    const { title, status } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`
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

    if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`
      });
    }
  }

  next();
};

module.exports = validateTask;

