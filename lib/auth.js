import sqlite3 from "sqlite3";
import { open } from "sqlite";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "users.db");

let db = null;

// Initialize database
export async function initDB() {
  if (db) return db;
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      is_banned INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_sign_in_at TEXT,
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until TEXT
    )
  `);

  // Create sessions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  `);

  // Create default admin if doesn't exist
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  
  const existingAdmin = await db.get("SELECT * FROM users WHERE email = ?", adminEmail);
  if (!existingAdmin) {
    const adminId = generateId();
    const passwordHash = hashPassword(adminPassword);
    await db.run(
      "INSERT INTO users (id, email, password_hash, is_admin) VALUES (?, ?, ?, 1)",
      adminId, adminEmail, passwordHash
    );
    console.log(`✅ Created admin user: ${adminEmail}`);
  }

  return db;
}

// Helper functions
function generateId() {
  return crypto.randomBytes(16).toString("hex");
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Auth functions
export async function signUp(email, password) {
  const database = await initDB();
  
  // Check if user exists
  const existing = await database.get("SELECT * FROM users WHERE email = ?", email);
  if (existing) {
    throw new Error("User already exists");
  }

  const userId = generateId();
  const passwordHash = hashPassword(password);

  await database.run(
    "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
    userId, email, passwordHash
  );

  return { id: userId, email };
}

export async function signIn(email, password) {
  const database = await initDB();
  
  const user = await database.get("SELECT * FROM users WHERE email = ?", email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if account is banned
  if (user.is_banned) {
    throw new Error("Account is banned");
  }

  // Check if account is temporarily locked
  if (user.locked_until) {
    const lockTime = new Date(user.locked_until);
    if (lockTime > new Date()) {
      const minutes = Math.ceil((lockTime - new Date()) / 60000);
      throw new Error(`Account locked. Try again in ${minutes} minute(s)`);
    } else {
      // Unlock account
      await database.run(
        "UPDATE users SET locked_until = NULL, failed_login_attempts = 0 WHERE id = ?",
        user.id
      );
    }
  }

  const passwordHash = hashPassword(password);
  if (user.password_hash !== passwordHash) {
    // Increment failed attempts
    const failedAttempts = (user.failed_login_attempts || 0) + 1;
    
    // Lock account after 5 failed attempts for 15 minutes
    if (failedAttempts >= 5) {
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await database.run(
        "UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?",
        failedAttempts, lockUntil, user.id
      );
      throw new Error("Too many failed attempts. Account locked for 15 minutes.");
    }
    
    await database.run(
      "UPDATE users SET failed_login_attempts = ? WHERE id = ?",
      failedAttempts, user.id
    );
    throw new Error("Invalid email or password");
  }

  // Reset failed attempts on successful login
  await database.run(
    "UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_sign_in_at = CURRENT_TIMESTAMP WHERE id = ?",
    user.id
  );

  // Create session token
  const token = generateToken();
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  await database.run(
    "INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
    sessionId, user.id, token, expiresAt
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin === 1,
    },
    session: {
      access_token: token,
      expires_at: expiresAt,
    },
  };
}

export async function verifyToken(token) {
  const database = await initDB();
  
  const session = await database.get(
    `SELECT s.*, u.email, u.is_admin, u.is_banned 
     FROM sessions s 
     JOIN users u ON s.user_id = u.id 
     WHERE s.token = ?`,
    token
  );

  if (!session) {
    throw new Error("Invalid token");
  }

  if (new Date(session.expires_at) < new Date()) {
    await database.run("DELETE FROM sessions WHERE id = ?", session.id);
    throw new Error("Token expired");
  }

  if (session.is_banned) {
    throw new Error("Account is banned");
  }

  return {
    id: session.user_id,
    email: session.email,
    is_admin: session.is_admin === 1,
  };
}

export async function signOut(token) {
  const database = await initDB();
  await database.run("DELETE FROM sessions WHERE token = ?", token);
  return { success: true };
}

// Admin functions
export async function getAllUsers() {
  const database = await initDB();
  const users = await database.all(
    "SELECT id, email, created_at, last_sign_in_at, is_banned, is_admin FROM users ORDER BY created_at DESC"
  );
  
  return users.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    banned_until: u.is_banned ? "2099-01-01" : null,
    is_admin: u.is_admin === 1,
  }));
}

export async function deleteUser(userId) {
  const database = await initDB();
  await database.run("DELETE FROM users WHERE id = ?", userId);
  await database.run("DELETE FROM sessions WHERE user_id = ?", userId);
  return { success: true };
}

export async function banUser(userId) {
  const database = await initDB();
  await database.run("UPDATE users SET is_banned = 1 WHERE id = ?", userId);
  await database.run("DELETE FROM sessions WHERE user_id = ?", userId);
  return { success: true };
}

export async function unbanUser(userId) {
  const database = await initDB();
  await database.run("UPDATE users SET is_banned = 0 WHERE id = ?", userId);
  return { success: true };
}

// Clean up expired sessions periodically
export async function cleanupExpiredSessions() {
  const database = await initDB();
  await database.run("DELETE FROM sessions WHERE datetime(expires_at) < datetime('now')");
}

// Initialize DB on module load
initDB().catch(console.error);
