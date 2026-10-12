const http = require('http');

async function measureRequest(index) {
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime.bigint();
    const req = http.get('http://localhost:5000/tasks', (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1e6;
        let data = [];
        try { data = JSON.parse(body); } catch(e) {}
        resolve({
          index,
          status: res.statusCode,
          count: Array.isArray(data) ? data.length : 0,
          durationMs: Number(durationMs.toFixed(2))
        });
      });
    });
    req.on('error', reject);
  });
}

async function run() {
  console.log('--- Uncached Baseline Measurements for GET /tasks ---');
  const results = [];
  for (let i = 1; i <= 3; i++) {
    const res = await measureRequest(i);
    results.push(res);
    console.log(`Reading ${res.index}: Status=${res.status}, Tasks=${res.count}, ResponseTime=${res.durationMs}ms`);
    // brief delay between requests
    await new Promise(r => setTimeout(r, 200));
  }
  const avg = (results.reduce((acc, r) => acc + r.durationMs, 0) / results.length).toFixed(2);
  console.log(`Average Uncached Response Time: ${avg}ms`);
}

run().catch(console.error);
