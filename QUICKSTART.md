# Quick Start Guide

## Installation (5 minutes)

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment

Create `.env` in the root directory:
```env
GROQ_API_KEY=your_groq_api_key_here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_ADMIN_EMAIL=admin@example.com
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
npm run server
```
You should see:
```
✅ API running on http://localhost:3001
   GROQ_API_KEY:    ✅ found
   ADMIN_EMAIL:     admin@example.com
   ADMIN_PASSWORD:  ✅ found
   DATABASE:        ✅ SQLite (users.db)
✅ Created admin user: admin@example.com
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```
You should see:
```
  VITE ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

### 4. Login

Open http://localhost:5173/ in your browser.

**Default Admin Login:**
- Email: `admin@example.com`
- Password: `admin123`

**⚠️ Change these credentials in production!**

## User Types

### Super Admin
- Email must match `ADMIN_EMAIL` in `.env`
- Full access to admin panel
- Can manage all users

### Normal User
- Anyone can sign up
- Can generate resumes
- Cannot access admin features

## Testing

1. **Login as Admin:**
   - Use admin credentials
   - Click "Admin Panel" button
   - See all users, ban/unban, delete

2. **Create Normal User:**
   - Logout
   - Click "Sign up free"
   - Create account with different email
   - Login and test resume generation

3. **Test Security:**
   - Try wrong password 5 times
   - Account gets locked for 15 minutes
   - Wait or manually edit database to unlock

## Common Issues

**Backend won't start:**
```bash
# Make sure no other process is using port 3001
lsof -i :3001
# Kill process if needed
kill -9 <PID>
```

**Frontend can't connect:**
- Check `VITE_API_URL` in `frontend/.env`
- Make sure backend is running
- Check browser console for CORS errors

**Can't login:**
- Clear browser localStorage
- Check backend logs for errors
- Verify email/password in `.env`

**Database locked:**
- Only run one server instance
- Close any database browsers
- Restart the server

## What's Next?

✅ You're ready to use the app!

- See `MIGRATION_GUIDE.md` for full documentation
- Customize admin credentials in `.env`
- Deploy to production (see migration guide)
- Add more features as needed

## File Structure Overview

```
resume_generator_AI/
├── lib/auth.js              # SQLite authentication
├── api/
│   ├── auth.js              # Auth endpoints
│   ├── admin.js             # Admin endpoints
│   └── generate.js          # Resume generation
├── frontend/src/lib/
│   └── authClient.js        # Frontend auth client
├── server.js                # Backend server
├── users.db                 # SQLite database (auto-created)
└── .env                     # Configuration
```

Need help? Check `MIGRATION_GUIDE.md` for detailed docs!
