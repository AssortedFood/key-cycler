import express from 'express';

const app = express();
app.use(express.json());

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
