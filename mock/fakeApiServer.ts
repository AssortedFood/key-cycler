import express from 'express';
const app = express();
app.use(express.json());
app.post('/speak', (req, res) => {
  const apiKey = req.header('xi-api-key');
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing xi-api-key header' });
  }
  res.json({ audio: 'fake_data' });
});
export default app;
