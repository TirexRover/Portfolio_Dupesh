import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY || process.env.VITE_OPENROUTER_KEY;

if (!OPENROUTER_KEY) {
  console.warn('Warning: OPENROUTER_KEY is not set. Proxy will return 401 for OpenRouter calls.');
}

app.use(cors());
app.use(express.json());

app.post('/openrouter/chat', async (req, res) => {
  if (!OPENROUTER_KEY) {
    return res.status(401).json({ error: 'OpenRouter key not set on the server' });
  }

  try {
    const url = process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const payload = await response.text();
    res.status(response.status).send(payload);
  } catch (err) {
    console.error('Proxy error', err);
    res.status(500).json({ error: 'Proxy failed' });
  }
});

app.listen(PORT, () => {
  console.log(`OpenRouter proxy listening on http://localhost:${PORT}`);
});
