import express from 'express';
import { Server } from 'http';
const app = express();
app.use(express.json());
const keyUsage = new Map<string, number>();
const RATE_LIMIT = 5;
function resetKeyUsage() {
  keyUsage.clear();
}
app.post('/speak', (req, res) => {
  const apiKey = req.header('xi-api-key');
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing xi-api-key header' });
  }
  const count = keyUsage.get(apiKey) ?? 0;
  keyUsage.set(apiKey, count + 1);
  if (keyUsage.get(apiKey)! > RATE_LIMIT) {
    return res.status(429).json({ error: 'Too Many Requests' });
  }
  res.json({ audio: 'fake_data' });
});
function startMockServer(port: number): Promise<Server> {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
}
function stopMockServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
export {
  resetKeyUsage,
  keyUsage,
  RATE_LIMIT,
  startMockServer,
  stopMockServer,
};
