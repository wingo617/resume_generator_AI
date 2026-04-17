import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initDB } from "./lib/auth-textfile.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  });
}

const handlers = {};
const apiDir = path.join(__dirname, "api");
console.log("📁 Loading API handlers from:", apiDir);
for (const file of fs.readdirSync(apiDir)) {
  if (!file.endsWith(".js")) continue;
  const name = file.replace(".js", "");
  const mod = await import(`./api/${file}`);
  handlers[name] = mod.default;
  console.log(`   ✅ Loaded handler: ${name}`);
}
console.log(`📋 Total handlers loaded: ${Object.keys(handlers).length}`);

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.end();

  // Handle API routes
  const match = req.url?.match(/^\/api\/([^/?]+)/);
  if (match) {
    const handlerName = match[1];
    const handler = handlers[handlerName];
    if (!handler) {
      console.log(`❌ No handler found for: ${handlerName}`);
      console.log(`   Available handlers: ${Object.keys(handlers).join(", ")}`);
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: `No handler for /api/${handlerName}` }));
    }
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        req.body = body ? JSON.parse(body) : {};
        await handler(req, res);
      } catch (e) {
        console.error(`❌ Handler error for ${handlerName}:`, e);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Serve static frontend files
  const frontendDir = path.join(__dirname, "frontend", "dist");
  
  // Check if frontend/dist exists
  if (!fs.existsSync(frontendDir)) {
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(`
      <html>
        <body style="font-family: Arial; padding: 40px; max-width: 600px; margin: 0 auto;">
          <h1>⚠️ Frontend Not Built</h1>
          <p>The frontend hasn't been built yet. Please run:</p>
          <pre style="background: #f0f0f0; padding: 15px; border-radius: 5px;">cd frontend
npm install
npm run build
cd ..</pre>
          <p>Then restart the server.</p>
          <p style="color: #666; margin-top: 30px;">API is running at <code>/api/*</code></p>
        </body>
      </html>
    `);
  }

  let filePath = req.url === "/" ? path.join(frontendDir, "index.html") : path.join(frontendDir, req.url);

  // SPA fallback - serve index.html for non-existent files (except assets)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(frontendDir, "index.html");
  }

  const ext = path.extname(filePath);
  const contentTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
  };

  const contentType = contentTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Server error: " + err.message);
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    }
  });
});

// Initialize database before starting server
initDB().then(() => {
  const PORT = process.env.PORT || 3001;
  const HOST = process.env.HOST || "0.0.0.0";
  
  server.listen(PORT, HOST, () => {
    console.log(`✅ Server running on http://${HOST}:${PORT}`);
    console.log(`   GROQ_API_KEY:    ${process.env.GROQ_API_KEY ? "✅ found" : "❌ NOT SET"}`);
    console.log(`   ADMIN_EMAIL:     ${process.env.ADMIN_EMAIL || "❌ NOT SET"}`);
    console.log(`   ADMIN_PASSWORD:  ${process.env.ADMIN_PASSWORD ? "✅ found" : "❌ NOT SET"}`);
    console.log(`   DATABASE:        ✅ Text File (users.txt)`);
    console.log(``);
    console.log(`   📱 Frontend:     http://localhost:${PORT}`);
    console.log(`   🔌 API:          http://localhost:${PORT}/api/*`);
  });
}).catch(err => {
  console.error("❌ Failed to initialize database:", err);
  process.exit(1);
});
