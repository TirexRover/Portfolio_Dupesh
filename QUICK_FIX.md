# 🚨 QUICK FIX: Invalid OpenRouter API Key

## The Problem
Your API key `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` is **INVALID**.

When tested, OpenRouter returns: `{"error":{"message":"User not found.","code":401}}`

## The Solution (5 Minutes)

### 1️⃣ Get New Key
🔗 Go to: **https://openrouter.ai/keys**
- Log in
- Click "Create Key"
- Copy the new key (starts with `sk-or-v1-`)

### 2️⃣ Update Netlify
🔗 Go to: **https://app.netlify.com/**
- Select your site
- Site settings → Environment variables
- Edit `OPENROUTER_KEY`
- Paste your NEW key
- Click Save

### 3️⃣ Redeploy
- Go to Deploys tab
- Click "Trigger deploy" → "Deploy site"
- Wait 1-2 minutes

### 4️⃣ Test
- Visit your site
- Ask a question
- Should work now! ✅

---

## Still Getting Errors?

**Make sure:**
- ✅ You copied the ENTIRE key from OpenRouter
- ✅ No extra spaces in the Netlify environment variable
- ✅ You clicked "Save" in Netlify
- ✅ You redeployed AFTER updating the variable
- ✅ Your OpenRouter account is active

**Check Function Logs:**
1. Netlify dashboard → Functions tab
2. Click "chat" function
3. Look for error messages

---

## Why This Happened

Your old key is invalid because:
- It was deleted/revoked from OpenRouter
- The account associated with it doesn't exist
- It was never a valid key

## Need Help?

Read the detailed guide: `API_KEY_ISSUE.md`
