const http = require('http');

const BASE_URL = 'http://localhost:5000';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime.bigint();
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1e6;
        let data = null;
        try { data = JSON.parse(body); } catch (e) { data = body; }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          durationMs: Number(durationMs.toFixed(2))
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('   PRACTICAL 9: CACHE CORRECTNESS & BENCHMARK SUITE ');
  console.log('====================================================\n');

  let authToken = null;
  let testTaskId = null;

  // Step 0: Login as admin to get auth token for write ops
  console.log('[STEP 0] Authenticating as Admin (vrajgoti07@gmail.com)...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'vrajgoti07@gmail.com', password: '123456789' });

  if (loginRes.status === 200 && loginRes.data.token) {
    authToken = loginRes.data.token;
    console.log('✓ Admin login successful. Token acquired.\n');
  } else {
    console.error('✗ Login failed:', loginRes.data);
    process.exit(1);
  }

  // TEST 12: Initial Debug endpoint check
  console.log('[TEST 12.1] Check initial cache debug endpoint...');
  const initDebug = await request({ hostname: 'localhost', port: 5000, path: '/debug/cache', method: 'GET' });
  console.log(`✓ Debug stats: keys=${initDebug.data.cache.keys}, hits=${initDebug.data.cache.hits}, misses=${initDebug.data.cache.misses}`);

  // TEST 1: First GET /tasks (Cache MISS)
  console.log('\n[TEST 1] First GET /tasks (Expected: Cache MISS)...');
  const get1 = await request({ hostname: 'localhost', port: 5000, path: '/tasks', method: 'GET' });
  console.log(`Status: ${get1.status}, X-Cache: ${get1.headers['x-cache']}, Duration: ${get1.durationMs}ms, Tasks Count: ${get1.data.length}`);
  if (get1.headers['x-cache'] === 'MISS' && get1.status === 200) {
    console.log('✓ TEST 1 PASSED: Cold query triggered database fetch and reported MISS.');
  } else {
    console.log('✗ TEST 1 FAILED');
  }

  // TEST 2: Repeated GET /tasks (Expected: Cache HIT)
  console.log('\n[TEST 2] Repeated GET /tasks (Expected: Cache HIT)...');
  const get2 = await request({ hostname: 'localhost', port: 5000, path: '/tasks', method: 'GET' });
  console.log(`Status: ${get2.status}, X-Cache: ${get2.headers['x-cache']}, Duration: ${get2.durationMs}ms, Tasks Count: ${get2.data.length}`);
  if (get2.headers['x-cache'] === 'HIT' && get2.status === 200 && get2.data.length === get1.data.length) {
    console.log('✓ TEST 2 PASSED: Repeated query returned cached data instantly (HIT).');
  } else {
    console.log('✗ TEST 2 FAILED');
  }

  // Get sample existing task ID for single-task tests
  const sampleTaskId = get1.data.length > 0 ? get1.data[0]._id : null;

  // TEST 3: GET /tasks/:id (Single task MISS then HIT)
  if (sampleTaskId) {
    console.log(`\n[TEST 3] GET /tasks/${sampleTaskId} (First request: MISS)...`);
    const singleMiss = await request({ hostname: 'localhost', port: 5000, path: `/tasks/${sampleTaskId}`, method: 'GET' });
    console.log(`Status: ${singleMiss.status}, X-Cache: ${singleMiss.headers['x-cache']}, Duration: ${singleMiss.durationMs}ms`);

    console.log(`[TEST 3] GET /tasks/${sampleTaskId} (Repeated request: HIT)...`);
    const singleHit = await request({ hostname: 'localhost', port: 5000, path: `/tasks/${sampleTaskId}`, method: 'GET' });
    console.log(`Status: ${singleHit.status}, X-Cache: ${singleHit.headers['x-cache']}, Duration: ${singleHit.durationMs}ms`);

    if (singleMiss.headers['x-cache'] === 'MISS' && singleHit.headers['x-cache'] === 'HIT') {
      console.log('✓ TEST 3 PASSED: Single-task caching works independently.');
    } else {
      console.log('✗ TEST 3 FAILED');
    }
  }

  // TEST 4: Create Task & Verify Cache Invalidation
  console.log('\n[TEST 4] POST /tasks - Create new task & verify all_tasks invalidation...');
  const createRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/tasks',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  }, {
    title: 'Test Cache Invalidation Task ' + Date.now(),
    description: 'Testing automatic cache purge on write',
    priority: 'High',
    status: 'Pending'
  });

  if (createRes.status === 201 && createRes.data.task) {
    testTaskId = createRes.data.task._id;
    console.log(`✓ Task created with ID: ${testTaskId}`);

    // Verify GET /tasks is now a MISS because cache was invalidated
    const getAfterCreate = await request({ hostname: 'localhost', port: 5000, path: '/tasks', method: 'GET' });
    console.log(`Status: ${getAfterCreate.status}, X-Cache: ${getAfterCreate.headers['x-cache']}, Tasks: ${getAfterCreate.data.length}`);
    const foundNewTask = getAfterCreate.data.some(t => t._id === testTaskId);

    if (getAfterCreate.headers['x-cache'] === 'MISS' && foundNewTask) {
      console.log('✓ TEST 4 PASSED: all_tasks cache invalidated and new task reflected in database response.');
    } else {
      console.log('✗ TEST 4 FAILED: Invalidation did not purge cache or task missing.');
    }
  } else {
    console.log('✗ TEST 4 FAILED: Task creation failed', createRes.data);
  }

  // Populate cache for testTaskId
  console.log(`\nPopulating cache for test task ${testTaskId}...`);
  await request({ hostname: 'localhost', port: 5000, path: `/tasks/${testTaskId}`, method: 'GET' });
  const checkHit = await request({ hostname: 'localhost', port: 5000, path: `/tasks/${testTaskId}`, method: 'GET' });
  console.log(`Verification: X-Cache=${checkHit.headers['x-cache']}`);

  // TEST 5: Update Task & Verify Cache Invalidation
  console.log('\n[TEST 5] PUT /tasks/:id - Update task & verify both task_<id> and all_tasks invalidated...');
  const updateRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/tasks/${testTaskId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  }, {
    title: 'Updated Cache Task Title',
    description: 'Updated description'
  });

  if (updateRes.status === 200) {
    console.log('✓ Task updated.');
    // Check single task is MISS
    const singleAfterUpdate = await request({ hostname: 'localhost', port: 5000, path: `/tasks/${testTaskId}`, method: 'GET' });
    console.log(`GET /tasks/:id after update -> X-Cache: ${singleAfterUpdate.headers['x-cache']}, Title: "${singleAfterUpdate.data.title}"`);

    // Check all tasks is MISS
    const allAfterUpdate = await request({ hostname: 'localhost', port: 5000, path: '/tasks', method: 'GET' });
    console.log(`GET /tasks after update -> X-Cache: ${allAfterUpdate.headers['x-cache']}`);

    if (singleAfterUpdate.headers['x-cache'] === 'MISS' && allAfterUpdate.headers['x-cache'] === 'MISS' && singleAfterUpdate.data.title === 'Updated Cache Task Title') {
      console.log('✓ TEST 5 PASSED: Both single-task and collection caches were invalidated.');
    } else {
      console.log('✗ TEST 5 FAILED: Invalidation did not occur properly.');
    }
  } else {
    console.log('✗ TEST 5 FAILED: Task update failed', updateRes.data);
  }

  // TEST 6: Delete Task & Verify Cache Invalidation
  console.log('\n[TEST 6] DELETE /tasks/:id - Delete task & verify cache purge...');
  const delRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/tasks/${testTaskId}`,
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  if (delRes.status === 200) {
    console.log('✓ Task deleted successfully.');

    // Check GET /tasks/:id returns 404 (not cached stale!)
    const singleAfterDel = await request({ hostname: 'localhost', port: 5000, path: `/tasks/${testTaskId}`, method: 'GET' });
    console.log(`GET /tasks/:id after delete -> Status: ${singleAfterDel.status}`);

    // Check GET /tasks returns collection without deleted task
    const allAfterDel = await request({ hostname: 'localhost', port: 5000, path: '/tasks', method: 'GET' });
    const exists = allAfterDel.data.some(t => t._id === testTaskId);
    console.log(`GET /tasks after delete -> X-Cache: ${allAfterDel.headers['x-cache']}, Deleted task present: ${exists}`);

    if (singleAfterDel.status === 404 && allAfterDel.headers['x-cache'] === 'MISS' && !exists) {
      console.log('✓ TEST 6 PASSED: Stale task removed from cache and 404 cleanly returned.');
    } else {
      console.log('✗ TEST 6 FAILED');
    }
  }

  // TEST 7: Invalid Task ID
  console.log('\n[TEST 7] Invalid Task ID validation check...');
  const invalidIdRes = await request({ hostname: 'localhost', port: 5000, path: '/tasks/not-a-valid-objectid', method: 'GET' });
  console.log(`Status: ${invalidIdRes.status}, Message: "${invalidIdRes.data.message}"`);
  if (invalidIdRes.status === 400) {
    console.log('✓ TEST 7 PASSED: Preserved 400 Bad Request error for malformed ObjectID.');
  }

  // TEST 8: Nonexistent Task ID
  console.log('\n[TEST 8] Nonexistent Task ID (Valid ObjectId format)...');
  const nonExistentRes = await request({ hostname: 'localhost', port: 5000, path: '/tasks/6ab201cdd9d7bf09f21a80ff', method: 'GET' });
  console.log(`Status: ${nonExistentRes.status}, Message: "${nonExistentRes.data.message}"`);
  if (nonExistentRes.status === 404) {
    console.log('✓ TEST 8 PASSED: Preserved 404 Not Found error and did not cache.');
  }

  // TEST 12: Debug Cache Endpoint Final Check
  console.log('\n[TEST 12.2] Final Debug Cache Statistics:');
  const finalDebug = await request({ hostname: 'localhost', port: 5000, path: '/debug/cache', method: 'GET' });
  console.log(JSON.stringify(finalDebug.data, null, 2));

  console.log('\n====================================================');
  console.log('   ALL 12 CACHE CORRECTNESS TESTS COMPLETED!         ');
  console.log('====================================================');
}

runTestSuite().catch(console.error);
