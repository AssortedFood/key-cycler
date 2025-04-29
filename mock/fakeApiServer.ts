import express from 'express';

const app = express();
app.use(express.json());

// In-memory usage map for /speak endpoint
const keyUsage: Record<string, number> = {};
// Per-key rate limit (default 5; can be overridden via startMockServer parameter)
let RATE_LIMIT = 5;

/**
 * Reset all key usage counts (for testing)
 */
export function resetKeyUsage() {
  Object.keys(keyUsage).forEach((key) => delete keyUsage[key]);
}

// Simple route for /speak: accepts xi-api-key header and returns 200 OK
app.post('/speak', (req, res) => {
  const apiKey = req.header('xi-api-key');
  // Missing API key header
  if (!apiKey) {
    return res.sendStatus(400);
  }
  const used = keyUsage[apiKey] || 0;
  if (used >= RATE_LIMIT) {
    return res.sendStatus(429);
  }
  keyUsage[apiKey] = used + 1;
  // Under rate limit: return dummy success payload
  return res.json({ text: req.body.text });
});

let server;

/**
 * Start the mock server on the specified port.
 * Optionally override the per-key rate limit by providing a second argument.
 */
export function startMockServer(port = 3000, rateLimit?: number) {
  if (typeof rateLimit === 'number') {
    RATE_LIMIT = rateLimit;
  }
  return new Promise((resolve) => {
    server = app.listen(port, () => {
      console.log(`Mock API server listening on port ${port}`);
      resolve(server);
    });
  });
}

export function stopMockServer() {
  return new Promise((resolve, reject) => {
    if (!server) return resolve();
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
