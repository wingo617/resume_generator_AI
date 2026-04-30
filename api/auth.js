import { signUp, signIn, verifyToken, signOut } from "../lib/auth-textfile.js";

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

  try {
    const url = req.url || "";
    
    // Sign up - /api/auth/signup or /api/auth?signup
    if (req.method === "POST" && (url.includes("/signup") || url.includes("signup"))) {
      const { email, password } = req.body;
      if (!email || !password) {
        return send(400, { error: "Email and password required" });
      }
      if (password.length < 6) {
        return send(400, { error: "Password must be at least 6 characters" });
      }

      const user = await signUp(email, password);
      return send(200, { 
        message: "Account created successfully. You can now log in.",
        user 
      });
    }

    // Sign in - /api/auth/signin or /api/auth?signin
    if (req.method === "POST" && (url.includes("/signin") || url.includes("signin") || url === "/api/auth" || url === "/api/auth/")) {
      const { email, password } = req.body;
      if (!email || !password) {
        return send(400, { error: "Email and password required" });
      }

      const result = await signIn(email, password);
      return send(200, result);
    }

    // Get current session (verify token) - /api/auth/session
    if (req.method === "GET" && (url.includes("/session") || url.includes("session"))) {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return send(200, { session: null, user: null });
      }

      try {
        const user = await verifyToken(token);
        return send(200, { 
          session: { access_token: token },
          user 
        });
      } catch (err) {
        return send(200, { session: null, user: null });
      }
    }

    // Sign out - /api/auth/signout
    if (req.method === "POST" && (url.includes("/signout") || url.includes("signout"))) {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (token) {
        await signOut(token);
      }
      return send(200, { success: true });
    }

    return send(404, { error: "Auth endpoint not found: " + url });
  } catch (err) {
    console.error("Auth error:", err);
    return send(400, { error: err.message });
  }
}
