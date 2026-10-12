const NodeCache = require('node-cache');

// Configure standard TTL from environment variable with 60-second default
const parsedTtl = parseInt(process.env.CACHE_TTL_SECONDS, 10);
const DEFAULT_TTL = !isNaN(parsedTtl) && parsedTtl > 0 ? parsedTtl : 60;
const CHECK_PERIOD = 120;

// Initialize shared NodeCache instance
const cache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: CHECK_PERIOD,
  useClones: true
});

// Explicit counter metrics for laboratory auditing
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Retrieve an item from cache with hit/miss tracking.
 * @param {string} key - Cache key
 * @returns {*} Cached data or undefined if miss/expired
 */
function get(key) {
  const value = cache.get(key);
  if (value !== undefined) {
    cacheHits++;
    return value;
  }
  cacheMisses++;
  return undefined;
}

/**
 * Store an item in the cache.
 * @param {string} key - Cache key
 * @param {*} val - Value to store
 * @param {number} [ttl] - Optional custom TTL in seconds
 * @returns {boolean} Success status
 */
function set(key, val, ttl) {
  if (ttl !== undefined) {
    return cache.set(key, val, ttl);
  }
  return cache.set(key, val);
}

/**
 * Delete a specific key from cache.
 * @param {string} key - Cache key to remove
 * @returns {number} Number of deleted entries
 */
function del(key) {
  return cache.del(key);
}

/**
 * Invalidate all keys matching a prefix or regex pattern.
 * @param {string} prefix - Key prefix (e.g., 'all_tasks')
 */
function delByPrefix(prefix) {
  const keys = cache.keys();
  const matched = keys.filter(k => k.startsWith(prefix));
  if (matched.length > 0) {
    cache.del(matched);
  }
  return matched.length;
}

/**
 * Convenience helper to invalidate all-tasks listings.
 */
function invalidateAllTasks() {
  return delByPrefix('all_tasks');
}

/**
 * Convenience helper to invalidate both individual task and all-tasks collections.
 * @param {string|ObjectId} taskId
 */
function invalidateTask(taskId) {
  const idStr = String(taskId);
  del(`task_${idStr}`);
  return invalidateAllTasks();
}

/**
 * Retrieve comprehensive cache performance statistics.
 */
function getStats() {
  const nodeStats = cache.getStats();
  const keys = cache.keys();
  return {
    hits: cacheHits,
    misses: cacheMisses,
    totalRequests: cacheHits + cacheMisses,
    hitRatio: (cacheHits + cacheMisses) > 0 
      ? Number(((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(2)) 
      : 0,
    keys: keys.length,
    activeKeys: keys,
    stdTTL: DEFAULT_TTL,
    checkperiod: CHECK_PERIOD,
    ksize: nodeStats.ksize,
    vsize: nodeStats.vsize
  };
}

/**
 * Reset counters and flush cache.
 */
function flush() {
  cache.flushAll();
  cacheHits = 0;
  cacheMisses = 0;
}

module.exports = {
  cache,
  get,
  set,
  del,
  delByPrefix,
  invalidateAllTasks,
  invalidateTask,
  getStats,
  flush,
  DEFAULT_TTL
};
