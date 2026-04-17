import { verifyToken, getAllUsers, deleteUser, banUser, unbanUser } from "../lib/auth-textfile.js";

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

  try {
    const user = await verifyToken(token);
    if (!user.is_admin) {
      return send(403, { error: "Forbidden: not an admin" });
    }

    // LIST users
    if (req.method === "GET") {
      const users = await getAllUsers();
      return send(200, { users });
    }

    // POST actions: delete, ban, or unban
    if (req.method === "POST") {
      const { userId, action } = req.body;
      if (!userId || !action) return send(400, { error: "Missing userId or action" });

      if (action === "delete") {
        await deleteUser(userId);
        return send(200, { success: true });
      }

      if (action === "ban") {
        await banUser(userId);
        return send(200, { success: true });
      }

      if (action === "unban") {
        await unbanUser(userId);
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
