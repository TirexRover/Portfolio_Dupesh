import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;
const AI_API_KEY = process.env.AI_API_KEY || process.env.VITE_AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || process.env.VITE_AI_API_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
const AI_MAX_TOKENS = Number(process.env.AI_API_MAX_TOKENS || process.env.VITE_AI_API_MAX_TOKENS || 150);

if (!AI_API_KEY) {
  console.warn('Warning: AI_API_KEY is not set. Proxy will return 401 for AI API calls.');
}

app.use(cors());
app.use(express.json());

app.post('/ai/chat', async (req, res) => {
  if (!AI_API_KEY) {
    return res.status(401).json({ error: 'AI API key not set on the server' });
  }

  try {
    const url = process.env.AI_API_URL || 'https://api.ai-service.example/v1/chat/completions';

    if (!req.body.model) {
      req.body.model = AI_MODEL;
    }

    const fallbackSystemPrompt = `You are a professional assistant for a candidate portfolio. Use only the supplied "Profile" and "Context passages"—do not invent facts. Always write in third person and refer to the candidate by name found in the profile or as "the candidate". For general questions, answer the domain question creatively and then add a short "How this applies to [candidate]:" mapping that links the answer to the candidate's skills/experience when possible. For candidate-specific questions, be concise, cite supporting context or profile blocks, and finish every response with "Confidence: Low/Medium/High". If information is missing, say exactly: "The available profile data doesn't mention that about the candidate."`;

    if (!Array.isArray(req.body.messages)) {
      const userContent = req.body.prompt ?? req.body.content ?? JSON.stringify(req.body);
      req.body.messages = [
        { role: 'system', content: fallbackSystemPrompt },
        { role: 'user', content: userContent }
      ];
    } else {
      const hasSystem = req.body.messages.some((m) => m.role === 'system');
      if (!hasSystem) {
        req.body.messages.unshift({ role: 'system', content: fallbackSystemPrompt });
      }
    }

    const requestedMax = Number(req.body.max_tokens ?? 0);
    if (!req.body.max_tokens || Number.isNaN(requestedMax) || requestedMax > AI_MAX_TOKENS) {
      req.body.max_tokens = AI_MAX_TOKENS;
    } else {
      req.body.max_tokens = requestedMax;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
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
  console.log(`AI API proxy listening on http://localhost:${PORT}`);
});