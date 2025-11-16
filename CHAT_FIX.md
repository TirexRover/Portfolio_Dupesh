# Chat Function Fix - November 17, 2025

## Problem
After removing OpenRouter references from the codebase, the chat function was failing with:
- **500 Internal Server Error**
- **Error: "fetch failed"**

## Root Causes

1. **Missing API URL**: The `AI_API_URL` environment variable was not set, causing the code to use a placeholder URL (`https://api.ai-service.example/v1/chat/completions`) that doesn't exist.

2. **Wrong Environment Variable Names**: The `.env.local` file still used `OPENROUTER_KEY` and `VITE_OPENROUTER_KEY`, but the code was looking for `AI_API_KEY`.

3. **Incorrect Variable Reference**: In `server/openrouter-proxy.js`, the code was using undefined variable `OPENROUTER_KEY` instead of `AI_API_KEY`.

## Changes Made

### 1. Fixed `netlify/functions/chat.js`
```javascript
// Before:
const apiUrl = process.env.AI_API_URL || 'https://api.ai-service.example/v1/chat/completions';

// After:
const apiUrl = process.env.AI_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
```

### 2. Updated `.env.local`
```bash
# Before:
VITE_OPENROUTER_KEY=sk-or-v1-...
OPENROUTER_KEY=sk-or-v1-...

# After:
AI_API_KEY=sk-or-v1-...
VITE_AI_API_KEY=sk-or-v1-...
```

### 3. Fixed `server/openrouter-proxy.js`
```javascript
// Before:
const url = process.env.AI_API_URL || 'https://api.ai-service.example/v1/chat/completions';
Authorization: `Bearer ${OPENROUTER_KEY}`,

// After:
const url = process.env.AI_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
Authorization: `Bearer ${AI_API_KEY}`,
```

## Testing

1. **Restart Development Server**: The dev server needs to be restarted to pick up the new environment variables.
   ```bash
   npm run dev
   ```

2. **Test the Chat**: Open http://localhost:5173/ and try using the chat feature.

## Netlify Deployment

⚠️ **Important**: For the chat to work in production on Netlify, you need to update the environment variables:

1. Go to your Netlify dashboard
2. Navigate to: **Site settings → Environment variables**
3. Update or add:
   - `AI_API_KEY` = your OpenRouter API key (the value from `.env.local`)
   - Optional: `AI_API_URL` = `https://openrouter.ai/api/v1/chat/completions` (has default fallback)

4. Redeploy your site:
   ```bash
   git add .
   git commit -m "Fix chat API configuration"
   git push
   ```

## Key Points

- The code is now vendor-neutral (uses `AI_API_KEY` instead of `OPENROUTER_KEY`)
- The actual API endpoint still points to OpenRouter (because that's what we're using)
- The default API URL is now correct if `AI_API_URL` is not set
- All environment variables are consistently named with `AI_API_*` prefix

## Status
✅ **Fixed** - Chat function should now work correctly in both development and production (after Netlify env vars are updated).
