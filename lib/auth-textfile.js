import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use /tmp on Vercel (serverless), local data directory otherwise
const dataDir = process.env.VERCEL ? "/tmp" : path.join(__dirname, "..", "data");
const usersFile = path.join(dataDir, "users.txt");
const sessionsFile = path.join(dataDir, "sessions.txt");

// Ensure data directory exists locally
if (!process.env.VERCEL && !fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
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

// File operations
function readUsers() {
  try {
    if (!fs.existsSync(usersFile)) return [];
    const content = fs.readFileSync(usersFile, "utf8");
    if (!content.trim()) return [];
    return content.split("\n").filter(line => line.trim()).map(line => {
      const parts = line.split("|");
      return {
        id: parts[0],
        email: parts[1],
        password_hash: parts[2],
        is_admin: parts[3] === "1",
        is_banned: parts[4] === "1",
        created_at: parts[5],
        last_sign_in_at: parts[6] || null,
        failed_login_attempts: parseInt(parts[7] || "0"),
        locked_until: parts[8] || null,
      };
    });
  } catch (error) {
    console.error("Error reading users:", error);
    return [];
  }
}

function writeUsers(users) {
  try {
    const content = users.map(u => 
      `${u.id}|${u.email}|${u.password_hash}|${u.is_admin ? "1" : "0"}|${u.is_banned ? "1" : "0"}|${u.created_at}|${u.last_sign_in_at || ""}|${u.failed_login_attempts || 0}|${u.locked_until || ""}`
    ).join("\n");
    fs.writeFileSync(usersFile, content, "utf8");
  } catch (error) {
    console.error("Error writing users:", error);
    throw error;
  }
}

function readSessions() {
  try {
    if (!fs.existsSync(sessionsFile)) return [];
    const content = fs.readFileSync(sessionsFile, "utf8");
    if (!content.trim()) return [];
    return content.split("\n").filter(line => line.trim()).map(line => {
      const parts = line.split("|");
      return {
        id: parts[0],
        user_id: parts[1],
        token: parts[2],
        created_at: parts[3],
        expires_at: parts[4],
      };
    });
  } catch (error) {
    console.error("Error reading sessions:", error);
    return [];
  }
}

function writeSessions(sessions) {
  try {
    const content = sessions.map(s => 
      `${s.id}|${s.user_id}|${s.token}|${s.created_at}|${s.expires_at}`
    ).join("\n");
    fs.writeFileSync(sessionsFile, content, "utf8");
  } catch (error) {
    console.error("Error writing sessions:", error);
    throw error;
  }
}

// Initialize with admin user
export async function initDB() {
  try {
    const users = readUsers();
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    
    const existingAdmin = users.find(u => u.email === adminEmail);
    if (!existingAdmin) {
      const adminId = generateId();
      const passwordHash = hashPassword(adminPassword);
      users.push({
        id: adminId,
        email: adminEmail,
        password_hash: passwordHash,
        is_admin: true,
        is_banned: false,
        created_at: new Date().toISOString(),
        last_sign_in_at: null,
        failed_login_attempts: 0,
        locked_until: null,
      });
      writeUsers(users);
      console.log(`✅ Created admin user: ${adminEmail}`);
    }
    
    return true;
  } catch (error) {
    console.error("Init error:", error);
    return false;
  }
}

// Auth functions
export async function signUp(email, password) {
  const users = readUsers();
  
  const existing = users.find(u => u.email === email);
  if (existing) {
    throw new Error("User already exists");
  }

  const userId = generateId();
  const passwordHash = hashPassword(password);

  users.push({
    id: userId,
    email,
    password_hash: passwordHash,
    is_admin: false,
    is_banned: false,
    created_at: new Date().toISOString(),
    last_sign_in_at: null,
    failed_login_attempts: 0,
    locked_until: null,
  });

  writeUsers(users);
  return { id: userId, email };
}

export async function signIn(email, password) {
  const users = readUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    throw new Error("Invalid email or password");
  }

  const user = users[userIndex];

  if (user.is_banned) {
    throw new Error("Account is banned");
  }

  // Check if account is locked
  if (user.locked_until) {
    const lockTime = new Date(user.locked_until);
    if (lockTime > new Date()) {
      const minutes = Math.ceil((lockTime - new Date()) / 60000);
      throw new Error(`Account locked. Try again in ${minutes} minute(s)`);
    } else {
      // Unlock account
      user.locked_until = null;
      user.failed_login_attempts = 0;
    }
  }

  const passwordHash = hashPassword(password);
  if (user.password_hash !== passwordHash) {
    user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
    
    if (user.failed_login_attempts >= 5) {
      user.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      writeUsers(users);
      throw new Error("Too many failed attempts. Account locked for 15 minutes.");
    }
    
    writeUsers(users);
    throw new Error("Invalid email or password");
  }

  // Reset failed attempts
  user.failed_login_attempts = 0;
  user.locked_until = null;
  user.last_sign_in_at = new Date().toISOString();
  writeUsers(users);

  // Create session
  const token = generateToken();
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const sessions = readSessions();
  sessions.push({
    id: sessionId,
    user_id: user.id,
    token,
    created_at: new Date().toISOString(),
    expires_at: expiresAt,
  });
  writeSessions(sessions);

  return {
    user: {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin,
    },
    session: {
      access_token: token,
      expires_at: expiresAt,
    },
  };
}

export async function verifyToken(token) {
  const sessions = readSessions();
  const session = sessions.find(s => s.token === token);

  if (!session) {
    throw new Error("Invalid token");
  }

  if (new Date(session.expires_at) < new Date()) {
    // Remove expired session
    const filtered = sessions.filter(s => s.id !== session.id);
    writeSessions(filtered);
    throw new Error("Token expired");
  }

  const users = readUsers();
  const user = users.find(u => u.id === session.user_id);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.is_banned) {
    throw new Error("Account is banned");
  }

  return {
    id: user.id,
    email: user.email,
    is_admin: user.is_admin,
  };
}

export async function signOut(token) {
  const sessions = readSessions();
  const filtered = sessions.filter(s => s.token !== token);
  writeSessions(filtered);
  return { success: true };
}

// Admin functions
export async function getAllUsers() {
  const users = readUsers();
  return users.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    banned_until: u.is_banned ? "2099-01-01" : null,
    is_admin: u.is_admin,
  }));
}

export async function deleteUser(userId) {
  const users = readUsers();
  const filtered = users.filter(u => u.id !== userId);
  writeUsers(filtered);

  const sessions = readSessions();
  const filteredSessions = sessions.filter(s => s.user_id !== userId);
  writeSessions(filteredSessions);

  return { success: true };
}

export async function banUser(userId) {
  const users = readUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.is_banned = true;
    writeUsers(users);
  }

  const sessions = readSessions();
  const filtered = sessions.filter(s => s.user_id !== userId);
  writeSessions(filtered);

  return { success: true };
}

export async function unbanUser(userId) {
  const users = readUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.is_banned = false;
    writeUsers(users);
  }
  return { success: true };
}

// Cleanup expired sessions
export async function cleanupExpiredSessions() {
  const sessions = readSessions();
  const now = new Date();
  const filtered = sessions.filter(s => new Date(s.expires_at) > now);
  
  if (filtered.length !== sessions.length) {
    writeSessions(filtered);
    console.log(`🧹 Cleaned up ${sessions.length - filtered.length} expired sessions`);
  }
}

// Initialize on module load
initDB().catch(console.error);
