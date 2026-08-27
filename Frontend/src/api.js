const BASE_URL = "http://localhost:5000";

/**
 * Helper to retrieve stored JWT token from localStorage.
 */
export function getToken() {
  return localStorage.getItem("token");
}

/**
 * Helper to save JWT token to localStorage.
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

/**
 * Helper to remove token (Logout).
 */
export function removeToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("user_email");
}

/**
 * Centralized headers generator with Bearer JWT if available.
 */
function getHeaders(includeAuth = true) {
  const headers = {
    "Content-Type": "application/json"
  };
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

/**
 * Generic response handler with 401 automatic token cleanup.
 */
async function handleResponse(response, customErrorMessage) {
  if (response.status === 401) {
    removeToken();
    // Dispatch custom event for 401 handling across the UI
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.message || "Session expired or unauthorized. Please login again.");
    err.status = 401;
    throw err;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.message || `${customErrorMessage} (HTTP ${response.status})`);
    err.status = response.status;
    throw err;
  }

  return await response.json();
}

/**
 * User Registration API
 * POST /register
 */
export async function registerUser(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email, password })
    });
    return await handleResponse(response, "Registration failed");
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to the backend server. Please make sure backend is running on port 5000.");
    }
    throw error;
  }
}

/**
 * User Login API
 * POST /login
 */
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(response, "Login failed");
    if (data.token) {
      setToken(data.token);
      localStorage.setItem("user_email", email.trim().toLowerCase());
    }
    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to the backend server. Please make sure backend is running on port 5000.");
    }
    throw error;
  }
}

/**
 * Fetch Current Authenticated User
 * GET /me
 */
export async function getMe() {
  try {
    const response = await fetch(`${BASE_URL}/me`, {
      method: "GET",
      headers: getHeaders(true)
    });
    return await handleResponse(response, "Failed to fetch user profile");
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to the backend server.");
    }
    throw error;
  }
}

/**
 * Fetch all tasks from the backend API.
 * GET /tasks (Protected)
 */
export async function getTasks() {
  try {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: "GET",
      headers: getHeaders(true)
    });
    return await handleResponse(response, "Failed to fetch tasks");
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to the backend server. Please make sure the backend is running at http://localhost:5000");
    }
    throw error;
  }
}

/**
 * Fetch a single task by ID from the backend API.
 * GET /tasks/:id (Protected)
 */
export async function getTaskById(id) {
  try {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "GET",
      headers: getHeaders(true)
    });
    return await handleResponse(response, "Failed to fetch task");
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server.");
    }
    throw error;
  }
}

/**
 * Create a new task via the backend API.
 * POST /tasks (Protected & Validated)
 */
export async function createTask(taskData) {
  try {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(taskData)
    });
    return await handleResponse(response, "Failed to create task");
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server.");
    }
    throw error;
  }
}

/**
 * Update an existing task via the backend API.
 * PUT /tasks/:id (Protected & Validated)
 */
export async function updateTask(id, taskData) {
  try {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(taskData)
    });
    return await handleResponse(response, "Failed to update task");
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server.");
    }
    throw error;
  }
}

/**
 * Delete a task via the backend API.
 * DELETE /tasks/:id (Protected)
 */
export async function deleteTask(id) {
  try {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: getHeaders(true)
    });
    return await handleResponse(response, "Failed to delete task");
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server.");
    }
    throw error;
  }
}
