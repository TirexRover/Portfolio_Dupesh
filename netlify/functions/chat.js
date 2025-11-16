exports.handler = async (event) => {
  // CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check if AI API key is configured
  if (!process.env.AI_API_KEY) {
    console.error('AI_API_KEY environment variable is not set');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server configuration error: AI_API_KEY not set. Please configure it in Netlify environment variables.' 
      })
    };
  }

  // Default model fallback (server-side)
  const DEFAULT_AI_MODEL = process.env.AI_MODEL || process.env.VITE_AI_API_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
  // Default output token cap: 150 unless overridden by env AI_API_MAX_TOKENS or VITE_AI_API_MAX_TOKENS
  const DEFAULT_MAX_TOKENS = Number(process.env.AI_API_MAX_TOKENS || process.env.VITE_AI_API_MAX_TOKENS || 150);

  try {
  const requestBody = JSON.parse(event.body);
    if (!requestBody.model) {
      requestBody.model = DEFAULT_AI_MODEL;
    }
    
    // Ensure there is a system message; if client didn't send one, add a safe fallback
    const fallbackSystemPrompt = `You are a professional assistant for a candidate portfolio. Use only the supplied "Profile" and "Context passages"—do not invent facts. Always write in third person and refer to the candidate by name found in the profile or as "the candidate". For general questions, answer the domain question creatively and then add a short "How this applies to [candidate]:" mapping that links the answer to the candidate's skills/experience when possible. For candidate-specific questions, be concise, cite supporting context or profile blocks, and finish every response with "Confidence: Low/Medium/High". If information is missing, say exactly: "The available profile data doesn't mention that about the candidate."`;
  if (!Array.isArray(requestBody.messages)) {
      // Convert request body into a sensible message flow if caller provided a raw prompt
      const userContent = requestBody.prompt ?? requestBody.content ?? JSON.stringify(requestBody);
      requestBody.messages = [
        { role: 'system', content: fallbackSystemPrompt },
        { role: 'user', content: userContent }
      ];
    } else {
      const hasSystem = requestBody.messages.some((m) => m.role === 'system');
      if (!hasSystem) {
        requestBody.messages.unshift({ role: 'system', content: fallbackSystemPrompt });
      }
    }

    // Enforce max tokens cap
    const requestedMax = Number(requestBody.max_tokens ?? 0);
    if (!requestBody.max_tokens || Number.isNaN(requestedMax) || requestedMax > DEFAULT_MAX_TOKENS) {
      requestBody.max_tokens = DEFAULT_MAX_TOKENS;
    } else {
      requestBody.max_tokens = requestedMax;
    }

    // Get the site URL from Netlify context or use a fallback
    const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://your-site.netlify.app';
    // Use OpenRouter API endpoint (supports the model we're using)
    const apiUrl = process.env.AI_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': siteUrl,
        'X-Title': 'Portfolio Chat Assistant'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('AI API error:', response.status, data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: data.error || data,
          message: `AI API returned ${response.status}`
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
