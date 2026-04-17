# Deploy to Vercel with Text File Authentication

Your app now uses simple text files for authentication, which works perfectly on Vercel!

## ⚠️ Important Note About Vercel

**On Vercel's serverless platform:**
- Files stored in `/tmp` directory (automatic)
- **Users will be reset when the function cold-starts** (every ~5-15 minutes of inactivity)
- Admin user is recreated automatically on each start
- Best for: **demos, testing, personal projects with light usage**
- For production with many users: Consider Railway/Render (persistent storage)

**This is perfect for:**
- ✅ Portfolio demos
- ✅ Personal projects
- ✅ Testing/development
- ✅ Low-traffic apps where occasional resets are acceptable

---

## Quick Deploy to Vercel

### Method 1: Deploy from GitHub (Recommended)

#### Step 1: Push to GitHub

```bash
# Initialize git if haven't already
git init
git add .
git commit -m "Ready for Vercel"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up / Login (use GitHub)
3. Click **"New Project"**
4. **Import** your GitHub repository
5. Vercel will auto-detect settings

#### Step 3: Configure Build Settings

Vercel should auto-detect, but verify:

**Framework Preset:** Other
**Root Directory:** `./`
**Build Command:** 
```bash
cd frontend && npm install && npm run build
```
**Output Directory:** `frontend/dist`
**Install Command:** `npm install`

#### Step 4: Add Environment Variables

Click "Environment Variables" and add:

```
GROQ_API_KEY=your_groq_api_key_here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
NODE_ENV=production
```

#### Step 5: Deploy

Click **"Deploy"** and wait 2-3 minutes.

You'll get a URL like: `https://your-project.vercel.app`

---

### Method 2: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Setup and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? (your choice)
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

---

## Configure vercel.json

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Or simpler approach** - just let Vercel handle it automatically with the build settings above.

---

## Update Frontend for Production

Your frontend needs to know the API URL.

### Option 1: Use Environment Variable

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-project.vercel.app
VITE_ADMIN_EMAIL=admin@example.com
```

Then rebuild:
```bash
cd frontend
npm run build
cd ..
git add .
git commit -m "Update API URL"
git push
```

Vercel will auto-redeploy.

### Option 2: Use Relative URLs (Easier)

Update `frontend/src/lib/authClient.js`:

```javascript
// Change this line:
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// To this:
const API_URL = import.meta.env.VITE_API_URL || "";
```

This makes the frontend use the same domain as it's hosted on.

---

## File Structure for Vercel

Your project should look like this:

```
your-project/
├── api/
│   ├── auth.js
│   ├── admin.js
│   └── generate.js
├── lib/
│   └── auth-textfile.js        # Text file auth (no SQLite!)
├── frontend/
│   ├── src/
│   ├── dist/                   # Built frontend (generated)
│   ├── package.json
│   └── vite.config.js
├── server.js
├── package.json
├── vercel.json                 # Optional
└── .env                        # Not pushed to git
```

---

## Testing Your Deployment

1. **Visit your Vercel URL**
2. **Sign up** with a test account
3. **Login as admin**:
   - Email: `admin@example.com`
   - Password: (from your env)
4. **Test admin panel**
5. **Generate a resume**
6. **Important**: Users will reset after ~5-15 min of inactivity (this is normal on Vercel)

---

## How It Works on Vercel

### Serverless Functions

Each API endpoint runs as a serverless function:
- `/api/auth` → auth.js function
- `/api/admin` → admin.js function
- `/api/generate` → generate.js function

### File Storage

- Uses `/tmp` directory (Vercel provides this)
- Files reset when functions cold-start
- Admin user recreates automatically
- Perfect for demos and low-traffic apps

### What Happens

1. **First request**: Function starts, creates `users.txt` with admin
2. **Subsequent requests**: Uses existing `users.txt` 
3. **After inactivity**: Function sleeps, files cleared
4. **Next request**: Cycle repeats (admin recreated)

---

## Limitations & Solutions

### Limitation 1: Users Reset

**Issue**: Users are lost after inactivity

**Solutions**:
- **Accept it**: Fine for demos and personal projects
- **Use Railway/Render**: $5-7/month with persistent storage
- **Upgrade to database**: Use Vercel Postgres (~$20/month)

### Limitation 2: Cold Starts

**Issue**: First request takes 1-3 seconds

**Solutions**:
- **Accept it**: Normal for serverless
- **Vercel Pro**: Faster cold starts
- **Keep alive**: Use a ping service (not recommended, wastes resources)

### Limitation 3: Multiple Users Simultaneously

**Issue**: Text file writes could conflict with many concurrent users

**Solutions**:
- **Accept it**: Fine for <10 concurrent users
- **Use Railway**: If you need more users
- **Use database**: Vercel Postgres for high traffic

---

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```
GROQ_API_KEY=your_groq_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password-here
NODE_ENV=production
```

**Important**: Don't use default `admin123` in production!

---

## Custom Domain

1. Go to Vercel dashboard
2. Click your project → Settings → Domains
3. Add your domain
4. Update DNS records as shown
5. Automatic HTTPS included!

---

## Troubleshooting

### Build Fails

**Check Vercel build logs:**
- Missing dependencies?
- Frontend build errors?
- Wrong Node version?

**Solution:**
```bash
# Test build locally first
cd frontend
npm install
npm run build
cd ..
npm install
npm start
```

### Can't Login

**Issue**: "Invalid email or password"

**Solutions:**
- Check environment variables in Vercel
- Verify admin email/password
- Check function logs in Vercel

### 404 on API Calls

**Issue**: API routes return 404

**Solutions:**
- Check `vercel.json` routing
- Verify API files in `/api` directory
- Look at Vercel function logs

### Users Disappear

**This is expected!** Files reset on cold start.

**Solutions:**
- Use Railway/Render for persistence
- Or accept it for demos

---

## Monitoring

### View Logs

Vercel Dashboard → Your Project → Deployments → Click deployment → Logs

### Function Invocations

Vercel Dashboard → Your Project → Analytics

Shows how many times your functions are called.

---

## Cost

**Hobby Plan (Free):**
- ✅ 100 GB bandwidth/month
- ✅ Unlimited API functions
- ✅ Automatic HTTPS
- ✅ Perfect for personal projects

**Pro Plan ($20/month):**
- Better performance
- More bandwidth
- Team features

---

## Production Checklist

Before going live:

- [ ] Change `ADMIN_PASSWORD` to strong password
- [ ] Set production `GROQ_API_KEY`
- [ ] Update `VITE_API_URL` in frontend
- [ ] Test all features on Vercel
- [ ] Add custom domain (optional)
- [ ] Set up monitoring
- [ ] Understand user reset behavior

---

## When to Use This Approach

✅ **Use text files on Vercel for:**
- Personal portfolio demos
- Testing/development
- Low-traffic apps (<100 users)
- Projects where occasional resets are okay

❌ **Don't use for:**
- High-traffic production apps
- Apps with many users
- E-commerce or critical data
- Apps needing 24/7 uptime without resets

**For those cases → Use Railway ($5/mo) or Vercel Postgres ($20/mo)**

---

## Alternative: Deploy Backend on Railway, Frontend on Vercel

For best of both worlds:

1. **Deploy backend on Railway** (persistent text files)
2. **Deploy frontend on Vercel** (fast CDN)
3. Update frontend `VITE_API_URL` to Railway URL

This gives you:
- ✅ Persistent users (Railway)
- ✅ Fast frontend (Vercel CDN)
- ✅ Low cost (~$5/month total)

---

## Summary

Your text-file authentication system is **production-ready for Vercel**! Just remember:

1. Users reset after inactivity (expected behavior)
2. Perfect for demos and personal projects
3. For high-traffic apps, consider Railway or Vercel Postgres
4. Deploy with one click from GitHub
5. Automatic HTTPS and scaling included

**Deploy now and enjoy your app on Vercel!** 🚀
