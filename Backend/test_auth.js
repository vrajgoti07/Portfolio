const http = require("http");

const BASE_URL = "http://localhost:5000";

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body, raw: body });
        }
      });
    });

    req.on("error", (err) => reject(err));

    if (data) {
      req.write(typeof data === "string" ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING PRACTICAL 7 FULL AUTHENTICATION TEST SUITE");
  console.log("==================================================\n");

  const testEmail = `student_${Date.now()}@example.com`;
  const testPassword = "securePassword123";
  let authToken = "";
  let createdTaskId = "";

  // TEST 1: Register New User
  console.log("▶ TEST 1: POST /register");
  try {
    const res = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/register",
        method: "POST",
        headers: { "Content-Type": "application/json" }
      },
      { email: testEmail, password: testPassword }
    );
    console.log(`Status: ${res.status} (Expected 201)`);
    console.log("Response:", res.data);
    if (res.status === 201) console.log("✓ TEST 1 PASSED\n");
    else console.error("✗ TEST 1 FAILED\n");
  } catch (err) {
    console.error("✗ TEST 1 ERROR:", err.message);
  }

  // TEST 2: Register Duplicate User (Should be rejected with 400)
  console.log("▶ TEST 2 (Edge): POST /register with duplicate email");
  try {
    const res = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/register",
        method: "POST",
        headers: { "Content-Type": "application/json" }
      },
      { email: testEmail, password: testPassword }
    );
    console.log(`Status: ${res.status} (Expected 400)`);
    console.log("Response:", res.data);
    if (res.status === 400) console.log("✓ TEST 2 (DUPLICATE CHECK) PASSED\n");
    else console.error("✗ TEST 2 FAILED\n");
  } catch (err) {
    console.error("✗ TEST 2 ERROR:", err.message);
  }

  // TEST 3: Login User
  console.log("▶ TEST 3: POST /login");
  try {
    const res = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/login",
        method: "POST",
        headers: { "Content-Type": "application/json" }
      },
      { email: testEmail, password: testPassword }
    );
    console.log(`Status: ${res.status} (Expected 200)`);
    console.log("Response:", { message: res.data.message, tokenPreview: res.data.token ? res.data.token.substring(0, 25) + "..." : null });
    if (res.status === 200 && res.data.token) {
      authToken = res.data.token;
      console.log("✓ TEST 3 PASSED\n");
    } else {
      console.error("✗ TEST 3 FAILED\n");
    }
  } catch (err) {
    console.error("✗ TEST 3 ERROR:", err.message);
  }

  // TEST 4: GET /tasks WITHOUT Authorization Header
  console.log("▶ TEST 4: GET /tasks WITHOUT token");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/tasks",
      method: "GET"
    });
    console.log(`Status: ${res.status} (Expected 401)`);
    console.log("Response:", res.data);
    if (res.status === 401) console.log("✓ TEST 4 PASSED\n");
    else console.error("✗ TEST 4 FAILED\n");
  } catch (err) {
    console.error("✗ TEST 4 ERROR:", err.message);
  }

  // TEST 5: GET /tasks WITH Valid Authorization Header
  console.log("▶ TEST 5: GET /tasks WITH Bearer token");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/tasks",
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`Status: ${res.status} (Expected 200)`);
    console.log(`Fetched ${Array.isArray(res.data) ? res.data.length : 0} tasks`);
    if (res.status === 200 && Array.isArray(res.data)) console.log("✓ TEST 5 PASSED\n");
    else console.error("✗ TEST 5 FAILED\n");
  } catch (err) {
    console.error("✗ TEST 5 ERROR:", err.message);
  }

  // TEST 6: POST /tasks with Valid JWT
  console.log("▶ TEST 6: POST /tasks with Valid JWT");
  try {
    const res = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/tasks",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        }
      },
      {
        title: "Practical 7 JWT Auth Task",
        description: "Testing task creation via authenticated JWT pipeline",
        status: "In Progress"
      }
    );
    console.log(`Status: ${res.status} (Expected 201)`);
    console.log("Created Task:", res.data.task ? { id: res.data.task._id, title: res.data.task.title, status: res.data.task.status } : res.data);
    if (res.status === 201 && res.data.task && res.data.task._id) {
      createdTaskId = res.data.task._id;
      console.log("✓ TEST 6 PASSED\n");
    } else {
      console.error("✗ TEST 6 FAILED\n");
    }
  } catch (err) {
    console.error("✗ TEST 6 ERROR:", err.message);
  }

  // TEST 7: POST /tasks WITH JWT but missing required title
  console.log("▶ TEST 7: POST /tasks WITH JWT but missing title (Server-side Validation)");
  try {
    const res = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/tasks",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        }
      },
      { description: "Task with no title" }
    );
    console.log(`Status: ${res.status} (Expected 400)`);
    console.log("Response:", res.data);
    if (res.status === 400) console.log("✓ TEST 7 PASSED\n");
    else console.error("✗ TEST 7 FAILED\n");
  } catch (err) {
    console.error("✗ TEST 7 ERROR:", err.message);
  }

  // TEST 8: PUT /tasks/:id WITH Valid JWT
  console.log(`▶ TEST 8: PUT /tasks/${createdTaskId} WITH Valid JWT`);
  try {
    const res = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: `/tasks/${createdTaskId}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        }
      },
      { status: "Completed" }
    );
    console.log(`Status: ${res.status} (Expected 200)`);
    console.log("Updated Task:", res.data.task ? { id: res.data.task._id, status: res.data.task.status, completed: res.data.task.completed } : res.data);
    if (res.status === 200 && res.data.task && res.data.task.status === "Completed") {
      console.log("✓ TEST 8 PASSED\n");
    } else {
      console.error("✗ TEST 8 FAILED\n");
    }
  } catch (err) {
    console.error("✗ TEST 8 ERROR:", err.message);
  }

  // TEST 9: DELETE /tasks/:id WITH Valid JWT
  console.log(`▶ TEST 9: DELETE /tasks/${createdTaskId} WITH Valid JWT`);
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: `/tasks/${createdTaskId}`,
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`Status: ${res.status} (Expected 200)`);
    console.log("Response:", res.data);
    if (res.status === 200) console.log("✓ TEST 9 PASSED\n");
    else console.error("✗ TEST 9 FAILED\n");
  } catch (err) {
    console.error("✗ TEST 9 ERROR:", err.message);
  }

  // TEST 10: GET /me WITH Valid JWT
  console.log("▶ TEST 10: GET /me WITH Valid JWT");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/me",
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`Status: ${res.status} (Expected 200)`);
    console.log("User Profile:", res.data);
    const hasNoPassword = res.data.password === undefined;
    if (res.status === 200 && res.data.email === testEmail.toLowerCase() && hasNoPassword) {
      console.log("✓ TEST 10 PASSED (Password safely excluded)\n");
    } else {
      console.error("✗ TEST 10 FAILED\n");
    }
  } catch (err) {
    console.error("✗ TEST 10 ERROR:", err.message);
  }

  // TEST 11: Invalid Token Test (Must return 401 and not crash server)
  console.log("▶ TEST 11: Request with Invalid/Corrupted JWT");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/tasks",
      method: "GET",
      headers: { Authorization: "Bearer invalid.token.string.12345" }
    });
    console.log(`Status: ${res.status} (Expected 401)`);
    console.log("Response:", res.data);
    if (res.status === 401) console.log("✓ TEST 11 PASSED (Server handled invalid JWT gracefully)\n");
    else console.error("✗ TEST 11 FAILED\n");
  } catch (err) {
    console.error("✗ TEST 11 ERROR:", err.message);
  }

  console.log("==================================================");
  console.log("ALL AUTOMATED TESTS FINISHED");
  console.log("==================================================");
}

runTests();
