import express from 'express';

const app = express();
app.use(express.json());

// In-memory usage map for /speak endpoint
const keyUsage: Record<string, number> = {};

/**
 * Reset all key usage counts (for testing)
 */
export function resetKeyUsage() {
  Object.keys(keyUsage).forEach((key) => delete keyUsage[key]);
}

// Simple route for /speak: accepts xi-api-key header and returns 200 OK
app.post('/speak', (req, res) => {
  const apiKey = req.header('xi-api-key');
  res.sendStatus(200);
});

let server;

export function startMockServer(port = 3000) {
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
