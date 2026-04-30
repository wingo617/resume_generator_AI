# TROUBLESHOOTING: "No handler for /api/auth/signin" Error

## The Problem
If you see the error "No handler for /api/auth/signin", it means the server routing is not finding the auth handler.

## Quick Fix

The issue is now fixed in the updated code, but if you still see this error:

### Solution 1: Check Server Logs
When you start the server with `npm run server`, you should see:

```
📁 Loading API handlers from: /path/to/api
   ✅ Loaded handler: admin
   ✅ Loaded handler: auth
   ✅ Loaded handler: generate
📋 Total handlers loaded: 3
✅ API running on http://localhost:3001
```

**If you DON'T see "✅ Loaded handler: auth"**, the auth.js file might have a syntax error.

### Solution 2: Verify Files Exist
```bash
ls -la api/
```

You should see:
- `admin.js`
- `auth.js`
- `generate.js`

### Solution 3: Check for Import Errors
The server might fail to load `api/auth.js` if there's an error in `lib/auth.js`.

Run the server and look for any error messages during startup.

### Solution 4: Restart the Server
Sometimes Node.js caches modules. Stop the server (Ctrl+C) and restart:

```bash
npm run server
```

### Solution 5: Clear Node Cache (if needed)
```bash
rm -rf node_modules
npm install
npm run server
```

## What the Fix Does

The updated code:
1. **Changed URL matching** in `server.js`: Now uses `/^\/api\/([^/?]+)/` which stops at the first `/` or `?`, so `/api/auth/signin` correctly extracts `auth` as the handler name
2. **Added logging** to show which handlers are loaded at startup
3. **Added better error messages** to show available handlers when one is not found
4. **Updated auth.js** to be more flexible with URL matching

## Testing the Fix

1. **Start the server**:
   ```bash
   npm run server
   ```

2. **Check the output** - you should see:
   ```
   ✅ Loaded handler: auth
   ```

3. **Try logging in** - it should now work!

## Still Not Working?

If you still see the error after the fix:

1. **Check your `.env` file**:
   ```env
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123
   ```

2. **Check frontend `.env` file**:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

3. **Verify the database was created**:
   ```bash
   ls -la users.db
   ```
   If it exists, try deleting it and restarting:
   ```bash
   rm users.db
   npm run server
   ```

4. **Check browser console** (F12) for any CORS or network errors

5. **Test the API directly** with curl:
   ```bash
   curl -X POST http://localhost:3001/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin123"}'
   ```
   
   You should get a JSON response with a token.

## Understanding the Error

The original error occurred because:
- Frontend calls: `http://localhost:3001/api/auth/signin`
- Server regex matched: `/api/([^?]+)` = captures `auth/signin`
- Server looked for: `handlers['auth/signin']` ❌ (doesn't exist)
- But handler is named: `handlers['auth']` ✓

The fix changes the regex to `/api/([^/?]+)` which:
- Stops at the first `/` or `?`
- Captures only `auth`
- Correctly finds `handlers['auth']` ✓
- The handler then checks `req.url` to determine which action (signin/signup/etc)

## Need More Help?

Run these diagnostic commands:

```bash
# Check if files exist
ls -la api/auth.js lib/auth.js

# Check for syntax errors
node --check api/auth.js
node --check lib/auth.js

# See what Node is trying to load
node -e "console.log(import('file://'+process.cwd()+'/api/auth.js'))"
```

If none of these work, check the included MIGRATION_GUIDE.md for more troubleshooting steps.
