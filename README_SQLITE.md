# Resume Generator AI - SQLite Edition

## 🎉 What's New

This version replaces Supabase authentication with a local SQLite database, giving you complete control over user management with no external dependencies.

### Key Features
- ✅ **No Supabase needed** - Fully local authentication
- ✅ **Two-tier user system** - Super Admin + Normal Users
- ✅ **Enhanced security** - Account lockout, session management, secure tokens
- ✅ **Easy management** - CLI tool for user administration
- ✅ **Zero config** - Database auto-created on first run
- ✅ **Production ready** - Complete security features included

---

## 📖 Documentation

This package includes comprehensive documentation:

1. **QUICKSTART.md** - Get up and running in 5 minutes
2. **MIGRATION_GUIDE.md** - Complete documentation with troubleshooting
3. **CHANGES_SUMMARY.md** - Detailed overview of all changes
4. **This README** - High-level overview

**Start here:** Open `QUICKSTART.md` for installation instructions!

---

## ⚡ Quick Install

```bash
# 1. Extract the zip file
unzip resume_generator_AI_sqlite.zip
cd resume_generator_AI

# 2. Install dependencies
npm install
cd frontend && npm install && cd ..

# 3. Configure environment
cp .env.example .env
cp frontend/.env.example frontend/.env
# Edit both .env files with your settings

# 4. Start backend (Terminal 1)
npm run server

# 5. Start frontend (Terminal 2)
npm run dev

# 6. Open browser
# Navigate to http://localhost:5173
# Login: admin@example.com / admin123
```

**That's it!** See QUICKSTART.md for detailed steps.

---

## 🔑 Default Admin Credentials

- **Email**: `admin@example.com`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change these in `.env` before production use!

---

## 👥 User Types

### Super Admin
- Set via `ADMIN_EMAIL` in `.env`
- Access to admin panel
- Can manage all users (ban/unban/delete)
- Full application access

### Normal User
- Anyone can sign up
- Generate customized resumes
- No admin capabilities

---

## 🗄️ Database Management

Includes a powerful CLI tool (`dbutil.js`) for managing users:

```bash
# View all users
node dbutil.js list

# Create a user
node dbutil.js create user@example.com password123

# Make someone admin
node dbutil.js admin user@example.com

# Ban/unban users
node dbutil.js ban user@example.com
node dbutil.js unban user@example.com

# Unlock locked accounts
node dbutil.js unlock user@example.com

# Delete users
node dbutil.js delete user@example.com
```

Run `node dbutil.js` to see all available commands.

---

## 📁 What's Included

### New Files
- `lib/auth.js` - Complete SQLite authentication system
- `api/auth.js` - Authentication API endpoints  
- `frontend/src/lib/authClient.js` - Frontend auth client
- `dbutil.js` - Database management CLI
- `MIGRATION_GUIDE.md` - Complete documentation
- `QUICKSTART.md` - Quick start guide
- `CHANGES_SUMMARY.md` - Detailed change log

### Modified Files
- `api/admin.js` - Uses new auth system
- `frontend/src/App.jsx` - Updated auth imports
- `frontend/src/pages/AuthPage.jsx` - Updated auth imports
- `frontend/src/pages/AdminPage.jsx` - Uses localStorage
- `server.js` - Initializes database
- `package.json` - Added SQLite dependencies
- `.env.example` - New configuration format

### Removed
- All Supabase dependencies and configuration

---

## 🔒 Security Features

- **Password Hashing**: SHA-256 (consider bcrypt for production)
- **Account Lockout**: 5 failed attempts = 15 minute lock
- **Session Management**: 7-day token expiry with automatic cleanup
- **Secure Tokens**: 32-byte random hex generation
- **Admin Protection**: Token-based verification
- **No Plain Text**: Passwords never stored in plain text

---

## 📊 Database Schema

The SQLite database (`users.db`) contains:

**Users Table**:
- User credentials (email, password hash)
- Admin/ban status flags
- Login tracking (last login, failed attempts)
- Account lock information

**Sessions Table**:
- Active session tokens
- Session expiry tracking
- User associations

Database is automatically created on first server start.

---

## 🚀 Production Deployment

Before deploying to production:

1. **Change credentials** in `.env`:
   ```env
   ADMIN_EMAIL=your-admin@yourdomain.com
   ADMIN_PASSWORD=strong-password-here-12345
   ```

2. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)

3. **Enable HTTPS** for all connections

4. **Set file permissions**:
   ```bash
   chmod 600 users.db
   ```

5. **Configure CORS** for your domain in `server.js`

6. **Set up backups** of `users.db`

7. **Add rate limiting** to auth endpoints (recommended)

See MIGRATION_GUIDE.md for complete production checklist.

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001
# Kill process if needed
kill -9 <PID>
```

### Can't login
- Clear browser localStorage
- Check `.env` configuration
- Verify admin credentials match

### Database locked
- Only run one server instance
- Close database browsers
- Restart the server

### Account locked
```bash
# Unlock via CLI
node dbutil.js unlock user@example.com
```

For more help, see **MIGRATION_GUIDE.md** troubleshooting section.

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **QUICKSTART.md** | 5-minute setup guide |
| **MIGRATION_GUIDE.md** | Complete documentation, API reference, security |
| **CHANGES_SUMMARY.md** | Detailed overview of all changes |
| **README.md** | This file - high-level overview |

**Recommended reading order**:
1. This README (overview)
2. QUICKSTART.md (installation)
3. MIGRATION_GUIDE.md (deep dive)

---

## 🎯 Next Steps

1. **Install**: Follow QUICKSTART.md
2. **Test**: Login as admin, create test users
3. **Customize**: Update `.env` with your credentials
4. **Explore**: Try the admin panel and dbutil.js
5. **Deploy**: Review production checklist in MIGRATION_GUIDE.md

---

## 💡 Key Differences from Supabase Version

| Feature | Supabase Version | SQLite Version |
|---------|------------------|----------------|
| External dependency | ✓ Required | ✗ None |
| Setup complexity | Medium | Simple |
| Cost | May have fees | Free |
| Control | Limited | Full |
| Backup | Via Supabase | Copy users.db |
| Admin tools | Supabase dashboard | CLI + Admin panel |
| User management | Supabase API | Direct database |

---

## ✨ You're Ready!

Everything you need is included:
- ✅ Complete authentication system
- ✅ Database management tools  
- ✅ Comprehensive documentation
- ✅ Security features
- ✅ Admin panel
- ✅ Production-ready code

**Start with QUICKSTART.md and you'll be up and running in minutes!**

---

## 📞 Support

Having issues? Check the documentation in this order:

1. **QUICKSTART.md** - Installation issues
2. **MIGRATION_GUIDE.md** - Detailed troubleshooting
3. **CHANGES_SUMMARY.md** - Understanding changes
4. Code comments in `lib/auth.js` - Implementation details

---

## 📄 License

[Your License Here]

---

**Made with ❤️ - No Supabase Required!**
