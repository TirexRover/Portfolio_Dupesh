# ⚠️ CRITICAL: Invalid OpenRouter API Key

## 🔴 Current Problem

Your OpenRouter API key is **INVALID** or **EXPIRED**. 

Testing the key directly returns:
```json
{"error":{"message":"User not found.","code":401}}
```

This means OpenRouter doesn't recognize the API key: `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`

## ✅ Solution: Generate a New API Key

### Step 1: Go to OpenRouter and Generate a New Key

1. Visit **[https://openrouter.ai/keys](https://openrouter.ai/keys)**
2. Log in to your OpenRouter account
   - If you don't have an account, sign up first
3. Click **"Create Key"** button
4. Give it a name (e.g., "Portfolio Chat App")
5. **Copy the new key** - it will look like: `sk-or-v1-xxxxxxxxxxxxx...`
6. ⚠️ **IMPORTANT**: Save this key somewhere safe - you won't be able to see it again!

### Step 2: Update Netlify Environment Variable

1. Go to your **[Netlify Dashboard](https://app.netlify.com/)**
2. Select your portfolio site
3. Go to **Site settings** → **Environment variables**
4. Find the existing `OPENROUTER_KEY` variable
5. Click **"Options"** → **"Edit"**
6. **Replace the old key** with your new key
7. Make sure all scopes are selected:
   - ✅ Production
   - ✅ Deploy Previews
   - ✅ Branch deploys
8. Click **"Save"**

### Step 3: Redeploy Your Site

**CRITICAL**: Environment variable changes only take effect on new deploys!

Option A - Manual deploy trigger:
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

Option B - Git commit (if auto-deploy is enabled):
```bash
git commit --allow-empty -m "Update OpenRouter API key"
git push
```

### Step 4: Verify It Works

1. Wait 1-2 minutes for deploy to complete
2. Open your site
3. Open browser DevTools (F12) → Console tab
4. Ask a question in the chat
5. Check for errors:
   - ✅ **Working**: You get a response, no errors
   - ❌ **Still broken**: You see 401 error → Key wasn't updated properly, repeat steps above

## 🧪 Test Your New Key Locally (Optional)

Before deploying, you can test if your new key works:

```bash
# Replace YOUR_NEW_KEY with the actual key from OpenRouter
curl -X POST "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_NEW_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"meta-llama/llama-3.1-8b-instruct:free","messages":[{"role":"user","content":"Hello"}]}'
```

You should get a valid JSON response with `choices` array, not an error.

## 🤔 Why Did This Happen?

Possible reasons your old key is invalid:
1. **Key was revoked** - You or someone deleted it from OpenRouter dashboard
2. **Account issue** - The OpenRouter account associated with the key was deleted or suspended
3. **Key never existed** - The key might have been incorrectly copied or generated
4. **Free tier limitations** - Some actions might invalidate free tier keys

## 📋 Checklist

- [ ] I went to https://openrouter.ai/keys
- [ ] I generated a NEW API key (starts with `sk-or-v1-`)
- [ ] I copied the entire key including the prefix
- [ ] I updated `OPENROUTER_KEY` in Netlify environment variables
- [ ] I clicked "Save" in Netlify
- [ ] I triggered a new deployment
- [ ] I waited for deployment to complete
- [ ] I tested the chat on my live site
- [ ] The chat now works without 401 errors

## 🆘 Still Not Working?

If you completed all steps and still get 401 errors:

1. **Double-check the key in Netlify**:
   - Go back to Site settings → Environment variables
   - Make sure there are no extra spaces before/after the key
   - The key should be exactly as copied from OpenRouter

2. **Check Netlify Function Logs**:
   - Go to Functions tab in Netlify
   - Click on `chat` function
   - Look at recent logs for error messages

3. **Verify your OpenRouter account**:
   - Log in to OpenRouter
   - Check if you have any active API keys
   - Check if your account is in good standing

4. **Try a different model**:
   - The free model might have issues
   - Add credits to your OpenRouter account
   - Try: `openai/gpt-3.5-turbo` (requires credits)

## 💰 OpenRouter Pricing

- **Free models** (like `meta-llama/llama-3.1-8b-instruct:free`):
  - No credit required
  - Rate-limited (requests per minute)
  - May have availability issues
  
- **Paid models**:
  - Require adding credits to your OpenRouter account
  - More reliable and faster
  - Pay per token used
  - Visit https://openrouter.ai/credits to add credits

## 🔗 Helpful Links

- OpenRouter Keys: https://openrouter.ai/keys
- OpenRouter Docs: https://openrouter.ai/docs
- OpenRouter Models: https://openrouter.ai/models
- OpenRouter Credits: https://openrouter.ai/credits
- Netlify Dashboard: https://app.netlify.com/

---

**Remember**: Never commit API keys to git! Always use environment variables in your hosting platform.
