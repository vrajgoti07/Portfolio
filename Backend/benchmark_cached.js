const http = require('http');

function measure(url) {
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime.bigint();
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1e6;
        resolve({
          status: res.statusCode,
          cacheHeader: res.headers['x-cache'],
          durationMs: Number(durationMs.toFixed(2))
        });
      });
    }).on('error', reject);
  });
}

async function runBenchmark() {
  console.log('=== Measuring Cached GET /tasks Performance ===\n');

  // Primer request to populate cache
  const prime = await measure('http://localhost:5000/tasks');
  console.log(`Initial Warmup / Primer Request: Status=${prime.status}, X-Cache=${prime.cacheHeader}, Time=${prime.durationMs}ms`);

  const readings = [];
  for (let i = 1; i <= 3; i++) {
    // 100ms interval between requests
    await new Promise(r => setTimeout(r, 100));
    const r = await measure('http://localhost:5000/tasks');
    readings.push(r);
    console.log(`Cached Reading ${i}: Status=${r.status}, X-Cache=${r.cacheHeader}, ResponseTime=${r.durationMs}ms`);
  }

  const avgCached = (readings.reduce((sum, r) => sum + r.durationMs, 0) / readings.length).toFixed(2);
  console.log(`\nAverage Cached Response Time: ${avgCached}ms`);
}

runBenchmark().catch(console.error);
