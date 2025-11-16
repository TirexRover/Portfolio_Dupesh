# Netlify Setup Guide for OpenRouter Chat

## 🎯 Quick Fix for 401 Error

If you're seeing **"Something went wrong while generating the answer"** with a **401 error** in the console, follow these steps:

### Step 1: Get an OpenRouter API Key

1. Go to [https://openrouter.ai/](https://openrouter.ai/)
2. Sign up or log in with your account
3. Click on **Keys** in the navigation menu
4. Click **Create Key**
5. Copy your new API key (it looks like `sk-or-v1-...`)

### Step 2: Configure Netlify Environment Variable

1. Log in to your [Netlify dashboard](https://app.netlify.com/)
2. Select your portfolio site
3. Go to **Site settings** (in the top navigation)
4. Click **Environment variables** in the left sidebar
5. Click the **Add a variable** button
6. Fill in:
   ```
   Key: OPENROUTER_KEY
   Value: sk-or-v1-your-actual-key-here
   ```
7. Under "Scopes", select:
   - ✅ Production
   - ✅ Deploy Previews  
   - ✅ Branch deploys
8. Click **Create variable**

### Step 3: Redeploy Your Site

**IMPORTANT**: Environment variables only take effect on NEW deploys!

Option A - Trigger a new deploy:
1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**

Option B - Push a new commit:
```bash
git commit --allow-empty -m "Trigger redeploy with OPENROUTER_KEY"
git push
```

### Step 4: Verify It's Working

1. Wait for the deploy to complete (usually 1-2 minutes)
2. Visit your site
3. Try asking a question in the chat
4. You should now get responses instead of 401 errors

## 🔍 Checking Your Deployment

### View Function Logs

To see what's happening with your Netlify function:

1. In Netlify dashboard, go to **Functions** tab
2. Click on the **chat** function
3. Click **Function log** to see real-time logs
4. Look for errors like:
   - `OPENROUTER_KEY environment variable is not set` → Go back to Step 2
   - `OpenRouter API error: 401` → Your API key may be invalid, get a new one
   - `OpenRouter API error: 429` → You've hit rate limits, wait a bit or upgrade your OpenRouter plan

### Test the Function Directly

You can test if your function is working by checking the browser console:

1. Open your deployed site
2. Press F12 to open Developer Tools
3. Go to the **Console** tab
4. Look for these types of messages:
   - ✅ Good: No errors when asking questions
   - ❌ Bad: `Failed to load resource: 401` → Environment variable not set
   - ❌ Bad: `Failed to load resource: 500` → Server error, check function logs

## 🛠 Common Issues

### Issue: Still getting 401 after setting environment variable

**Solution**: You MUST redeploy after adding environment variables. They don't retroactively apply to existing deploys.

### Issue: "User not found" error from OpenRouter

**Cause**: This specific error means OpenRouter received an invalid or missing API key.

**Solutions**:
1. Double-check you copied the full API key (they're long!)
2. Make sure there are no extra spaces in the environment variable value
3. Verify the key is still valid in your OpenRouter dashboard
4. Try generating a new key

### Issue: Function not found (404)

**Solution**: Make sure your `netlify.toml` has:
```toml
[build]
  functions = "netlify/functions"
```

And that `netlify/functions/chat.js` exists in your repository.

### Issue: CORS errors

**Solution**: The updated `chat.js` function now includes CORS headers. Make sure you have the latest version:

```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};
```

## 💰 OpenRouter Costs

The default model `meta-llama/llama-3.3-70b-instruct:free` is **FREE** but rate-limited.

To use other models or increase rate limits:
1. Add credits to your OpenRouter account
2. Change the model in your code by setting `VITE_OPENROUTER_MODEL` environment variable
   
   Example: set `VITE_OPENROUTER_MODEL` to meta-llama/llama-3.3-70b-instruct:free
   ```bash
   # PowerShell example (development)
   $env:VITE_OPENROUTER_MODEL="meta-llama/llama-3.3-70b-instruct:free"
   ```

## 📝 Checklist

Before asking for help, verify:

- [ ] I have an OpenRouter account and API key
- [ ] I added `OPENROUTER_KEY` to Netlify environment variables
- [ ] I redeployed the site AFTER adding the environment variable
- [ ] The deploy completed successfully (check Deploys tab)
- [ ] I checked the Function logs in Netlify dashboard
- [ ] My `netlify.toml` specifies `functions = "netlify/functions"`
- [ ] The file `netlify/functions/chat.js` exists in my repo

## 🆘 Still Not Working?

1. Check the browser console (F12) for specific error messages
2. Check Netlify Function logs for server-side errors
3. Verify your OpenRouter API key is valid by testing it directly:
   ```bash
   curl https://openrouter.ai/api/v1/auth/key \
     -H "Authorization: Bearer YOUR_KEY_HERE"
   ```
4. Try generating a new API key in OpenRouter

## ✅ Success!

Once configured correctly, you should:
- See chat responses without errors
- No 401 errors in console
- Function logs show successful OpenRouter API calls
- Visitors can chat with your portfolio assistant
