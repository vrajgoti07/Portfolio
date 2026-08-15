const BASE_URL = "http://localhost:5000";

/**
 * Fetch all tasks from the backend API.
 * GET /tasks
 */
export async function getTasks() {
  try {
    const response = await fetch(`${BASE_URL}/tasks`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch tasks (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to the backend server. Please make sure the backend is running at http://localhost:5000");
    }
    throw error;
  }
}

/**
 * Fetch a single task by ID from the backend API.
 * GET /tasks/:id
 */
export async function getTaskById(id) {
  try {
    const response = await fetch(`${BASE_URL}/tasks/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch task (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to the backend server.");
    }
    throw error;
  }
}

/**
 * Create a new task via the backend API.
 * POST /tasks
 */
export async function createTask(taskData) {
  try {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create task (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server.");
    }
    throw error;
  }
}

/**
 * Update an existing task via the backend API.
 * PUT /tasks/:id
 */
export async function updateTask(id, taskData) {
  try {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update task (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server.");
    }
    throw error;
  }
}

/**
 * Delete a task via the backend API.
 * DELETE /tasks/:id
 */
export async function deleteTask(id) {
  try {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete task (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server.");
    }
    throw error;
  }
}
