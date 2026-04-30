#!/usr/bin/env node

/**
 * Database Management Utility
 * 
 * Usage:
 *   node dbutil.js list                    # List all users
 *   node dbutil.js create <email> <pwd>    # Create user
 *   node dbutil.js admin <email>           # Make user admin
 *   node dbutil.js ban <email>             # Ban user
 *   node dbutil.js unban <email>           # Unban user
 *   node dbutil.js delete <email>          # Delete user
 *   node dbutil.js unlock <email>          # Unlock account
 *   node dbutil.js reset                   # Reset database
 */

import sqlite3 from "sqlite3";
import { open } from "sqlite";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "users.db");

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function getDb() {
  return await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

async function listUsers() {
  const db = await getDb();
  const users = await db.all(
    `SELECT email, is_admin, is_banned, created_at, last_sign_in_at, 
            failed_login_attempts, locked_until 
     FROM users ORDER BY created_at DESC`
  );
  
  console.log("\n📋 Users in database:\n");
  console.table(users.map(u => ({
    email: u.email,
    admin: u.is_admin ? "✓" : "",
    banned: u.is_banned ? "✓" : "",
    locked: u.locked_until ? "✓" : "",
    created: u.created_at,
    last_login: u.last_sign_in_at || "never",
  })));
  
  await db.close();
}

async function createUser(email, password, isAdmin = false) {
  const db = await getDb();
  const existing = await db.get("SELECT * FROM users WHERE email = ?", email);
  
  if (existing) {
    console.log(`❌ User ${email} already exists`);
    await db.close();
    return;
  }
  
  const id = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password);
  
  await db.run(
    "INSERT INTO users (id, email, password_hash, is_admin) VALUES (?, ?, ?, ?)",
    id, email, passwordHash, isAdmin ? 1 : 0
  );
  
  console.log(`✅ Created ${isAdmin ? "admin" : "user"}: ${email}`);
  await db.close();
}

async function makeAdmin(email) {
  const db = await getDb();
  const result = await db.run("UPDATE users SET is_admin = 1 WHERE email = ?", email);
  
  if (result.changes === 0) {
    console.log(`❌ User ${email} not found`);
  } else {
    console.log(`✅ Made ${email} an admin`);
  }
  
  await db.close();
}

async function banUser(email) {
  const db = await getDb();
  const result = await db.run("UPDATE users SET is_banned = 1 WHERE email = ?", email);
  await db.run("DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE email = ?)", email);
  
  if (result.changes === 0) {
    console.log(`❌ User ${email} not found`);
  } else {
    console.log(`✅ Banned ${email}`);
  }
  
  await db.close();
}

async function unbanUser(email) {
  const db = await getDb();
  const result = await db.run("UPDATE users SET is_banned = 0 WHERE email = ?", email);
  
  if (result.changes === 0) {
    console.log(`❌ User ${email} not found`);
  } else {
    console.log(`✅ Unbanned ${email}`);
  }
  
  await db.close();
}

async function deleteUser(email) {
  const db = await getDb();
  const result = await db.run("DELETE FROM users WHERE email = ?", email);
  
  if (result.changes === 0) {
    console.log(`❌ User ${email} not found`);
  } else {
    console.log(`✅ Deleted ${email}`);
  }
  
  await db.close();
}

async function unlockAccount(email) {
  const db = await getDb();
  const result = await db.run(
    "UPDATE users SET locked_until = NULL, failed_login_attempts = 0 WHERE email = ?",
    email
  );
  
  if (result.changes === 0) {
    console.log(`❌ User ${email} not found`);
  } else {
    console.log(`✅ Unlocked ${email}`);
  }
  
  await db.close();
}

async function resetDatabase() {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log("✅ Deleted users.db");
  }
  console.log("Run the server to recreate the database with fresh admin user");
}

// Main CLI
const [,, command, ...args] = process.argv;

(async () => {
  try {
    if (!fs.existsSync(dbPath)) {
      console.log("❌ Database not found. Run the server first to create it.");
      process.exit(1);
    }
    
    switch (command) {
      case "list":
        await listUsers();
        break;
      
      case "create":
        if (args.length < 2) {
          console.log("Usage: node dbutil.js create <email> <password>");
          process.exit(1);
        }
        await createUser(args[0], args[1], false);
        break;
      
      case "createadmin":
        if (args.length < 2) {
          console.log("Usage: node dbutil.js createadmin <email> <password>");
          process.exit(1);
        }
        await createUser(args[0], args[1], true);
        break;
      
      case "admin":
        if (args.length < 1) {
          console.log("Usage: node dbutil.js admin <email>");
          process.exit(1);
        }
        await makeAdmin(args[0]);
        break;
      
      case "ban":
        if (args.length < 1) {
          console.log("Usage: node dbutil.js ban <email>");
          process.exit(1);
        }
        await banUser(args[0]);
        break;
      
      case "unban":
        if (args.length < 1) {
          console.log("Usage: node dbutil.js unban <email>");
          process.exit(1);
        }
        await unbanUser(args[0]);
        break;
      
      case "delete":
        if (args.length < 1) {
          console.log("Usage: node dbutil.js delete <email>");
          process.exit(1);
        }
        await deleteUser(args[0]);
        break;
      
      case "unlock":
        if (args.length < 1) {
          console.log("Usage: node dbutil.js unlock <email>");
          process.exit(1);
        }
        await unlockAccount(args[0]);
        break;
      
      case "reset":
        await resetDatabase();
        break;
      
      default:
        console.log(`
Database Management Utility

Commands:
  list                    List all users
  create <email> <pwd>    Create normal user
  createadmin <e> <pwd>   Create admin user
  admin <email>           Make user admin
  ban <email>             Ban user
  unban <email>           Unban user
  delete <email>          Delete user
  unlock <email>          Unlock locked account
  reset                   Delete database (requires server restart)

Examples:
  node dbutil.js list
  node dbutil.js create user@example.com password123
  node dbutil.js admin user@example.com
  node dbutil.js unlock user@example.com
        `);
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
