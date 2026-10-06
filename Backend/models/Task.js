const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed", "In Progress"],
      default: "Pending"
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium"
    },
    assignedTo: {
      type: String,
      default: "",
      trim: true
    },
    assignedToName: {
      type: String,
      default: "",
      trim: true
    },
    assignedBy: {
      type: String,
      default: "vrajgoti07@gmail.com",
      trim: true
    },
    evaluationVerdict: {
      type: String,
      enum: ["Pending Evaluation", "Approved", "Needs Revision", "Excellent"],
      default: "Pending Evaluation"
    },
    evaluationNotes: {
      type: String,
      default: "",
      trim: true
    },
    evaluationScore: {
      type: Number,
      default: null
    },
    evaluatedAt: {
      type: Date,
      default: null
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Task", taskSchema);


