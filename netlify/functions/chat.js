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

  // Check if OPENROUTER_KEY is configured
  if (!process.env.OPENROUTER_KEY) {
    console.error('OPENROUTER_KEY environment variable is not set');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server configuration error: OPENROUTER_KEY not set. Please configure it in Netlify environment variables.' 
      })
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    
    // Get the site URL from Netlify context or use a fallback
    const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://your-site.netlify.app';
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': siteUrl,
        'X-Title': 'Portfolio Chat Assistant'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: data.error || data,
          message: `OpenRouter API returned ${response.status}`
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
