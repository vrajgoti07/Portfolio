const EventEmitter = require("events");

/**
 * TaskEvents class extending Node.js's native EventEmitter.
 * Provides custom domain events for task lifecycle operations
 * (task-created, task-deleted, notification-error) without any
 * external dependencies.
 */
class TaskEvents extends EventEmitter {}

// Export a single shared TaskEvents instance (Singleton)
module.exports = new TaskEvents();
