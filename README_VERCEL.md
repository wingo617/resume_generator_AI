# Resume Generator - Text File Authentication for Vercel

## ✨ What's New

This version uses **simple text files** instead of SQLite for authentication, making it **perfect for Vercel** deployment!

### Key Features
- ✅ **Deploy to Vercel in 2 minutes** - No database setup needed
- ✅ **No external dependencies** - Just text files
- ✅ **Zero configuration** - Works out of the box
- ✅ **Two user types** - Super Admin + Normal Users
- ✅ **Automatic admin creation** - On first run
- ✅ **Security features** - Password hashing, account lockout, sessions

---

## 🚀 Quick Deploy to Vercel

### Method 1: From GitHub (Easiest)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Deploy to Vercel"
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in

3. **Click "New Project"** and import your repo

4. **Add Environment Variables**:
   ```
   GROQ_API_KEY=your_key
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your-password
   ```

5. **Click Deploy** - Done! ✅

### Method 2: With Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

---

## 📋 How It Works

### Authentication Storage
- **Users**: `data/users.txt` (or `/tmp/users.txt` on Vercel)
- **Sessions**: `data/sessions.txt` (or `/tmp/sessions.txt` on Vercel)

### File Format (users.txt)
```
user_id|email|password_hash|is_admin|is_banned|created_at|last_sign_in|failed_attempts|locked_until
```

### File Format (sessions.txt)
```
session_id|user_id|token|created_at|expires_at
```

---

## ⚠️ Important: Vercel Behavior

On Vercel's serverless platform:

**What happens:**
- Files stored in `/tmp` directory
- **Users reset after ~5-15 minutes of inactivity** (normal serverless behavior)
- Admin user automatically recreated on each cold start
- Perfect for demos, testing, and personal projects

**This is ideal for:**
- ✅ Portfolio demos
- ✅ Personal projects  
- ✅ Low-traffic apps
- ✅ Testing/staging environments

**Not ideal for:**
- ❌ High-traffic production apps
- ❌ Apps with many registered users
- ❌ E-commerce or critical data

**For production with persistent users**, see alternatives below.

---

## 🔑 Default Admin Credentials

- **Email**: `admin@example.com` (from `ADMIN_EMAIL` env var)
- **Password**: `admin123` (from `ADMIN_PASSWORD` env var)

**⚠️ Change these before deploying!**

---

## 📦 What's Included

### New/Modified Files
- `lib/auth-textfile.js` - Text file authentication system
- `api/auth.js` - Uses text file auth
- `api/admin.js` - Uses text file auth
- `server.js` - Updated for text files + serves frontend
- `package.json` - Removed SQLite dependencies
- `VERCEL_TEXTFILE_DEPLOY.md` - Complete deployment guide

### Everything Else
- Frontend (React + Vite)
- Admin panel
- Resume generation
- All existing features

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your keys

# Build frontend
cd frontend
npm run build
cd ..

# Start server
npm start

# Visit http://localhost:3001
```

---

## 🌐 Production Deployment Options

### Option 1: Vercel (Users Reset)
- **Cost**: Free
- **Setup**: 2 minutes
- **Storage**: Temporary (/tmp)
- **Best for**: Demos, personal projects
- **Guide**: `VERCEL_TEXTFILE_DEPLOY.md`

### Option 2: Railway (Persistent Storage)
- **Cost**: ~$5/month
- **Setup**: 5 minutes
- **Storage**: Persistent disk
- **Best for**: Production apps
- **Users persist**: ✅ Yes

### Option 3: Render (Free Tier Available)
- **Cost**: Free or $7/month
- **Setup**: 5 minutes  
- **Storage**: Persistent disk (1GB free)
- **Best for**: Small production apps
- **Users persist**: ✅ Yes

### Option 4: Vercel + Vercel Postgres
- **Cost**: ~$20/month
- **Setup**: 10 minutes
- **Storage**: Managed database
- **Best for**: High-traffic production
- **Users persist**: ✅ Yes
- **See**: `VERCEL_DEPLOYMENT.md` (in previous version)

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **VERCEL_TEXTFILE_DEPLOY.md** | Complete Vercel deployment guide |
| **QUICKSTART.md** | Local setup guide |
| **MIGRATION_GUIDE.md** | Full documentation |
| **TROUBLESHOOTING_AUTH.md** | Fix common issues |

---

## 🔒 Security Features

- **Password Hashing**: SHA-256
- **Account Lockout**: 5 failed attempts = 15 min lock
- **Session Management**: 7-day expiry
- **Secure Tokens**: 32-byte random hex
- **No Plain Text**: Passwords never stored unhashed

---

## 🎯 Quick Comparison

| Storage | Vercel | Railway | Render Free | Vercel+DB |
|---------|--------|---------|-------------|-----------|
| Cost | Free | $5/mo | Free | $20/mo |
| Users Persist | ❌ | ✅ | ✅ | ✅ |
| Deploy Time | 2 min | 5 min | 5 min | 10 min |
| Code Changes | None | None | None | Some |
| Best For | Demos | Prod | Small apps | Scale |

---

## 💡 Recommendations

### For Your Use Case:

**Just testing/demo?**
→ Deploy to Vercel now (2 minutes)

**Want persistent users?**
→ Deploy to Railway ($5/month)

**Need high traffic?**
→ Use Vercel + Postgres ($20/month)

**Want free + persistent?**
→ Try Render.com (free tier with 1GB disk)

---

## ✅ Deployment Checklist

Before deploying:

- [ ] Update `.env` with real values
- [ ] Change `ADMIN_PASSWORD` to strong password
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Test locally: `npm start`
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Add environment variables
- [ ] Test login with admin credentials
- [ ] Understand user reset behavior (if Vercel)

---

## 🐛 Troubleshooting

### Users Disappear on Vercel
- **This is normal!** Serverless functions reset after inactivity
- Use Railway/Render for persistence

### Build Fails
```bash
# Test locally first
cd frontend && npm run build && cd ..
npm start
```

### Can't Login
- Check environment variables in Vercel
- Verify admin email/password match
- Check function logs

---

## 📞 Need Help?

1. Read `VERCEL_TEXTFILE_DEPLOY.md` for detailed guide
2. Check `TROUBLESHOOTING_AUTH.md` for common issues
3. Review Vercel function logs

---

## 🎉 You're Ready!

Your app is **production-ready for Vercel**! 

**Two ways to deploy:**
1. **Quick demo**: Vercel (users reset, free)
2. **Real production**: Railway (users persist, $5/mo)

Choose based on your needs and deploy in minutes! 🚀

---

**Made with ❤️ - Deploy Anywhere, No Database Required!**
