export default async function handler(req, res) {
  const send = (status, body) => {
    if (typeof res.status === "function") return res.status(status).json(body);
    res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    res.end(JSON.stringify(body));
  };

  res.setHeader?.("Access-Control-Allow-Origin", "*");
  res.setHeader?.("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader?.("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.end();

  // Verify admin token
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return send(401, { error: "Unauthorized" });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) return send(500, { error: "Supabase service key not configured" });

  // Verify the token is a valid Supabase session for the admin
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SERVICE_KEY },
  });
  const userData = await userRes.json();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!userData?.email || userData.email !== adminEmail) {
    return send(403, { error: "Forbidden: not an admin" });
  }

  const action = req.body?.action || req.url?.split("action=")[1];

  try {
    // LIST users
    if (req.method === "GET") {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=200`, {
        headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
      });
      const data = await r.json();
      return send(200, { users: data.users || [] });
    }

    // POST actions: delete or ban
    if (req.method === "POST") {
      const { userId, action } = req.body;
      if (!userId || !action) return send(400, { error: "Missing userId or action" });

      if (action === "delete") {
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
        });
        return send(200, { success: true });
      }

      if (action === "ban") {
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ ban_duration: "876000h" }), // ~100 years
        });
        return send(200, { success: true });
      }

      if (action === "unban") {
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ ban_duration: "none" }),
        });
        return send(200, { success: true });
      }

      return send(400, { error: "Unknown action" });
    }

    return send(405, { error: "Method not allowed" });
  } catch (err) {
    console.error("Admin error:", err);
    return send(500, { error: err.message });
  }
}
