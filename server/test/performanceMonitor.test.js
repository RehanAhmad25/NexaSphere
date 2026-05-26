import assert from 'node:assert/strict';
import test from 'node:test';

// Configure environment variable for testing performance monitor bounds
process.env.MONITORING_MAX_TRACKED_ENDPOINTS = '10';

// Mock request and response objects
const createMockReqRes = (method, baseUrl, path, routePath = null, isError = false) => {
  const req = {
    method,
    baseUrl,
    path,
    route: routePath ? { path: routePath } : null,
    headers: {},
  };
  
  let sendCallback = null;
  const res = {
    statusCode: isError ? 500 : 200,
    send(data) {
      if (sendCallback) sendCallback(data);
    }
  };
  
  return { req, res, setOnSend: (cb) => { sendCallback = cb; } };
};

test('Security Audit & Validation: Performance Monitor Middleware Memory Leak', async (t) => {
  const { performanceMonitor, getMetrics, resetMetrics } = await import('../middleware/performanceMonitor.js');

  await t.test('Scenario 1: Metrics track endpoints correctly under normal usage', () => {
    resetMetrics();
    
    const { req, res, setOnSend } = createMockReqRes('GET', '/api', '/events', '/events');
    
    // Apply middleware
    performanceMonitor(req, res, () => {});
    
    // Simulate handler response
    setOnSend(() => {
      const data = getMetrics();
      assert.equal(data.totalRequests, 1);
      assert.equal(data.endpoints.length, 1);
      assert.equal(data.endpoints[0].endpoint, 'GET /api/events');
      assert.equal(data.endpoints[0].count, 1);
    });
    
    res.send({ success: true });
  });

  await t.test('Scenario 2: Parameterized routes aggregate under their template path', () => {
    resetMetrics();

    // Event 1
    const { req: req1, res: res1, setOnSend: setOnSend1 } = createMockReqRes('GET', '/api', '/events/1', '/events/:id');
    performanceMonitor(req1, res1, () => {});
    setOnSend1(() => {});
    res1.send({ id: 1 });

    // Event 2
    const { req: req2, res: res2, setOnSend: setOnSend2 } = createMockReqRes('GET', '/api', '/events/2', '/events/:id');
    performanceMonitor(req2, res2, () => {});
    setOnSend2(() => {});
    res2.send({ id: 2 });

    const data = getMetrics();
    // They must be aggregated together as a single endpoint key!
    assert.equal(data.endpoints.length, 1);
    assert.equal(data.endpoints[0].endpoint, 'GET /api/events/:id');
    assert.equal(data.endpoints[0].count, 2);
  });

  await t.test('Scenario 3: 404/Non-matched routes collapse variable params dynamically', () => {
    resetMetrics();

    // 404 attempt with numeric ID
    const { req: req1, res: res1, setOnSend: setOnSend1 } = createMockReqRes('GET', '', '/api/unknown/54321', null, true);
    performanceMonitor(req1, res1, () => {});
    setOnSend1(() => {});
    res1.send({ error: 'Not Found' });

    // 404 attempt with MongoDB ObjectID
    const { req: req2, res: res2, setOnSend: setOnSend2 } = createMockReqRes('GET', '', '/api/unknown/507f1f77bcf86cd799439011', null, true);
    performanceMonitor(req2, res2, () => {});
    setOnSend2(() => {});
    res2.send({ error: 'Not Found' });

    const data = getMetrics();
    // Since both contain dynamic IDs in non-matched routes, they should collapse to /api/unknown/:id
    assert.equal(data.endpoints.length, 1);
    assert.equal(data.endpoints[0].endpoint, 'GET /api/unknown/:id');
    assert.equal(data.endpoints[0].count, 2);
  });

  await t.test('Scenario 4: Hard memory bounding prevents memory exhaustion under rotating URL storm', () => {
    resetMetrics();

    // Flood the middleware with 25 unique non-matched paths (our test cap is configured to 10)
    for (let i = 1; i <= 25; i++) {
      const { req, res, setOnSend } = createMockReqRes('GET', '', `/api/flood-test-${i}`, null);
      performanceMonitor(req, res, () => {});
      setOnSend(() => {});
      res.send({ test: i });
    }

    const data = getMetrics();
    // The metric endpoint count MUST be strictly bounded at exactly 10, preventing unbounded memory leak!
    console.log(`[Memory Bound Audit] Stored unique endpoints count: ${data.endpoints.length} (Max Cap: 10)`);
    assert.equal(data.endpoints.length, 10);
  });
});
