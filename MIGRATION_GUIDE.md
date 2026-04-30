# Resume Generator AI - SQLite Auth Version

This is a resume generator application that uses AI to create customized resumes. The authentication system has been migrated from Supabase to a local SQLite database.

## Changes from Supabase Version

### What Changed
- ✅ **Removed Supabase dependency** - No external authentication service needed
- ✅ **Added SQLite database** - Local user authentication stored in `users.db`
- ✅ **Two user types**: Super Admin and Normal Users
- ✅ **Security features**: Password hashing, account locking after failed attempts, session management
- ✅ **Admin panel**: Manage users, ban/unban, delete accounts

### New Features
- Account lockout after 5 failed login attempts (15 minutes)
- Session-based authentication with 7-day expiry
- Automatic admin user creation on first run
- Local data storage (no cloud dependencies)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Steps

1. **Install backend dependencies:**
   ```bash
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Configure environment variables:**
   
   Backend (root directory `.env`):
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123
   ```

   Frontend (`frontend/.env`):
   ```bash
   cd frontend
   cp .env.example .env
   ```
   
   Edit `frontend/.env` and set:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_ADMIN_EMAIL=admin@example.com
   ```

4. **Start the backend server:**
   ```bash
   npm run server
   ```
   
   The server will:
   - Create the SQLite database (`users.db`) automatically
   - Create the admin user with credentials from `.env`
   - Start listening on `http://localhost:3001`

5. **Start the frontend (in a new terminal):**
   ```bash
   npm run dev
   ```
   
   The frontend will start on `http://localhost:5173`

## Default Admin Credentials

On first run, an admin account is automatically created:
- **Email**: `admin@example.com` (or your ADMIN_EMAIL from .env)
- **Password**: `admin123` (or your ADMIN_PASSWORD from .env)

**⚠️ IMPORTANT**: Change these credentials in production!

## User Types

### Super Admin
- Access to admin panel
- Can view all users
- Can ban/unban users
- Can delete user accounts
- Full resume generation access

### Normal User
- Can sign up and login
- Can generate customized resumes
- Cannot access admin features

## Database Structure

The SQLite database (`users.db`) contains:

### Users Table
- `id` - Unique user ID
- `email` - User email (unique)
- `password_hash` - SHA-256 hashed password
- `is_admin` - Admin flag (0 or 1)
- `is_banned` - Banned flag (0 or 1)
- `created_at` - Account creation timestamp
- `last_sign_in_at` - Last login timestamp
- `failed_login_attempts` - Failed login counter
- `locked_until` - Account lock expiry time

### Sessions Table
- `id` - Session ID
- `user_id` - Reference to user
- `token` - Session token
- `created_at` - Session creation time
- `expires_at` - Session expiry time (7 days default)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Verify session

### Admin (requires admin token)
- `GET /api/admin` - List all users
- `POST /api/admin` - Perform admin actions (ban/unban/delete)

### Resume Generation
- `POST /api/generate` - Generate resume (requires auth token)

## Security Features

### Password Security
- SHA-256 password hashing
- Minimum 6 character password requirement
- No plain text password storage

### Account Protection
- Account lockout after 5 failed login attempts
- 15-minute lockout duration
- Automatic unlock after timeout

### Session Management
- Token-based authentication
- 7-day session expiry
- Automatic cleanup of expired sessions
- Secure token generation (32-byte random hex)

### Admin Protection
- Admin actions require valid admin token
- Email verification for admin access
- Separate admin flag in database

## Migration from Supabase

If you have an existing Supabase version:

1. **Export user data** from Supabase (optional)
2. **Update your codebase** with the new files
3. **Remove Supabase configuration**:
   - Delete `frontend/src/lib/supabase.js`
   - Remove `@supabase/supabase-js` from `frontend/package.json`
4. **Add new files**:
   - `lib/auth.js` - SQLite auth module
   - `api/auth.js` - Auth API endpoints
   - `frontend/src/lib/authClient.js` - Frontend auth client
5. **Install dependencies**: `npm install` (both root and frontend)
6. **Configure .env files** as described above
7. **Run the application**

## File Structure

```
resume_generator_AI/
├── lib/
│   └── auth.js                    # SQLite authentication module
├── api/
│   ├── auth.js                    # Auth API endpoints
│   ├── admin.js                   # Admin API endpoints (updated)
│   └── generate.js                # Resume generation API
├── frontend/
│   └── src/
│       ├── lib/
│       │   └── authClient.js      # Frontend auth client (replaces supabase.js)
│       ├── pages/
│       │   ├── AuthPage.jsx       # Login/signup page
│       │   ├── AdminPage.jsx      # Admin panel
│       │   └── ...
│       └── App.jsx                # Main app component
├── server.js                      # Backend server
├── users.db                       # SQLite database (auto-created)
├── .env                           # Backend environment variables
└── frontend/.env                  # Frontend environment variables
```

## Troubleshooting

### Database Issues
**Problem**: "Database is locked" error
**Solution**: Make sure only one server instance is running

**Problem**: Admin user not created
**Solution**: Check ADMIN_EMAIL and ADMIN_PASSWORD in `.env`, delete `users.db` and restart server

### Authentication Issues
**Problem**: "Invalid token" error
**Solution**: Clear browser localStorage and login again

**Problem**: Cannot login after 5 attempts
**Solution**: Wait 15 minutes or manually edit `users.db` to clear `locked_until` field

### Connection Issues
**Problem**: Frontend cannot connect to backend
**Solution**: Verify VITE_API_URL in `frontend/.env` matches server URL (default: http://localhost:3001)

## Production Deployment

For production:

1. **Change admin credentials** in `.env`
2. **Use HTTPS** for all connections
3. **Set strong passwords** (minimum 12 characters recommended)
4. **Backup `users.db`** regularly
5. **Set restrictive file permissions** on `users.db` (chmod 600)
6. **Use environment-specific `.env` files**
7. **Consider adding rate limiting** to API endpoints
8. **Enable CORS properly** for your production domain

## Additional Security Recommendations

- [ ] Add HTTPS/TLS in production
- [ ] Implement rate limiting on auth endpoints
- [ ] Add email verification (optional)
- [ ] Use stronger password hashing (bcrypt/argon2)
- [ ] Add 2FA support (optional)
- [ ] Implement password reset flow
- [ ] Add audit logging
- [ ] Regular database backups
- [ ] Monitor failed login attempts

## Support

For issues or questions:
1. Check this README
2. Review the code comments in `lib/auth.js`
3. Check browser console for errors
4. Check server logs for backend errors

## License

[Your License Here]
