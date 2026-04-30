import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
    if (key) process.env[key] = val;
  });
}

const handlers = {};
const apiDir = path.join(__dirname, "api");
for (const file of fs.readdirSync(apiDir)) {
  if (!file.endsWith(".js")) continue;
  const name = file.replace(".js", "");
  const mod = await import(`./api/${file}`);
  handlers[name] = mod.default;
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.end();

  const match = req.url?.match(/^\/api\/([^?]+)/);
  if (match) {
    const handlerName = match[1];
    const handler = handlers[handlerName];
    if (!handler) {
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
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(3001, () => {
  console.log("✅ API running on http://localhost:3001");
  console.log(`   GROQ_API_KEY:    ${process.env.GROQ_API_KEY ? "✅ found" : "❌ NOT SET"}`);
  console.log(`   GROQ key tail:   ...${(process.env.GROQ_API_KEY || "").slice(-4)}`);
  console.log(`   SUPABASE_URL:    ${process.env.SUPABASE_URL ? "✅ found" : "❌ NOT SET"}`);
  console.log(`   SERVICE_KEY:     ${process.env.SUPABASE_SERVICE_KEY ? "✅ found" : "❌ NOT SET"}`);
  console.log(`   ADMIN_EMAIL:     ${process.env.ADMIN_EMAIL || "❌ NOT SET"}`);
});