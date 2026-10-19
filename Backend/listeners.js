const taskEvents = require("./events");

let isInitialized = false;

/**
 * Register all domain event listeners for task lifecycle events.
 * Uses an idempotency flag to guarantee listeners are attached exactly once.
 */
function registerTaskListeners() {
  if (isInitialized) {
    return taskEvents;
  }

  // ==========================================
  // Listener A: task-created
  // ==========================================
  taskEvents.on("task-created", async (data) => {
    const handlerStart = new Date().toISOString();
    try {
      const task = data.task || data;
      const notificationScheduled = data.responseTimestamp || handlerStart;
      const assignedUser = task.assignedToName || task.assignedTo || "Unassigned";

      console.log("\n==================================================");
      console.log("[Notification] Task created");
      console.log(`Title: ${task.title}`);
      console.log(`Assigned User: ${assignedUser}`);
      console.log(`Task ID: ${task._id}`);
      console.log(`Notification Scheduled: ${notificationScheduled}`);
      console.log(`Handler Started: ${handlerStart}`);

      // Controlled Test Hook for Error Handling Demonstration (Phase 7, Test 6)
      if (data.simulateError === true || (task.title && task.title.includes("[TRIGGER_ERROR]"))) {
        throw new Error("Simulated background notification failure (Controlled Test Exception)");
      }

      // Simulate 2-second background notification processing delay (Non-blocking)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const handlerCompleted = new Date().toISOString();
      const elapsedMs = new Date(handlerCompleted).getTime() - new Date(handlerStart).getTime();

      console.log(`Handler Completed: ${handlerCompleted}`);
      console.log(`Processing Duration: ~${elapsedMs} ms`);
      console.log("==================================================\n");
    } catch (err) {
      console.error("\n==================================================");
      console.error("[Notification Error] Exception caught inside task-created listener:");
      console.error(`Reason: ${err.message}`);
      console.error(`Occurred At: ${new Date().toISOString()}`);
      console.error("Resilience: Server continues normal operation without crashing.");
      console.error("==================================================\n");

      // Safely notify the custom error event channel without crashing
      taskEvents.emit("notification-error", {
        event: "task-created",
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // ==========================================
  // Listener B: task-deleted
  // ==========================================
  taskEvents.on("task-deleted", async (data) => {
    const handlerStart = new Date().toISOString();
    try {
      const task = data.task || data;
      const deletedAt = data.deletionTimestamp || handlerStart;

      console.log("\n==================================================");
      console.log("[Notification] Task deleted");
      console.log(`Title: ${task.title}`);
      console.log(`Task ID: ${task._id}`);
      console.log(`Deleted At: ${deletedAt}`);
      console.log(`Handler Timestamp: ${handlerStart}`);
      console.log("==================================================\n");
    } catch (err) {
      console.error("\n==================================================");
      console.error("[Notification Error] Exception caught inside task-deleted listener:", err.message);
      console.error("==================================================\n");

      taskEvents.emit("notification-error", {
        event: "task-deleted",
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // ==========================================
  // Listener C: notification-error
  // ==========================================
  taskEvents.on("notification-error", (errData) => {
    console.log(`[Event: notification-error] Logged safe event error for '${errData.event}': ${errData.error} (${errData.timestamp})`);
  });

  isInitialized = true;
  return taskEvents;
}

// Auto-register on initial module import
registerTaskListeners();

module.exports = {
  registerTaskListeners,
  taskEvents
};
