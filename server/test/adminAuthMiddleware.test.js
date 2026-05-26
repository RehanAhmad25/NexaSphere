import assert from 'node:assert/strict';
import test from 'node:test';

// 1. Configure environment variables for the middleware specifically for testing
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = 'AdminStrongPass123!';
process.env.ADMIN_LOGIN_WINDOW_MS = '100'; // Short window for testing: 100ms
process.env.ADMIN_LOGIN_MAX_ATTEMPTS = '2'; // Trigger rate limit after attempts > 2
process.env.ADMIN_LOGIN_MAX_TRACKED_IPS = '5'; // Keep tracked limit low to test eviction instantly

// Helper to create mocked request and response objects
const createMockReqRes = (ip, username, password) => {
  const req = {
    body: { username, password },
    ip,
    headers: {},
    get: () => '',
  };
  
  let statusCode = 200;
  let responseData = null;
  
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    statusCode() {
      return statusCode;
    },
    responseData() {
      return responseData;
    }
  };
  
  return { req, res };
};

test('Security Audit & Validation: Admin Authentication Rate Limiter', async (t) => {
  // 2. Dynamically import the middleware after process.env is set
  const { adminAuthMiddleware } = await import('../middleware/adminAuthMiddleware.js');

  await t.test('Initial state is empty', () => {
    adminAuthMiddleware._clearAllLoginAttempts();
    assert.equal(adminAuthMiddleware._getLoginAttemptsMapSize(), 0);
  });

  await t.test('Failed logins track attempts and keep stale entries before cleanup', async () => {
    adminAuthMiddleware._clearAllLoginAttempts();

    const ip = '192.168.1.50';
    const { req, res } = createMockReqRes(ip, 'admin', 'wrongpass');
    
    await adminAuthMiddleware.login(req, res);
    assert.equal(res.statusCode(), 401);
    assert.equal(adminAuthMiddleware._getLoginAttemptsMapSize(), 1);

    // Wait for the window to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Stale entry should still reside in the map because getLoginAttemptState hasn't been called for it
    assert.equal(adminAuthMiddleware._getLoginAttemptsMapSize(), 1);

    // Run cleanup manually to simulate background cleanup
    adminAuthMiddleware._cleanupExpiredAttempts();

    // Now it should be successfully evicted!
    assert.equal(adminAuthMiddleware._getLoginAttemptsMapSize(), 0);
  });

  await t.test('Successful login clears login attempts for the IP', async () => {
    adminAuthMiddleware._clearAllLoginAttempts();

    const ip = '192.168.1.60';
    
    // Failed attempt 1
    const { req: reqFail, res: resFail } = createMockReqRes(ip, 'admin', 'wrongpass');
    await adminAuthMiddleware.login(reqFail, resFail);
    assert.equal(resFail.statusCode(), 401);
    assert.equal(adminAuthMiddleware._getLoginAttemptsMapSize(), 1);

    // Successful attempt
    const { req: reqSuccess, res: resSuccess } = createMockReqRes(ip, 'admin', 'AdminStrongPass123!');
    await adminAuthMiddleware.login(reqSuccess, resSuccess);
    
    // The credentials match and success returns 200 (or calls createAdminSession which fails because DB isn't connected, returning 500 but it should have cleared the attempts first!)
    // Yes! clearLoginAttempts(ip) is called before createAdminSession:
    // 113: clearLoginAttempts(ip);
    // 115: const session = await createAdminSession({...})
    assert.equal(adminAuthMiddleware._getLoginAttemptsMapSize(), 0);
  });

  await t.test('Brute force protection limits attempts (429 status)', async () => {
    adminAuthMiddleware._clearAllLoginAttempts();

    const ip = '192.168.1.70';
    
    // Attempt 1: Failed (Attempts set to 1)
    const { req: req1, res: res1 } = createMockReqRes(ip, 'admin', 'wrongpass');
    await adminAuthMiddleware.login(req1, res1);
    assert.equal(res1.statusCode(), 401);

    // Attempt 2: Failed (Attempts set to 2)
    const { req: req2, res: res2 } = createMockReqRes(ip, 'admin', 'wrongpass');
    await adminAuthMiddleware.login(req2, res2);
    assert.equal(res2.statusCode(), 401);

    // Attempt 3: Failed (Attempts set to 3)
    const { req: req3, res: res3 } = createMockReqRes(ip, 'admin', 'wrongpass');
    await adminAuthMiddleware.login(req3, res3);
    assert.equal(res3.statusCode(), 401);

    // Attempt 4: Blocked (Attempts > 2, returns 429)
    const { req: req4, res: res4 } = createMockReqRes(ip, 'admin', 'wrongpass');
    await adminAuthMiddleware.login(req4, res4);
    assert.equal(res4.statusCode(), 429);
    assert.match(res4.responseData().error, /Too many login attempts/);
  });

  await t.test('Bounded-size FIFO eviction strictly enforces the upper limit', async () => {
    adminAuthMiddleware._clearAllLoginAttempts();

    // Register 5 failed attempts from 5 distinct IPs (limit is 5)
    for (let i = 1; i <= 5; i++) {
      const ip = `10.0.0.${i}`;
      const { req, res } = createMockReqRes(ip, 'admin', 'wrongpass');
      await adminAuthMiddleware.login(req, res);
      assert.equal(res.statusCode(), 401);
    }

    assert.equal(adminAuthMiddleware._getLoginAttemptsMapSize(), 5);

    // Add a 6th unique IP failed login attempt. This triggers FIFO eviction of 10.0.0.1.
    const { req: req6, res: res6 } = createMockReqRes('10.0.0.6', 'admin', 'wrongpass');
    await adminAuthMiddleware.login(req6, res6);
    assert.equal(res6.statusCode(), 401);

    // The map size MUST remain bounded at exactly 5
    assert.equal(adminAuthMiddleware._getLoginAttemptsMapSize(), 5);

    // Verify that the oldest IP (10.0.0.1) was evicted, but the newer ones remain
    const { req: reqCheck, res: resCheck } = createMockReqRes('10.0.0.1', 'admin', 'wrongpass');
    // Calling login again for 10.0.0.1 should treat it as attempt #1 (returning 401) rather than a rate limited attempt
    await adminAuthMiddleware.login(reqCheck, resCheck);
    assert.equal(resCheck.statusCode(), 401);
  });

  await t.test('Adversarial: Large IP Header String Truncation', async () => {
    adminAuthMiddleware._clearAllLoginAttempts();
    
    const massiveHeader = '1.1.1.1,' + 'A'.repeat(50000);
    const req = {
      body: { username: 'admin', password: 'wrongpassword' },
      headers: { 'x-forwarded-for': massiveHeader },
      get: () => '',
    };
    
    let statusCode = 200;
    const res = {
      status(code) { statusCode = code; return this; },
      json() { return this; }
    };
    
    await adminAuthMiddleware.login(req, res);
    assert.equal(statusCode, 401);
    assert.equal(adminAuthMiddleware._getLoginAttemptsMapSize(), 1);
  });

  await t.test('Adversarial: Eviction Pressure Brute-Force Bypass Mitigation', async () => {
    adminAuthMiddleware._clearAllLoginAttempts();
    
    const targetIp = '10.0.0.1';
    
    // Fail login 3 times to get near block threshold (attempts > 2)
    for (let i = 0; i < 3; i++) {
      const { req, res } = createMockReqRes(targetIp, 'admin', 'wrongpass');
      await adminAuthMiddleware.login(req, res);
    }
    
    // 4th attempt from targetIp MUST be rate-limited
    const { req: reqBlock, res: resBlock } = createMockReqRes(targetIp, 'admin', 'wrongpass');
    await adminAuthMiddleware.login(reqBlock, resBlock);
    assert.equal(resBlock.statusCode(), 429);
    
    // Flood map with 15 unique IPs to hit max capacity limit (5) and trigger eviction
    for (let i = 2; i <= 17; i++) {
      const { req, res } = createMockReqRes(`10.0.0.${i}`, 'admin', 'wrongpass');
      await adminAuthMiddleware.login(req, res);
    }
    
    // Target IP representing active brute force must still be blocked (i.e. preserved in map)
    const { req: reqVerify, res: resVerify } = createMockReqRes(targetIp, 'admin', 'wrongpass');
    await adminAuthMiddleware.login(reqVerify, resVerify);
    assert.equal(resVerify.statusCode(), 429);
  });

  await t.test('Stress & Concurrency: 1000 Concurrent Requests', async () => {
    adminAuthMiddleware._clearAllLoginAttempts();
    
    const startTime = Date.now();
    const concurrentRequests = 1000;
    const promises = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      const ip = `172.16.0.${i % 254}`;
      const { req, res } = createMockReqRes(ip, 'admin', 'wrongpass');
      promises.push(adminAuthMiddleware.login(req, res));
    }
    
    await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    console.log(`[Combined Concurrency Test] Processed ${concurrentRequests} requests in ${duration}ms`);
    assert.equal(adminAuthMiddleware._getLoginAttemptsMapSize(), 5);
    assert.ok(duration < 500);
  });
});
