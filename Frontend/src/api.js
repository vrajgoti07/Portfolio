/**
 * Centralized API Layer with JWT Authentication Support
 * Connects to Express + MongoDB backend on http://localhost:5000/api
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Helper to retrieve stored JWT token from localStorage.
 */
export function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("awdf_token");
}

/**
 * Helper to save JWT token to localStorage.
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem("token", token);
    localStorage.setItem("awdf_token", token);
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("awdf_token");
  }
}

/**
 * Helper to remove token and user session details.
 */
export function removeToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("awdf_token");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_name");
}

/**
 * Helper to get user email from localStorage.
 */
export function getUserEmail() {
  return localStorage.getItem("user_email") || "";
}

/**
 * Helper to get user role from localStorage.
 */
export function getUserRole() {
  return localStorage.getItem("user_role") || "user";
}

/**
 * Helper to check if current logged-in user is admin.
 */
export function isAdminUser() {
  const email = (getUserEmail() || "").toLowerCase().trim();
  const role = getUserRole();
  return email === "vrajgoti07@gmail.com" || role === "admin";
}

/**
 * Build request headers, optionally attaching Bearer token
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
 * Helper to handle fetch responses, parse JSON, and handle errors (including 401)
 */
async function handleResponse(response, defaultErrorMsg = "Request failed", suppressRedirect = false) {
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401 && !suppressRedirect) {
    removeToken();
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    throw new Error(data?.message || "Session expired. Please sign in again.");
  }

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || defaultErrorMsg;
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * User Registration API
 * POST /register
 */
export async function registerUser(email, password, name = "") {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email, password, name })
    });
    return await handleResponse(response, "Registration failed");
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server. Please make sure backend is running on port 5000.", { cause: error });
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
      const user = data.user || {};
      const normalizedEmail = (user.email || email).trim().toLowerCase();
      localStorage.setItem("user_email", normalizedEmail);
      localStorage.setItem("user_role", user.role || (normalizedEmail === "vrajgoti07@gmail.com" ? "admin" : "user"));
      if (user.name) {
        localStorage.setItem("user_name", user.name);
      }
    }
    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server. Please make sure backend is running on port 5000.", { cause: error });
    }
    throw error;
  }
}

/**
 * Forgot Password API
 * POST /forgot-password
 */
export async function forgotPassword(email, newPassword) {
  try {
    const response = await fetch(`${BASE_URL}/forgot-password`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email, newPassword })
    });
    return await handleResponse(response, "Password reset failed");
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server.", { cause: error });
    }
    throw error;
  }
}

/**
 * Fetch Current Authenticated User Profile
 * GET /me
 */
export async function getMe() {
  try {
    const response = await fetch(`${BASE_URL}/me`, {
      method: "GET",
      headers: getHeaders(true)
    });
    const userData = await handleResponse(response, "Failed to fetch user profile");
    if (userData) {
      if (userData.email) localStorage.setItem("user_email", userData.email);
      if (userData.role) localStorage.setItem("user_role", userData.role);
      if (userData.name) localStorage.setItem("user_name", userData.name);
    }
    return userData;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server.", { cause: error });
    }
    throw error;
  }
}

/**
 * Fetch Tasks from backend (public or authenticated)
 * GET /tasks
 */
export async function getTasks(queryParams = {}) {
  try {
    const params = new URLSearchParams();
    if (queryParams.assignedTo) params.append("assignedTo", queryParams.assignedTo);
    if (queryParams.status && queryParams.status !== "All") params.append("status", queryParams.status);

    const qs = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${BASE_URL}/tasks${qs}`, {
      method: "GET",
      headers: getHeaders(true)
    });
    // Suppress automatic unauthorized redirect on task reads so guests can browse
    return await handleResponse(response, "Failed to fetch tasks", true);
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server on port 5000.", { cause: error });
    }
    throw error;
  }
}

/**
 * Fetch Single Task by ID
 * GET /tasks/:id
 */
export async function getTaskById(id) {
  try {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "GET",
      headers: getHeaders(true)
    });
    return await handleResponse(response, "Failed to fetch task", true);
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server.", { cause: error });
    }
    throw error;
  }
}

/**
 * Create Task (User or Admin)
 * POST /tasks
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
      throw new Error("Unable to connect to backend server.", { cause: error });
    }
    throw error;
  }
}

/**
 * Update Task (Allows status change; blocks content edit if Ongoing/Completed)
 * PUT /tasks/:id
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
      throw new Error("Unable to connect to backend server.", { cause: error });
    }
    throw error;
  }
}

/**
 * Delete Task
 * DELETE /tasks/:id
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
      throw new Error("Unable to connect to backend server.", { cause: error });
    }
    throw error;
  }
}

/**
 * Admin: Fetch Users List & Workload
 * GET /admin/users
 */
export async function getAdminUsers() {
  try {
    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: "GET",
      headers: getHeaders(true)
    });
    return await handleResponse(response, "Failed to fetch team users for admin");
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server.", { cause: error });
    }
    throw error;
  }
}

/**
 * Admin: Assign Task to a Team Member
 * POST /admin/tasks
 */
export async function assignAdminTask(taskData) {
  try {
    const response = await fetch(`${BASE_URL}/admin/tasks`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(taskData)
    });
    return await handleResponse(response, "Failed to assign task");
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server.", { cause: error });
    }
    throw error;
  }
}

/**
 * Admin: Evaluate Task Deliverable
 * PUT /admin/tasks/:id/evaluate
 */
export async function evaluateAdminTask(taskId, evaluationData) {
  try {
    const response = await fetch(`${BASE_URL}/admin/tasks/${taskId}/evaluate`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(evaluationData)
    });
    return await handleResponse(response, "Failed to submit evaluation");
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server.", { cause: error });
    }
    throw error;
  }
}
